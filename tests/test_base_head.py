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
        # cookie-policy.js creates dataLayer and the consent default, which
        # inline scripts and GTM need before the page finishes parsing
        policy = head.select_one('script[src*="/cookie-policy.js"]')
        self.assertFalse(policy.has_attr("defer"))
        callback = head.select_one('script[src*="cookie-policy-with-"]')
        self.assertTrue(callback.has_attr("defer"))
        preconnects = {
            link["href"] for link in head.select('link[rel="preconnect"]')
        }
        self.assertEqual(
            preconnects,
            {"https://assets.ubuntu.com", "https://res.cloudinary.com"},
        )


if __name__ == "__main__":
    unittest.main()
