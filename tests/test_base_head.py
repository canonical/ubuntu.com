import unittest

from bs4 import BeautifulSoup

from webapp.app import app


class TestBaseHead(unittest.TestCase):
    """The base <head> holds nothing that blocks the first render"""

    def test_head_has_no_blocking_extras(self):
        app.testing = True
        html = app.test_client().get("/about").get_data(as_text=True)
        head = BeautifulSoup(html, "html.parser").head
        self.assertNotIn("lazysizes", str(head))
        self.assertIsNone(head.select_one('link[href*="cookie-policy.css"]'))
        for src in ("cookie-policy.js", "cookie-policy-with-callback.js"):
            script = head.select_one(f'script[src*="{src}"]')
            self.assertTrue(script.has_attr("defer"))
        self.assertEqual(head.select('link[rel="preconnect"]'), [])


if __name__ == "__main__":
    unittest.main()
