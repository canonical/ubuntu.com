from datetime import (
    datetime,
    timedelta,
    timezone,
)
import unittest

from webapp import views


class TestMakeRenewal(unittest.TestCase):
    def test_no_renewals(self):
        """None is returned if there are no renewals."""
        advantage = make_advantage()
        contract_info = {}
        renewal = views.make_renewal(advantage, contract_info)
        self.assertIsNone(renewal)

    def test_processing(self):
        """Processing renewals are re-fetched."""
        advantage = make_advantage(
            renewal={"id": "1", "actionable": False, "status": "processing"}
        )
        contract_info = {
            "renewals": [{"id": "1", "status": "processing"}],
        }
        got = views.make_renewal(advantage, contract_info)
        want = {
            "id": "1",
            "actionable": False,
            "renewable": False,
            "status": "processing",
        }
        self.assertEqual(got, want)

    def test_not_actionable(self):
        """Not actioable renewals are not renewable."""
        advantage = make_advantage()
        contract_info = {
            "renewals": [
                {"id": "1", "status": "pending", "actionable": False}
            ],
        }
        got = views.make_renewal(advantage, contract_info)
        want = {
            "id": "1",
            "status": "pending",
            "actionable": False,
            "renewable": False,
        }
        self.assertEqual(got, want)

    def test_before_start(self):
        """Renewals are not renewable before their start date."""
        advantage = make_advantage()
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
        got = views.make_renewal(advantage, contract_info)
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
        advantage = make_advantage()
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
        got = views.make_renewal(advantage, contract_info)
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
        advantage = make_advantage()
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
        got = views.make_renewal(advantage, contract_info)
        want = {
            "id": "1",
            "status": "pending",
            "actionable": True,
            "start": start,
            "end": end,
            "renewable": True,
        }
        self.assertEqual(got, want)

    def test_closed(self):
        """Closed renewals are not renewable."""
        advantage = make_advantage()
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
                }
            ],
        }
        got = views.make_renewal(advantage, contract_info)
        want = {
            "id": "1",
            "status": "closed",
            "actionable": True,
            "start": start,
            "end": end,
            "renewable": False,
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
        advantage = make_advantage(renewal=renewal)
        contract_info = {"renewals": [renewal]}
        got = views.make_renewal(advantage, contract_info)
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
        advantage = make_advantage(renewal=renewal)
        contract_info = {"renewals": [renewal]}
        got = views.make_renewal(advantage, contract_info)
        want = {
            "id": "1",
            "status": "processing",
            "actionable": True,
            "start": start,
            "end": end,
            "renewable": False,
        }
        self.assertEqual(got, want)


def make_advantage(renewal=None):
    """Create and return an advantage object returning the given renewal."""
    return type("Advantage", (), {"get_renewal": lambda self, id: renewal})()
