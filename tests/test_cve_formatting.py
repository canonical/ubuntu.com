from unittest import TestCase

from webapp.security.helpers import format_cve_mitigation


class TestFormatCveMitigation(TestCase):
    def test_empty_or_whitespace_returns_empty_string(self):
        self.assertEqual(format_cve_mitigation(""), "")
        self.assertEqual(format_cve_mitigation(None), "")
        self.assertEqual(format_cve_mitigation("\n   \n\u2800\n"), "")

    def test_plain_text_preserves_newlines_and_dedents_common_indent(self):
        raw = (
            "\n  In `/etc/bluetooth/input.conf` set `ClassicBondedOnly=true`\n"
            "  and then run `systemctl restart bluetooth`."
        )
        result = str(format_cve_mitigation(raw))
        self.assertEqual(
            result,
            "<p>In <code>/etc/bluetooth/input.conf</code> set "
            "<code>ClassicBondedOnly=true</code>\n"
            "and then run <code>systemctl restart bluetooth</code>.</p>",
        )

    def test_spacer_and_blank_lines_split_paragraphs_cleanly(self):
        raw = "\nFirst paragraph.\n\u2800\nSecond paragraph."
        result = str(format_cve_mitigation(raw))
        self.assertEqual(
            result,
            "<p>First paragraph.</p>\n<p>Second paragraph.</p>",
        )
        self.assertNotIn("\u2800", result)

    def test_explicit_headings_and_single_hash_shell_lines(self):
        raw = (
            "\n## Apply mitigation\n"
            "### `UFW` rules\n"
            "#### Persistence\n"
            "  # appletalk\n"
            "# echo 0 > /sys/kernel/config/nvmet/subsystems/<name>/attr"
        )
        result = str(format_cve_mitigation(raw))
        self.assertEqual(
            result,
            "<h3>Apply mitigation</h3>\n"
            "<h4><code>UFW</code> rules</h4>\n"
            "<h5>Persistence</h5>\n"
            "<p>  # appletalk\n"
            "# echo 0 &gt; /sys/kernel/config/nvmet/subsystems/"
            "&lt;name&gt;/attr</p>",
        )

    def test_explicit_bold_and_literal_stars_edge_cases(self):
        raw = (
            "\n**Limitations:**\n"
            "- **Classic Ubuntu (`ufw`):** match ***.conf** files.\n"
            "- AppArmor rule: deny unix addr=@**, and `code **stars**`."
        )
        result = str(format_cve_mitigation(raw))
        self.assertEqual(
            result,
            "<p><strong>Limitations:</strong>\n"
            "- <strong>Classic Ubuntu (<code>ufw</code>):</strong> "
            "match <strong>*.conf</strong> files.\n"
            "- AppArmor rule: deny unix addr=@**, and "
            "<code>code **stars**</code>.</p>",
        )

    def test_fenced_code_blocks_render_pre_code_without_double_escaping(self):
        raw = (
            "\ncengizcan> Drop incoming IPv4 TCP packets with options.\n"
            "Reload UFW when `sudo ufw status` shows `Status: active`:\n"
            "```bash\n"
            'sudo iptables -I INPUT 1 -p tcp -m u32 --u32 "0>>24&0x0f=6:15" '
            "-j DROP\n"
            "printf '%s\\n' 'table inet cve_2026_98432'\n"
            "## literal comment and **literal stars**\n"
            "```\n"
            "After booting into a fixed kernel:\n"
            "```\n"
            "$ sudo ufw reload\n"
            "```\n"
        )
        result = str(format_cve_mitigation(raw))
        self.assertIn(
            "<pre><code>sudo iptables -I INPUT 1 -p tcp -m u32 --u32 "
            "&quot;0&gt;&gt;24&amp;0x0f=6:15&quot; -j DROP\n"
            "printf &#x27;%s\\n&#x27; &#x27;table inet cve_2026_98432&#x27;\n"
            "## literal comment and **literal stars**"
            "</code></pre>",
            result,
        )
        self.assertIn("<pre><code>$ sudo ufw reload</code></pre>", result)
        self.assertNotIn("&amp;quot;", result)
        self.assertNotIn("&amp;#x27;", result)

    def test_indented_fenced_code_block_strips_fence_indent(self):
        raw = (
            "\nApply the rule:\n"
            "  ```\n"
            "  line1\n"
            "    indented_line2\n"
            "  ```"
        )
        result = str(format_cve_mitigation(raw))
        self.assertIn(
            "<pre><code>line1\n  indented_line2</code></pre>",
            result,
        )

    def test_angle_bracket_placeholders_and_raw_html_are_escaped(self):
        raw = (
            "\n## <script>alert(1)</script>\n"
            "$ sudo ufw allow from <trusted_ip> to any port 4420\n"
            "**<b>bold</b>** and `<img>`"
        )
        result = str(format_cve_mitigation(raw))
        self.assertIn("<h3>&lt;script&gt;alert(1)&lt;/script&gt;</h3>", result)
        self.assertIn("&lt;trusted_ip&gt;", result)
        self.assertIn("<strong>&lt;b&gt;bold&lt;/b&gt;</strong>", result)
        self.assertIn("<code>&lt;img&gt;</code>", result)
        self.assertNotIn("<script>", result)
        self.assertNotIn("<b>", result)
        self.assertNotIn("<img>", result)
