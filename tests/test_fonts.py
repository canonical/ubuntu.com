import re
import unittest

from bs4 import BeautifulSoup

from webapp.app import app


class TestLocalFonts(unittest.TestCase):
    """Fonts are preloaded from the URLs the @font-face rules load"""

    def test_preloads_match_font_faces(self):
        app.testing = True
        html = app.test_client().get("/about").get_data(as_text=True)
        soup = BeautifulSoup(html, "html.parser")
        preloads = [
            link["href"] for link in soup.select("link[rel=preload][as=font]")
        ]
        faces = re.findall(r'src: url\("([^"]+)"\)', html)
        self.assertEqual(len(preloads), 1)
        self.assertIn("ubuntu-variable-latin.woff2", preloads[0])
        self.assertIn(preloads[0], faces)
        self.assertEqual(html.count("font-display: swap"), 3)


if __name__ == "__main__":
    unittest.main()
