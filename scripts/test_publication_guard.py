"""Synthetic regression tests for the public-information signature scanner."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import publication_guard as guard


class PublicationGuardTests(unittest.TestCase):
    def test_sensitive_path(self):
        self.assertTrue(guard.scan_name("assets/" + ".env"))
        self.assertTrue(guard.scan_name("cache/" + "capture.zip"))
        self.assertFalse(guard.scan_name("ontology/components.json"))
        self.assertFalse(guard.scan_name("site/model.js"))

    def test_synthetic_credentials(self):
        candidate = "token=" + "ghp_" + ("a" * 30)
        self.assertTrue(guard.scan_content("synthetic.txt", candidate))

    def test_transcript_markers(self):
        marker = "<|" + "im_start" + "|>"
        self.assertTrue(guard.scan_content("synthetic.txt", marker))
        role = "USER" + ": synthetic test input"
        self.assertTrue(guard.scan_content("synthetic.txt", role))

    def test_architecture_content_allowed(self):
        prose = "The entablature consists of the architrave, frieze, and cornice."
        self.assertFalse(guard.scan_content("ontology/example.txt", prose))


if __name__ == "__main__":
    unittest.main()
