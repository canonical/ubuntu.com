import unittest

from webapp.marketo_stats import php_serialize


class TestPhpSerialize(unittest.TestCase):
    def test_parses_flat_string_map(self):
        blob = 'a:2:{s:6:"formid";s:4:"3485";s:5:"title";s:2:"IT";}'
        self.assertEqual(
            php_serialize.loads(blob),
            {"formid": "3485", "title": "IT"},
        )

    def test_parses_url_containing_delimiters(self):
        url = "https://ubuntu.com/core?a=1&b=2;c"
        blob = 'a:1:{s:15:"acquisition_url";s:%d:"%s";}' % (len(url), url)
        self.assertEqual(php_serialize.loads(blob), {"acquisition_url": url})

    def test_parses_value_containing_quotes(self):
        value = 'he said "hi"'
        blob = 'a:1:{s:4:"note";s:%d:"%s";}' % (len(value), value)
        self.assertEqual(php_serialize.loads(blob), {"note": value})

    def test_lengths_are_byte_counts_not_character_counts(self):
        # "München" is 7 characters but 8 bytes in UTF-8. PHP writes 8.
        value = "München"
        blob = 'a:1:{s:4:"city";s:%d:"%s";}' % (
            len(value.encode("utf-8")),
            value,
        )
        self.assertEqual(php_serialize.loads(blob), {"city": value})

    def test_parses_int_and_bool_and_null(self):
        blob = 'a:3:{s:1:"i";i:42;s:1:"b";b:1;s:1:"n";N;}'
        self.assertEqual(
            php_serialize.loads(blob), {"i": 42, "b": True, "n": None}
        )

    def test_rejects_truncated_blob(self):
        with self.assertRaises(ValueError):
            php_serialize.loads('a:2:{s:6:"formid";s:4:"3485";}')

    def test_rejects_non_array_root(self):
        with self.assertRaises(ValueError):
            php_serialize.loads('s:3:"abc";')

    def test_rejects_garbage(self):
        with self.assertRaises(ValueError):
            php_serialize.loads("not a blob at all")


if __name__ == "__main__":
    unittest.main()
