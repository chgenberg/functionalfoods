# src/index.py
import yaml, pathlib
from sentence_transformers import SentenceTransformer

DATA = pathlib.Path(__file__).resolve().parent.parent / "data"
_kw = yaml.safe_load((DATA / "symptom_keywords_bilingual.yaml").read_text())
_tests = yaml.safe_load((DATA / "tests.yaml").read_text())

# 1) Flat dict  phrase → test_id  (alla språk)
FLAT = {phrase: tid
        for tid, obj in _kw.items()
        for phrase in obj["sv"] + obj["en"]}

# 2) Embeddings
MODEL = SentenceTransformer("sentence-transformers/distiluse-base-multilingual-cased")
PHRASES = list(FLAT.keys())
EMB = MODEL.encode(PHRASES, normalize_embeddings=True)