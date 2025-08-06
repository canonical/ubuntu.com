# Packages
from unittest import TestCase
from unittest.mock import Mock, patch

# Local
from webapp.views import shorten_acquisition_url, process_local_communities


class TestViewsFunctions(TestCase):
    def test_shorten_acquisition_url(self):
        """
        Test that the acquisition url is shortened to < 255 characters

        fcclid and gclid parameters are removed initially
        If the url is still too long, all parameters are removed
        """

        # this url should still have UTM parameters after shortening
        first_url = (
            "https://ubuntu.com/engage/secure-kubernetes-at-the-edge?"
            "utm_source=facebook_ad&utm_medium=cpc"
            "&utm_campaign=7018e000000Lrr2AAC"
            "&fbclid=IwAR15h71YCzbtXmItLpTWGKvX6LGlbBNrsYAsoq-IEJiF"
            "9SYy_aDXgpsIqn0_aem_AbSMY4GVnRtIgih_p0mTaKvNZH6T3Qy73p"
            "lm8KSqnZJXAsol_n1J440OjNsdU2s6-a0urWDolTPSE0nv3SYoY3jU"
            "&gclid=IwAR15h71YCzbtXmItLpTWGKvX6LGlbBNrsYAsoq-IEJiF9"
            "SYy_aDXgpsIqn0_aem_AbSMY4GVnRtIgih_p0mTaKvNZH6T3Qy73p"
            "lm8KSqnZJXAsol_n1J440OjNsdU2s6-a0urWDolTPSE0nv3SYoY3jU"
        )

        first_url_check = (
            "https://ubuntu.com/engage/secure-kubernetes-at-the-edge?"
            "utm_source=facebook_ad&utm_medium=cpc"
            "&utm_campaign=7018e000000Lrr2AAC"
        )

        # this url should not have UTM parameters after shortening
        second_url = (
            "https://ubuntu.com/engage/secure-kubernetes-at-the-edge?"
            "utm_source=facebook_ad&utm_medium=cpcrHds-f323rdf34v4t24fd"
            "fsfrdfSAsewetv_trfsdgdfg4234rchb534z2243h_rtgrcawretthfghff"
            "&utm_campaign=7018ihtrHdsf323rrdfSASYHe000000Lr8450oh2oEEDV"
            "EfdfodifnjvFSF0w94ngoinsdgfw4c12r2AAC"
            "&fbclid=IwAR15h71YCzbtXmItLpTWGKvX6LGlbBNrsYAsoq-IEJiF9SYy_aDX"
            "gpsIqn0_aem_AbSMY4GVnRtIgih_p0mTaKvNZH6T3Qy73plm8KSqnZJXAsol_n"
            "1J440OjNsdU2s6-a0urWDolTPSE0nv3SYoY3jU"
            "&gclid=IwAR15h71YCzbtXmItLpTWGKvX6LGlbBNrsYAsoq-IEJiF9SYy_aDXg"
            "psIqn0_aem_AbSMY4GVnRtIgih_p0mTaKvNZH6T3Qy73plm8KSqnZJXAsol_n1"
            "J440OjNsdU2s6-a0urWDolTPSE0nv3SYoY3jU"
        )

        second_url_check = (
            "https://ubuntu.com/engage/secure-kubernetes-at-the-edge"
        )

        # this url should not be shortened
        third_url = (
            "https://ubuntu.com/engage/secure-kubernetes-at-the-edge?"
            "utm_source=facebook_ad&utm_medium=button"
            "&utm_campaign=7018jyr44t534e000000Lrr2AAC"
        )

        # Case 1: url is shorten to less than 255 characters
        # and only fbclid/gclid parameters are removed
        self.assertEqual(shorten_acquisition_url(first_url), first_url_check)
        self.assertLess(len(shorten_acquisition_url(first_url)), 255)

        # Case 2: url is shorten to less than 255 characters
        # and all parameters are removed (including UTM parameters)
        self.assertEqual(shorten_acquisition_url(second_url), second_url_check)
        self.assertLess(len(shorten_acquisition_url(second_url)), 255)

        # Case 3: url is already less than 255 characters
        # and is not shortened
        self.assertEqual(shorten_acquisition_url(third_url), third_url)
        self.assertLess(len(shorten_acquisition_url(third_url)), 255)

    @patch('flask.render_template')
    def test_process_local_communities_coordinate_parsing(self, mock_render):
        """
        Mini test for process_local_communities focusing on Unicode parsing
        """
        # Mock local_communities object
        mock_local_communities = Mock()
        mock_local_communities.get_category_index_metadata.return_value = [
            {
                "name": "Ubuntu Africa",
                "continent": "africa",
                "coordinates": "4.71111, −74.07222"  # Unicode minus sign
            },
            {
                "name": "Ubuntu Europe",
                "continent": "europe",
                "coordinates": "52.5200, 13.4050"  # Normal coordinates
            }
        ]

        # Get the function
        display_func = process_local_communities(mock_local_communities)

        # Call the function
        display_func()

        # Verify render_template was called
        mock_render.assert_called_once()

        # Get the arguments passed to render_template
        args, kwargs = mock_render.call_args

        # Check that map_markers were created correctly
        map_markers = kwargs['map_markers']
        self.assertEqual(len(map_markers), 2)

        # Verify Unicode minus sign was handled correctly
        africa_marker = next(
            m for m in map_markers if m['name'] == 'Ubuntu Africa'
        )
        self.assertEqual(africa_marker['lat'], 4.71111)
        self.assertEqual(africa_marker['lon'], -74.07222)
