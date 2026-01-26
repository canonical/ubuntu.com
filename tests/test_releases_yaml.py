import re
import yaml
from pathlib import Path
from unittest import TestCase


class TestReleasesYamlReferences(TestCase):
    """
    Validates that all `releases_yaml.X` references in templates
    correspond to actual fields in releases.yaml
    """

    @classmethod
    def setUpClass(cls):
        with open("releases.yaml", "r") as f:
            cls.releases_data = yaml.safe_load(f)

        cls.valid_paths = set()
        cls._build_paths(cls.releases_data, "releases_yaml", cls.valid_paths)

        cls.project_root = Path(__file__).parent.parent

    @classmethod
    def _build_paths(cls, data, prefix, paths):
        """Builds a list of valid paths from releases.yaml"""
        paths.add(prefix)
        if isinstance(data, dict):
            for key, value in data.items():
                cls._build_paths(value, f"{prefix}.{key}", paths)

    def _find_template_files(self):
        templates_dir = self.project_root / "templates"
        return list(templates_dir.rglob("*.html"))

    def _extract_releases_references(self, content, pattern):
        """Extract all releases_yamls.X.Y.Z references from content."""
        matches = pattern.findall(content)
        references = []
        for match in matches:
            # Clean up the path, removes trailing punctuation, brackets, etc.
            path = re.sub(r"[\s\|\}\)\]\,\:\;]+$", "", match)
            path = re.sub(r"\[.*$", "", path)
            if path:
                references.append(f"releases_yaml.{path}")
        return references

    def test_template_references_exist(self):
        """
        Test that all releases_yaml references in html exist in releases.yaml
        """
        pattern = re.compile(r"releases_yaml\.([a-zA-Z0-9_\.]+)")

        template_files = self._find_template_files()

        for filepath in template_files:
            try:
                with open(
                    filepath, "r", encoding="utf-8", errors="ignore"
                ) as f:
                    content = f.read()
            except Exception:
                continue

            refs = self._extract_releases_references(content, pattern)
            relative_path = filepath.relative_to(self.project_root)

            for ref in refs:
                with self.subTest(file=str(relative_path), reference=ref):
                    self.assertTrue(
                        ref in self.valid_paths,
                        f"'{ref}' not found in releases.yaml"
                        f"(file: {relative_path})",
                    )
