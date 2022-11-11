import { add } from "date-fns";
import React from "react";
import { UserSubscription } from "../../../../api/types";

type Props = {
  subscription: UserSubscription;
  editing: boolean;
};

import PurchaseModal from "../../../../../PurchaseModal";
import Summary from "./Summary";
import usePortal from "react-useportal";
import { sendAnalyticsEvent } from "advantage/react/utils/sendAnalyticsEvent";
import { Button } from "@canonical/react-components";
import { Periods } from "advantage/subscribe/react/utils/utils";
import { UserSubscriptionPeriod } from "advantage/api/enum";
import { marketplace } from "PurchaseModal/utils/utils";

const RenewalModal = ({ subscription, editing }: Props) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  const product = {
    longId: subscription.renewal_id ?? "",
    period:
      subscription.period === UserSubscriptionPeriod.Monthly
        ? Periods.monthly
        : Periods.yearly,
    marketplace: subscription.marketplace as marketplace,
    id: subscription.id,
    name: subscription.product_name ?? "",
    price: {
      value: Number(subscription.price),
    },
    canBeTrialled: false,
  };

  const termsLabel = (
    <>
      I agree to the{" "}
      <a
        href="/legal/ubuntu-advantage-service-terms"
        target="_blank"
        rel="noopener noreferrer"
      >
        Ubuntu Pro service terms
      </a>
    </>
  );

  const descriptionLabel = (
    <>
      I agree to the{" "}
      <a
        href="/legal/ubuntu-pro-description"
        target="_blank"
        rel="noopener noreferrer"
      >
        Ubuntu Pro description
      </a>
    </>
  );

  const marketingLabel =
    "I agree to receive information about Canonical's products and services";

  const RenewalSummary = () => {
    return (
      <Summary
        productName={subscription.product_name}
        quantity={subscription.number_of_machines}
        startDate={add(new Date(subscription.start_date), { years: 1 })}
        endDate={add(new Date(subscription.start_date), { years: 2 })}
        total={subscription.price}
      />
    );
  };

  return (
    <>
      <Button
        appearance="neutral"
        className="p-subscriptions__details-action"
        data-test="renew-button"
        disabled={editing}
        onClick={(e) => {
          openPortal(e);
          sendAnalyticsEvent({
            eventCategory: "Advantage",
            eventAction: "subscription-renewal-modal",
            eventLabel: "subscription renewal modal opened",
          });
        }}
      >
        Renew subscription&hellip;
      </Button>

      {isOpen ? (
        <Portal>
          <PurchaseModal
            termsLabel={termsLabel}
            marketingLabel={marketingLabel}
            descriptionLabel={descriptionLabel}
            product={product}
            quantity={subscription.number_of_machines}
            Summary={RenewalSummary}
            closeModal={closePortal}
            action="renewal"
          />
        </Portal>
      ) : null}
    </>
  );
};

export default RenewalModal;
