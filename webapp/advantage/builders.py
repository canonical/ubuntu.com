from typing import List, Dict

from webapp.advantage.models import Listing, UserSubscription


def build_user_subscriptions(
    user_summary: List, listings: Dict[str, Listing]
) -> List[UserSubscription]:
    pass
