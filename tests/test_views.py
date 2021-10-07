from datetime import (
    datetime,
    timedelta,
    timezone,
)
import unittest

from webapp.advantage import views


class TestMakeRenewal(unittest.TestCase):
    def test_no_renewals(self):
        """None is returned if there are no renewals."""
        contract_info = {}
        renewal = views._make_renewal(contract_info)
        self.assertIsNone(renewal)

    def test_processing(self):
        """Processing renewals are re-fetched."""
        now = datetime.now(timezone.utc)
        start = (now + timedelta(days=1)).isoformat()
        contract_info = {
            "renewals": [{"id": "1", "status": "processing", "start": start}],
        }
        got = views._make_renewal(contract_info)
        want = {
            "id": "1",
            "actionable": False,
            "renewable": False,
            "start": start,
            "status": "processing",
        }
        self.assertEqual(got, want)

    def test_not_actionable(self):
        """Not actionable renewals are not renewable."""
        now = datetime.now(timezone.utc)
        start = (now + timedelta(days=1)).isoformat()
        contract_info = {
            "renewals": [
                {
                    "id": "1",
                    "status": "pending",
                    "actionable": False,
                    "start": start,
                }
            ],
        }
        got = views._make_renewal(contract_info)
        want = {
            "id": "1",
            "status": "pending",
            "actionable": False,
            "renewable": False,
            "start": start,
        }
        self.assertEqual(got, want)

    def test_recently_renewed(self):
        """Renewals recently completed are marked as such."""
        now = datetime.now(timezone.utc)
        start = (now + timedelta(days=1)).isoformat()
        contract_info = {
            "renewals": [
                {
                    "id": "1",
                    "status": "done",
                    "actionable": False,
                    "lastModified": str(now),
                    "start": start,
                }
            ],
        }
        got = views._make_renewal(contract_info)
        want = {
            "actionable": False,
            "id": "1",
            "lastModified": str(now),
            "recently_renewed": True,
            "renewable": False,
            "start": start,
            "status": "done",
        }
        self.assertEqual(got, want)

    def test_not_recently_renewed(self):
        """Renewals completed > 1 hr ago are not marked as recently renewed."""
        now = datetime.now(timezone.utc)
        start = (now + timedelta(days=1)).isoformat()
        two_hours_ago = str(now - timedelta(hours=2))
        contract_info = {
            "renewals": [
                {
                    "id": "1",
                    "status": "done",
                    "actionable": False,
                    "lastModified": two_hours_ago,
                    "start": start,
                }
            ],
        }
        got = views._make_renewal(contract_info)
        want = {
            "actionable": False,
            "id": "1",
            "lastModified": two_hours_ago,
            "recently_renewed": False,
            "renewable": False,
            "start": start,
            "status": "done",
        }
        self.assertEqual(got, want)

    def test_before_start(self):
        """Renewals are not renewable before their start date."""
        now = datetime.now(timezone.utc)
        start = (now + timedelta(days=1)).isoformat()
        end = (now + timedelta(days=2)).isoformat()
        contract_info = {
            "renewals": [
                {
                    "id": "1",
                    "status": "pending",
                    "actionable": True,
                    "start": start,
                    "end": end,
                }
            ],
        }
        got = views._make_renewal(contract_info)
        want = {
            "id": "1",
            "status": "pending",
            "actionable": True,
            "start": start,
            "end": end,
            "renewable": False,
        }
        self.assertEqual(got, want)

    def test_after_end(self):
        """Renewals are not renewable after their end date."""
        now = datetime.now(timezone.utc)
        start = (now - timedelta(days=2)).isoformat()
        end = (now - timedelta(days=1)).isoformat()
        contract_info = {
            "renewals": [
                {
                    "id": "1",
                    "status": "pending",
                    "actionable": True,
                    "start": start,
                    "end": end,
                }
            ],
        }
        got = views._make_renewal(contract_info)
        want = {
            "id": "1",
            "status": "pending",
            "actionable": True,
            "start": start,
            "end": end,
            "renewable": False,
        }
        self.assertEqual(got, want)

    def test_pending(self):
        """Pending renewal are renewable, if current and actiomable."""
        now = datetime.now(timezone.utc)
        start = (now - timedelta(days=1)).isoformat()
        end = (now + timedelta(days=1)).isoformat()
        contract_info = {
            "renewals": [
                {
                    "id": "1",
                    "status": "pending",
                    "actionable": True,
                    "start": start,
                    "end": end,
                }
            ],
        }
        got = views._make_renewal(contract_info)
        want = {
            "id": "1",
            "status": "pending",
            "actionable": True,
            "start": start,
            "end": end,
            "renewable": True,
        }
        self.assertEqual(got, want)

    def test_multiple_pending(self):
        """When there are multiple renewals, return the earliest."""
        now = datetime.now(timezone.utc)
        start_last_week = (now - timedelta(days=7)).isoformat()
        start_yesterday = (now - timedelta(days=1)).isoformat()
        end = (now + timedelta(days=1)).isoformat()
        contract_info = {
            "renewals": [
                {
                    "id": "1",
                    "status": "pending",
                    "actionable": True,
                    "start": start_yesterday,
                    "end": end,
                },
                {
                    "id": "2",
                    "status": "pending",
                    "actionable": True,
                    "start": start_last_week,
                    "end": end,
                },
            ],
        }
        got = views._make_renewal(contract_info)
        want = {
            "id": "2",
            "status": "pending",
            "actionable": True,
            "start": start_last_week,
            "end": end,
            "renewable": True,
        }
        self.assertEqual(got, want)

    def test_closed(self):
        """Closed renewals are not returned to the view."""
        now = datetime.now(timezone.utc)
        start = (now - timedelta(days=1)).isoformat()
        end = (now + timedelta(days=1)).isoformat()
        contract_info = {
            "renewals": [
                {
                    "id": "1",
                    "status": "closed",
                    "actionable": True,
                    "start": start,
                    "end": end,
                },
                {
                    "id": "2",
                    "status": "pending",
                    "actionable": True,
                    "start": start,
                    "end": end,
                },
            ],
        }
        got = views._make_renewal(contract_info)
        want = {
            "id": "2",
            "status": "pending",
            "actionable": True,
            "renewable": True,
            "start": start,
            "end": end,
        }
        self.assertEqual(got, want)

    def test_processing_renewable(self):
        """Processing renewals are renewable if they require payment method."""
        now = datetime.now(timezone.utc)
        start = (now - timedelta(days=1)).isoformat()
        end = (now + timedelta(days=1)).isoformat()
        renewal = {
            "id": "1",
            "status": "processing",
            "actionable": True,
            "start": start,
            "end": end,
            "stripeInvoices": [
                {
                    "pi_status": "requires_payment_method",
                    "subscription_status": "incomplete",
                }
            ],
        }
        contract_info = {"renewals": [renewal]}
        got = views._make_renewal(contract_info)
        want = {
            "id": "1",
            "status": "processing",
            "actionable": True,
            "start": start,
            "end": end,
            "stripeInvoices": [
                {
                    "pi_status": "requires_payment_method",
                    "subscription_status": "incomplete",
                }
            ],
            "renewable": True,
        }
        self.assertEqual(got, want)

    def test_processing_not_renewable(self):
        """Processing renewals are not renewable otherwise."""
        now = datetime.now(timezone.utc)
        start = (now - timedelta(days=1)).isoformat()
        end = (now + timedelta(days=1)).isoformat()
        renewal = {
            "id": "1",
            "status": "processing",
            "actionable": True,
            "start": start,
            "end": end,
        }
        contract_info = {"renewals": [renewal]}
        got = views._make_renewal(contract_info)
        want = {
            "id": "1",
            "status": "processing",
            "actionable": True,
            "start": start,
            "end": end,
            "renewable": False,
        }
        self.assertEqual(got, want)
