import os
import re
import asyncio
import json
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any, Tuple

from tenacity import retry, stop_after_attempt, wait_fixed
from pydantic import BaseModel
from dotenv import load_dotenv
from bs4 import BeautifulSoup

from pathlib import Path
import argparse
import urllib.parse
import urllib.request

from playwright.async_api import async_playwright, Page, Browser, BrowserContext, TimeoutError as PWTimeoutError


class RecipeRecord(BaseModel):
    post_id: int
    url: str
    title: str
    benefit_html: str
    benefit_text: str
    recept_delar: List[Dict[str, Any]]
    gor_sa_har_html: str
    gor_sa_har_text: str
    featured_image_url: Optional[str] = None
    featured_image_original_filename: Optional[str] = None
    featured_image_local_path: Optional[str] = None


def env_bool(value: Optional[str], default: bool = True) -> bool:
    if value is None or value == "":
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "y"}


def sanitize_filename(name: str) -> str:
    name = name.strip()
    trans = str.maketrans({
        "å": "a", "ä": "a", "ö": "o",
        "Å": "A", "Ä": "A", "Ö": "O",
    })
    name = name.translate(trans)
    name = re.sub(r"[\\/:*?\"<>|]+", "-", name)
    name = re.sub(r"\s+", " ", name)
    return name


def parse_base_amount_and_unit(ingredient_label: str) -> Tuple[Optional[float], Optional[str]]:
    # Expect patterns like "ägg (1 st)", "kokosmjölk (100 ml)", etc.
    m = re.search(r"\(([^)]+)\)$", ingredient_label.strip())
    if not m:
        return None, None
    inside = m.group(1).strip()
    m2 = re.match(r"([0-9]+(?:[\.,][0-9]+)?)\s*([A-Za-zåäöÅÄÖ]+)", inside)
    if not m2:
        return None, None
    amount_str = m2.group(1).replace(",", ".")
    try:
        amount = float(amount_str)
    except Exception:
        return None, None
    unit = m2.group(2)
    return amount, unit


def parse_multiplier(value: str) -> Tuple[Optional[float], Optional[str]]:
    """Return numeric multiplier if possible, else treat as note (e.g., Topping)."""
    if value is None:
        return None, None
    s = value.strip()
    if not s:
        return None, None
    s_norm = s.replace(",", ".")
    try:
        return float(s_norm), None
    except Exception:
        return None, s  # note


async def login(page: Page, base_url: str, username: str, password: str) -> None:
    login_url = f"{base_url}/wp-login.php?wp_lang=sv_SE"
    await page.goto(login_url, wait_until="domcontentloaded")
    await page.fill("#user_login", username)
    await page.fill("#user_pass", password)
    await page.click("#wp-submit")
    try:
        await page.wait_for_selector("#wpadminbar", timeout=10000)
    except PWTimeoutError:
        current = page.url
        if "wp-login.php" in current:
            raise RuntimeError("Login failed; still on login page.")


async def get_total_pages(page: Page) -> int:
    total = 1
    try:
        total_text = await page.locator(".tablenav-pages .total-pages").first.text_content()
        if total_text:
            total = int(re.sub(r"[^0-9]", "", total_text)) or 1
    except Exception:
        pass
    if total == 1:
        try:
            max_attr = await page.locator(".tablenav-pages input.current-page" ).first.get_attribute("max")
            if max_attr and max_attr.isdigit():
                total = int(max_attr)
        except Exception:
            pass
    return max(1, total)


async def collect_all_edit_links(page: Page, listing_url: str, max_posts: int = 0) -> List[str]:
    links: List[str] = []
    await page.goto(listing_url, wait_until="domcontentloaded")
    total_pages = await get_total_pages(page)
    for page_num in range(1, total_pages + 1):
        page_url = f"{listing_url}&paged={page_num}"
        await page.goto(page_url, wait_until="domcontentloaded")
        row_links = await page.locator("#the-list .row-title").element_handles()
        for handle in row_links:
            href = await handle.get_attribute("href")
            if href and "post.php?post=" in href:
                links.append(href)
                if max_posts and len(links) >= max_posts:
                    return links
    return links


async def get_input_value_safe(page: Page, selector: str) -> str:
    loc = page.locator(selector)
    if await loc.count() == 0:
        return ""
    try:
        return await loc.first.input_value()
    except Exception:
        try:
            return await loc.first.text_content() or ""
        except Exception:
            return ""


async def ensure_text_mode_in_editor(container: Page) -> None:
    text_tab = container.locator(".wp-editor-tabs a, .wp-editor-tabs button").filter(has_text="Text")
    if await text_tab.count() > 0:
        try:
            await text_tab.first.click()
        except Exception:
            pass


async def extract_benefit(page: Page) -> Dict[str, str]:
    textarea = page.locator("textarea#content")
    if await textarea.count() == 0:
        text_tab = page.locator("#content-html, .wp-editor-tabs a:has-text('Text')")
        if await text_tab.count() > 0:
            try:
                await text_tab.first.click()
            except Exception:
                pass
    value = await get_input_value_safe(page, "textarea#content")
    html = value.strip()
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(" ", strip=True)
    return {"html": html, "text": text}


async def extract_gor_sa_har(page: Page) -> Dict[str, str]:
    container = page.locator(
        "xpath=//label[contains(normalize-space(.), 'Gör så här')]/ancestor::*[contains(@class,'acf-field')][1]"
    )
    if await container.count() == 0:
        return {"html": "", "text": ""}
    await ensure_text_mode_in_editor(container)
    textarea = container.locator("textarea")
    html = ""
    if await textarea.count() > 0:
        try:
            html = (await textarea.first.input_value()).strip()
        except Exception:
            html = (await textarea.first.text_content() or "").strip()
    else:
        iframe = container.locator("iframe[id*='ifr']")
        if await iframe.count() > 0:
            try:
                frame = await iframe.first.content_frame()
                html = await frame.eval_on_selector("body", "el => el.innerHTML")
            except Exception:
                html = ""
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text(" ", strip=True)
    return {"html": html, "text": text}


async def extract_recept_delar(page: Page) -> List[Dict[str, Any]]:
    container = page.locator(
        "xpath=(//label[contains(normalize-space(.), 'Recept delar')]/ancestor::*[contains(@class,'acf-field')])[1]"
    )
    if await container.count() == 0:
        container = page.locator(
            "xpath=(//h2[contains(normalize-space(.), 'Recept delar')]/ancestor::div[contains(@class,'postbox')])[1]"
        )
        if await container.count() == 0:
            return []
    # Scope down to the nested repeater labelled 'Ingredienser'
    ing_scope = container.locator(
        "xpath=(.//label[contains(normalize-space(.), 'Ingredienser')]/ancestor::*[contains(@class,'acf-field')])[1]"
    )
    scope = ing_scope if (await ing_scope.count()) > 0 else container

    # Prefer strict ACF repeater row selector and ignore clone/template rows
    rows = scope.locator(".acf-repeater .acf-table tbody tr.acf-row:not(.acf-clone)")
    if await rows.count() == 0:
        rows = scope.locator("tr.acf-row:not(.acf-clone), div.acf-row:not(.acf-clone)")
    items: List[Dict[str, Any]] = []
    num_rows = await rows.count()
    for i in range(num_rows):
        row = rows.nth(i)
        selects = row.locator("select")
        ingredient = ""
        if await selects.count() > 0:
            try:
                selected = await selects.first.element_handle()
                if selected:
                    option = await selected.query_selector("option:checked")
                    if option:
                        ingredient = (await option.text_content() or "").strip()
            except Exception:
                pass
        quantity = ""
        try:
            if await selects.count() >= 2:
                qsel = selects.nth(1)
                qel = await qsel.element_handle() if await qsel.count() > 0 else None
                opt = await qel.query_selector("option:checked") if qel else None
                if opt:
                    quantity = (await opt.text_content() or "").strip()
        except Exception:
            pass
        if not quantity:
            qty_input = row.locator("input[type='number'], input[type='text']").first
            if await qty_input.count() > 0:
                try:
                    quantity = (await qty_input.input_value()).strip()
                except Exception:
                    quantity = (await qty_input.text_content() or "").strip()
        checkbox = row.locator("input[type='checkbox']")
        is_functional = False
        if await checkbox.count() > 0:
            try:
                is_functional = await checkbox.first.is_checked()
            except Exception:
                is_functional = False
        ingredient = ingredient.strip()
        quantity = (quantity or "").strip()
        if not ingredient and not quantity:
            continue
        base_amount, base_unit = parse_base_amount_and_unit(ingredient)
        multiplier, note = parse_multiplier(quantity)
        final_amount: Optional[float] = None
        final_unit: Optional[str] = base_unit
        if base_amount is not None and multiplier is not None:
            try:
                final_amount = round(base_amount * multiplier, 3)
            except Exception:
                final_amount = None
        items.append({
            "ingredient_label": ingredient,
            "base_amount": base_amount,
            "base_unit": base_unit,
            "multiplier": multiplier,
            "quantity_raw": quantity,
            "note": note,
            "final_amount": final_amount,
            "final_unit": final_unit,
            "is_functional": is_functional,
        })

    # De-duplicate by ingredient_label, keep the most informative row (with numeric multiplier/final_amount)
    seen: Dict[str, Dict[str, Any]] = {}
    order: List[str] = []
    def score(it: Dict[str, Any]) -> int:
        s = 0
        if it.get("multiplier") is not None:
            s += 2
        if it.get("final_amount") is not None:
            s += 2
        if it.get("note"):
            s -= 1
        return s
    for it in items:
        key = it["ingredient_label"]
        if key not in seen:
            seen[key] = it
            order.append(key)
        else:
            if score(it) > score(seen[key]):
                seen[key] = it
    return [seen[k] for k in order]


async def extract_featured_image(page: Page, recipe_title: str, images_dir: Path) -> Dict[str, Optional[str]]:
    details_url = None
    filename = None
    local_path_str = None
    trigger = page.locator("#set-post-thumbnail")
    box = trigger if (await trigger.count()) > 0 else page.locator("#postimagediv .inside a, #postimagediv .inside img")
    try:
        if await box.count() > 0:
            await box.first.click()
            await page.wait_for_selector(".media-modal", timeout=8000)
            candidate = page.locator(
                "xpath=(//div[contains(@class,'media-modal')]//a[regex(@href, '\\.(?:jpg|jpeg|png|webp|gif)(?:\\?.*)?$')])[1]"
            )
            if await candidate.count() > 0:
                details_url = await candidate.first.get_attribute("href")
                filename = (await candidate.first.text_content() or "").strip() or os.path.basename(urllib.parse.urlparse(details_url).path)
            if not details_url:
                preview = page.locator(".media-modal .attachment-media-view img")
                if await preview.count() > 0:
                    src = await preview.first.get_attribute("src")
                    if src:
                        src = re.sub(r"-\d+x\d+(?=\.(?:jpg|jpeg|png|webp|gif)(?:\?.*)?$)", "", src)
                        src = re.sub(r"-scaled(?=\.(?:jpg|jpeg|png|webp|gif)(?:\?.*)?$)", "", src)
                        details_url = src
                        filename = os.path.basename(urllib.parse.urlparse(details_url).path)
            try:
                await page.locator("button.media-modal-close").click()
            except Exception:
                await page.keyboard.press("Escape")
    except Exception:
        pass
    if not details_url:
        thumb = page.locator("#postimagediv img[src]")
        if await thumb.count() > 0:
            src = await thumb.first.get_attribute("src")
            if src:
                src = re.sub(r"-\d+x\d+(?=\.(?:jpg|jpeg|png|webp|gif)(?:\?.*)?$)", "", src)
                src = re.sub(r"-scaled(?=\.(?:jpg|jpeg|png|webp|gif)(?:\?.*)?$)", "", src)
                details_url = src
                filename = os.path.basename(urllib.parse.urlparse(details_url).path)
    if details_url:
        try:
            images_dir.mkdir(parents=True, exist_ok=True)
            parsed = urllib.parse.urlparse(details_url)
            _, ext = os.path.splitext(parsed.path)
            ext = ext or ".jpg"
            safe_title = sanitize_filename(recipe_title)
            local_path = images_dir / f"{safe_title}{ext}"
            urllib.request.urlretrieve(details_url, local_path.as_posix())
            local_path_str = str(local_path)
        except Exception:
            pass
    return {
        "featured_image_url": details_url,
        "featured_image_original_filename": filename,
        "featured_image_local_path": local_path_str,
    }


async def extract_recipe(page: Page, url: str, out_debug_dir: Path) -> RecipeRecord:
    await page.goto(url, wait_until="domcontentloaded")
    m = re.search(r"post=(\d+)", page.url)
    post_id = int(m.group(1)) if m else -1
    title = await get_input_value_safe(page, "#title, input#title")
    benefit = await extract_benefit(page)
    delar = await extract_recept_delar(page)
    gor = await extract_gor_sa_har(page)
    images_dir = Path("data/images")
    fi = await extract_featured_image(page, title.strip(), images_dir)
    record = RecipeRecord(
        post_id=post_id,
        url=page.url,
        title=title.strip(),
        benefit_html=benefit["html"],
        benefit_text=benefit["text"],
        recept_delar=delar,
        gor_sa_har_html=gor["html"],
        gor_sa_har_text=gor["text"],
        featured_image_url=fi["featured_image_url"],
        featured_image_original_filename=fi["featured_image_original_filename"],
        featured_image_local_path=fi["featured_image_local_path"],
    )
    try:
        out_debug_dir.mkdir(parents=True, exist_ok=True)
        html_path = out_debug_dir / f"post_{post_id}.html"
        html = await page.content()
        html_path.write_text(html, encoding="utf-8")
    except Exception:
        pass
    return record


async def run(username: str, password: str, base_url: str, post_type: str, out_path: Path, out_csv: Optional[Path], max_posts: int, headless: bool) -> None:
    listing_url = f"{base_url}/wp-admin/edit.php?post_type={post_type}"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if out_csv:
        out_csv.parent.mkdir(parents=True, exist_ok=True)
    ingredients_csv = Path("data/ingredients.csv")
    ingredients_csv.parent.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as pw:
        browser: Browser = await pw.chromium.launch(headless=headless)
        context: BrowserContext = await browser.new_context()
        page: Page = await context.new_page()

        await login(page, base_url, username, password)
        links = await collect_all_edit_links(page, listing_url, max_posts=max_posts)

        debug_dir = Path("data/debug")
        count = 0
        jsonl_file = out_path.open("w", encoding="utf-8")
        csv_file = out_csv.open("w", encoding="utf-8") if out_csv else None
        ing_csv_file = ingredients_csv.open("w", encoding="utf-8")
        if csv_file:
            csv_file.write("post_id\ttitle\tbenefit_text\tgor_sa_har_text\tfeatured_image_url\tfeatured_image_path\n")
        ing_csv_file.write("post_id\ttitle\tingredient_label\tbase_amount\tbase_unit\tmultiplier\tfinal_amount\tfinal_unit\tnote\tis_functional\n")

        try:
            for link in links:
                rec = await extract_recipe(page, link, debug_dir)
                jsonl_file.write(json.dumps(rec.dict(), ensure_ascii=False) + "\n")
                if csv_file:
                    csv_file.write(f"{rec.post_id}\t{rec.title}\t{rec.benefit_text}\t{rec.gor_sa_har_text}\t{rec.featured_image_url or ''}\t{rec.featured_image_local_path or ''}\n")
                # Flatten ingredients to CSV
                for ing in rec.recept_delar:
                    ing_csv_file.write(
                        f"{rec.post_id}\t{rec.title}\t{ing.get('ingredient_label','')}\t{ing.get('base_amount','')}\t{ing.get('base_unit','')}\t{ing.get('multiplier','')}\t{ing.get('final_amount','')}\t{ing.get('final_unit','')}\t{(ing.get('note','') or '').replace('\t',' ')}\t{1 if ing.get('is_functional') else 0}\n"
                    )
                count += 1
                print(f"Scraped {count}/{len(links)}: {rec.post_id} {rec.title}")
        finally:
            jsonl_file.close()
            if csv_file:
                csv_file.close()
            ing_csv_file.close()
            await context.close()
            await browser.close()


def main():
    load_dotenv()

    parser = argparse.ArgumentParser(description="Scrape FunctionalFoods WordPress recipes")
    parser.add_argument("--username", default=os.getenv("WP_USERNAME"))
    parser.add_argument("--password", default=os.getenv("WP_PASSWORD"))
    parser.add_argument("--base", default=os.getenv("BASE_URL", "https://functionalfoods.se"))
    parser.add_argument("--post-type", default=os.getenv("POST_TYPE", "recipe_logged_in"))
    parser.add_argument("--out", default=os.getenv("OUTPUT_PATH", "./data/recipes.jsonl"))
    parser.add_argument("--csv", default=None)
    parser.add_argument("--max", type=int, default=int(os.getenv("MAX_POSTS", "0") or 0))
    parser.add_argument("--headless", default=os.getenv("HEADLESS", "true"))

    args = parser.parse_args()

    if not args.username or not args.password:
        raise SystemExit("Missing credentials. Set --username/--password or .env WP_USERNAME/WP_PASSWORD")

    out_path = Path(args.out)
    out_csv = Path(args.csv) if args.csv else None

    headless = env_bool(args.headless, True)

    asyncio.run(
        run(
            username=args.username,
            password=args.password,
            base_url=args.base,
            post_type=args.post_type,
            out_path=out_path,
            out_csv=out_csv,
            max_posts=args.max,
            headless=headless,
        )
    )


if __name__ == "__main__":
    main() 