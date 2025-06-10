import yaml, json, pathlib, functools

DATA_DIR = pathlib.Path(__file__).resolve().parent.parent / "data"

@functools.lru_cache(maxsize=None)
def load_tests():
    return yaml.safe_load((DATA_DIR / "tests.yaml").read_text())

@functools.lru_cache(maxsize=None)
def load_keywords():
    return yaml.safe_load((DATA_DIR / "symptom_keywords_bilingual.yaml").read_text())

@functools.lru_cache(maxsize=None)
def load_qbank():
    return json.loads((DATA_DIR / "qbank.json").read_text())

def load_config():
    import yaml, pathlib
    cfg_path = pathlib.Path(__file__).resolve().parent.parent / "config" / "config.yaml"
    return yaml.safe_load(cfg_path.read_text())