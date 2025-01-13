from unittest import TestCase
from webapp.context import schedule_banner


class TestContextFunctions(TestCase):
    def test_schedule_banner(self):
        """
        Test schedule banner should return True
        if provided dates are within the timeframe
        """

        # Case 1: dates passed, banner should be down
        self.assertFalse(schedule_banner("2021-02-28", "2022-02-28"))

        # Case 2: dates did not pass, banner should be up
        self.assertTrue(schedule_banner("2023-02-28", "2100-02-28"))
