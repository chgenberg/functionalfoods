# src/matcher.py
import numpy as np, unidecode, rapidfuzz
from index import FLAT, PHRASES, EMB, MODEL, _tests
from datastore import load_config

_cfg = load_config()
FUZZY_T = _cfg.get("fuzzy_threshold", 85)
EMB_T   = _cfg.get("embedding_threshold", 0.35)

def _norm(txt: str) -> str:
    import re
    return re.sub(r"[^\w\s]", " ", unidecode.unidecode(txt.lower())).strip()

def match_test(query: str, lang="en", topk=3):
    q = _norm(query)
    candidates = {}

    # 1) Direkt exact hit
    if q in FLAT:
        tid = FLAT[q]
        candidates[tid] = candidates.get(tid, 0) + 100  # max score

    # 2) RapidFuzz mot alla fraser
    hits = rapidfuzz.process.extract(
        q, FLAT.keys(), scorer=rapidfuzz.fuzz.token_set_ratio, limit=20)
    for phrase, score, _ in hits:
        if score >= FUZZY_T:
            tid = FLAT[phrase]
            candidates[tid] = max(candidates.get(tid, 0), score)

    # 3) Embedding fallback om inga starka träffar
    if not candidates:
        q_vec = MODEL.encode(q, normalize_embeddings=True)
        sims  = np.dot(EMB, q_vec)
        for idx in np.argpartition(-sims, 10)[:10]:     # topp-10
            if sims[idx] >= EMB_T:
                tid = FLAT[PHRASES[idx]]
                emb_score = int(sims[idx] * 90)
                candidates[tid] = max(candidates.get(tid, 0), emb_score)

    # 4) Bygg resultatlista
    results = sorted(
        [(tid, score, _tests[tid]) for tid, score in candidates.items()],
        key=lambda x: x[1],
        reverse=True)[:topk]

    return results

# Exempel på användning:
if __name__ == "__main__":
    query = "I feel stuffed after pastries"
    matches = match_test(query, lang="en")
    for test_id, score, test in matches:
        print(f"Match: {test['name']} (score: {score})")