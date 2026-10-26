import unittest

from bs4 import BeautifulSoup

from webapp.app import app


class TestNavigationAria(unittest.TestCase):
    """The top nav menu only owns menu items"""

    def test_menu_items_have_valid_parents(self):
        app.testing = True
        html = app.test_client().get("/about").get_data(as_text=True)
        soup = BeautifulSoup(html, "html.parser")
        for menu in soup.select('[role="menu"]'):
            for li in menu.find_all("li", recursive=False):
                self.assertIn(li.get("role"), ("none", "menuitem"), li)
                if li.get("role") == "none" and li.find(["a", "button"]):
                    item = li.find(["a", "button"])
                    self.assertEqual(item.get("role"), "menuitem", item)


if __name__ == "__main__":
    unittest.main()
