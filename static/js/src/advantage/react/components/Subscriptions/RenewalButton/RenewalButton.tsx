import React from "react";
import { Button } from "@canonical/react-components";
import { UserSubscriptionPeriod } from "advantage/api/enum";
import { UserSubscription } from "advantage/api/types";
import { sendAnalyticsEvent } from "advantage/react/utils/sendAnalyticsEvent";
import { Action, Product } from "advantage/subscribe/checkout/utils/types";

type Props = {
  subscription: UserSubscription;
  editing: boolean;
  action: Action;
};

export default function RenewalButton({
  subscription,
  editing,
  action,
}: Props) {
  const price = subscription.renewal_id
    ? Number(subscription.price) / subscription.current_number_of_machines
    : Number(subscription.price) / subscription.number_of_machines;
  const product: Product = {
    longId: subscription.renewal_id ?? subscription.listing_id ?? "",
    period:
      subscription.period === UserSubscriptionPeriod.Monthly
        ? UserSubscriptionPeriod.Monthly
        : UserSubscriptionPeriod.Yearly,
    marketplace: subscription.marketplace,
    id: subscription.id,
    name: subscription.product_name ?? "",
    price: {
      value: price,
    },
    canBeTrialled: false,
  };

  const shopCheckoutData = {
    products: [
      {
        product: product,
        quantity: subscription.current_number_of_machines,
      },
    ],
    action: action,
  };

  return (
    <>
      <Button
        appearance="neutral"
        disabled={editing}
        data-test="renewal-button"
        className="u-no-margin--bottom"
        onClick={(e) => {
          e.preventDefault();
          if (action == "renewal") {
            sendAnalyticsEvent({
              eventCategory: "Advantage",
              eventAction: "subscription-renewal-modal",
              eventLabel: "subscription renewal modal opened",
            });
          } else {
            sendAnalyticsEvent({
              eventCategory: "Advantage",
              eventAction: "subscription-rebuy-expired-modal",
              eventLabel: "subscription rebuy expired modal opened",
            });
          }
          localStorage.setItem(
            "shop-checkout-data",
            JSON.stringify(shopCheckoutData)
          );
          location.href = "/account/checkout";
        }}
      >
        Renew subscription&hellip;
      </Button>
    </>
  );
}
