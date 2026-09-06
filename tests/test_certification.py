# Packages
from vcr_unittest import VCRTestCase

# Local
from webapp.app import app


class TestCertification(VCRTestCase):
    def _get_vcr_kwargs(self):
        """
        This removes the authorization header
        from VCR so we don't record auth parameters
        """
        return {
            "decode_compressed_response": True,
            "filter_headers": [
                "Authorization",
                "Cookie",
                "Api-Key",
                "Api-Username",
            ],
        }

    def setUp(self):
        app.testing = True
        self.client = app.test_client()
        return super().setUp()

    def test_home(self):
        response = self.client.get("/certified")
        self.assertEqual(response.status_code, 200)

    def test_search_redirect(self):
        response = self.client.get(
            "/certified?q=xps&category=Laptop&category=Desktop&vendor=Dell"
        )
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.headers.get("Location"),
            "/certified/search"
            "?q=xps&category=Laptop&category=Desktop&vendor=Dell",
        )

    def test_search_results(self):
        response = self.client.get(
            "/certified/search"
            "?q=xps&category=Laptop&category=Desktop&vendor=Dell"
        )
        self.assertEqual(response.status_code, 200)

    def test_model_details(self):
        response = self.client.get("/certified/201807-26311")
        self.assertEqual(response.status_code, 200)

    def test_hardware_details(self):
        response = self.client.get("/certified/201906-27091/18.04%20LTS")
        self.assertEqual(response.status_code, 200)

    def test_component_details(self):
        response = self.client.get("/certified/component/682")
        self.assertEqual(response.status_code, 200)

    def test_platform_details(self):
        response = self.client.get("/certified/platforms/14169")
        self.assertEqual(response.status_code, 200)

    def test_vendor_redirect(self):
        response = self.client.get("/certified/vendors/HP")
        self.assertEqual(response.status_code, 302)
        self.assertEqual(
            response.headers.get("Location"), "/certified/search?vendor=HP"
        )

    def test_vendor_pages(self):
        response = self.client.get("/certified/search?vendor=HP")
        self.assertEqual(response.status_code, 200)

    def test_filters_json(self):
        response = self.client.get("/certified/filters.json")
        self.assertIsInstance(response.json, dict)
        # If below test fails data structure changed
        # so please change it also in the certified-search-results.js
        self.assertIn("release_filters", response.json.keys())
        self.assertIn("vendor_filters", response.json.keys())

    def test_autocomplete_min_chars(self):
        response = self.client.get("/certified/autocomplete.json?q=ab")
        self.assertEqual(response.json, {"suggestions": []})

    def test_autocomplete_dedupes_and_caps(self):
        response = self.client.get("/certified/autocomplete.json?q=lat")
        self.assertEqual(
            response.json,
            {
                "suggestions": [
                    {"model": "Latitude 5420", "make": "Dell"},
                    {"model": "latitude 5421", "make": "Dell"},
                    {"model": "Latitude 7420", "make": "Dell"},
                    {"model": "Latitude 9420", "make": "Dell"},
                    {"model": "Latitude 5430", "make": "Dell"},
                ]
            },
        )

    def test_autocomplete_passes_through_filters(self):
        response = self.client.get(
            "/certified/autocomplete.json"
            "?q=lat&category=Laptop&vendor=Dell&release=22.04"
        )
        self.assertEqual(
            response.json,
            {"suggestions": [{"model": "Latitude 5420", "make": "Dell"}]},
        )

    def test_autocomplete_matches_vendor_name(self):
        # "alienware" matches no model name directly, only the make field -
        # suggestions must still carry the full model name, never just the
        # vendor name
        response = self.client.get("/certified/autocomplete.json?q=alienware")
        self.assertEqual(
            response.json,
            {
                "suggestions": [
                    {
                        "model": (
                            "16 Aurora (Core 5 210H, GeForce RTX 3050 6GB)"
                        ),
                        "make": "Alienware",
                    },
                    {
                        "model": (
                            "16 Aurora (Core 7 240H, GeForce RTX 4050 Max-Q)"
                        ),
                        "make": "Alienware",
                    },
                    {
                        "model": (
                            "16 Aurora (Core 7 240H, GeForce RTX 5050 Max-Q)"
                        ),
                        "make": "Alienware",
                    },
                    {
                        "model": (
                            "16 Aurora (Core 9 270H, GeForce RTX 5060 Max-Q)"
                        ),
                        "make": "Alienware",
                    },
                    {
                        "model": (
                            "16 Aurora (Core 9 270H, GeForce RTX 5070 Max-Q)"
                        ),
                        "make": "Alienware",
                    },
                ]
            },
        )

    def test_autocomplete_matches_vendor_and_model(self):
        # "dell xps" spans both fields - neither "make" nor "model" alone
        # contains the whole phrase, so this requires the word-boundary
        # split fallback (make="dell", model="xps")
        response = self.client.get("/certified/autocomplete.json?q=dell+xps")
        self.assertEqual(
            response.json,
            {
                "suggestions": [
                    {"model": "XPS 13 7390", "make": "Dell"},
                    {"model": "XPS 13 9300", "make": "Dell"},
                    {"model": "XPS 13 9310", "make": "Dell"},
                    {
                        "model": "XPS 13 9340 (3K OLED Touchscreen)",
                        "make": "Dell",
                    },
                    {
                        "model": "XPS 13 9340 (Full HD Screen)",
                        "make": "Dell",
                    },
                ]
            },
        )

    def test_note_rendering(self):
        """
        Test that basic markdown elements are rendered correctly.
        Raw HTML should be escaped
        """
        response = self.client.get("/certified/202301-31183")
        content = response.data.decode("utf-8")

        # Check for headings
        self.assertIn("<h1>Heading 1</h1>", content)
        self.assertIn("<h2>Heading 2</h2>", content)

        # Check for formatting
        self.assertIn("<strong>Bold text</strong>", content)
        self.assertIn("<em>Italic text</em>", content)

        # Check for links
        self.assertIn('<a href="https://example.com">Link text</a>', content)

        # Check for lists
        self.assertIn("<li>List item 1</li>", content)
        self.assertIn("<li>List item 2</li>", content)

        # HTML should be escaped and not interpreted
        self.assertNotIn("<script>alert('XSS attack');</script>", content)
        self.assertNotIn('<div class="dangerous">', content)
        self.assertNotIn("<img src=\"javascript:alert('XSS')\" />", content)

        self.assertIn("&lt;script&gt;", content)
        self.assertIn("&lt;div class=&quot;dangerous&quot;&gt;", content)
        self.assertIn("&lt;img src=", content)
