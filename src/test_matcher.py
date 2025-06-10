# src/test_matcher.py
import unittest
from matcher import match_test

class TestMatcher(unittest.TestCase):
    def test_exact_match(self):
        # Testa en exakt fras som finns i YAML
        results = match_test("bloated stomach", lang="en")
        self.assertTrue(any("Gut Microbiome" in r[2]["name"] for r in results))

    def test_fuzzy_match(self):
        # Testa en felstavad/friare fras
        results = match_test("bloted stomac", lang="en")
        self.assertTrue(any("Gut Microbiome" in r[2]["name"] for r in results))

    def test_semantic_match(self):
        # Testa en semantisk fras som inte finns exakt
        results = match_test("I feel stuffed after pastries", lang="en")
        self.assertTrue(len(results) > 0)

if __name__ == "__main__":
    unittest.main()