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
        """Not actionable renewals are not renewable."""
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

    def test_recently_renewed(self):
        """Renewals recently completed are marked as such."""
        advantage = make_advantage()
        now = str(datetime.now(timezone.utc))
        contract_info = {
            "renewals": [
                {
                    "id": "1",
                    "status": "done",
                    "actionable": False,
                    "lastModified": now,
                }
            ],
        }
        got = views.make_renewal(advantage, contract_info)
        want = {
            "actionable": False,
            "id": "1",
            "lastModified": now,
            "recently_renewed": True,
            "renewable": False,
            "status": "done",
        }
        self.assertEqual(got, want)

    def test_not_recently_renewed(self):
        """Renewals completed > 1 hr ago are not marked as recently renewed."""
        advantage = make_advantage()
        two_hours_ago = str(datetime.now(timezone.utc) - timedelta(hours=2))
        contract_info = {
            "renewals": [
                {
                    "id": "1",
                    "status": "done",
                    "actionable": False,
                    "lastModified": two_hours_ago,
                }
            ],
        }
        got = views.make_renewal(advantage, contract_info)
        want = {
            "actionable": False,
            "id": "1",
            "lastModified": two_hours_ago,
            "recently_renewed": False,
            "renewable": False,
            "status": "done",
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


class TestGetMachineUsage(unittest.TestCase):
    def test_no_usage(self):
        """There could be no machines attached or allowed."""
        advantage = make_advantage()
        contract = {}
        got = views.get_machine_usage(advantage, contract)
        self.assertEqual(got, views.MachineUsage(attached=0, allowed=0))

    def test_invalid_allowance_metric(self):
        """Machines allowance is defined in a specific metric."""
        advantage = make_advantage(machines={"machines": [1, 2, 3]})
        contract = {
            "contractInfo": {
                "allowances": [
                    {"metric": "discared-machines", "value": 42},
                    {"metric": "joined-machines", "value": 47},
                ]
            }
        }
        got = views.get_machine_usage(advantage, contract)
        self.assertEqual(got, views.MachineUsage(attached=3, allowed=0))

    def test_both_attached_and_allowed(self):
        """Both attached and allowed counts are returned."""
        advantage = make_advantage(machines={"machines": range(47)})
        contract = {
            "contractInfo": {
                "allowances": [
                    {
                        "metric": views.ALLOWANCE_METRIC_ACTIVE_MACHINES,
                        "value": 42,
                    },
                ]
            }
        }
        got = views.get_machine_usage(advantage, contract)
        self.assertEqual(got, views.MachineUsage(attached=47, allowed=42))


class TestMachineUsage(unittest.TestCase):
    def test_str(self):
        """Machine usages are represented correctly as strings."""
        tests = {
            views.MachineUsage(attached=0, allowed=0): "0",
            views.MachineUsage(attached=0, allowed=4): "0/4",
            views.MachineUsage(attached=42, allowed=0): "42",
            views.MachineUsage(attached=42, allowed=47): "42/47",
        }
        for usage, want in tests.items():
            with self.subTest(usage=usage):
                self.assertEqual(str(usage), want)


def make_advantage(renewal=None, machines=None):
    """Create and return an advantage object returning the given renewal."""
    return type(
        "Advantage",
        (),
        {
            "get_renewal": lambda self, id: renewal,
            "get_contract_machines": lambda self, contract: machines or {},
        },
    )()
