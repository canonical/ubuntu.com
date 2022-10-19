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
import useRenewal from "advantage/react/hooks/useRenewal";
import { sendAnalyticsEvent } from "advantage/react/utils/sendAnalyticsEvent";
import { Button } from "@canonical/react-components";

const RenewalModal = ({ subscription, editing }: Props) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  const renewalMutation = useRenewal(subscription.renewal_id);

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
            Summary={RenewalSummary}
            closeModal={closePortal}
            mutation={renewalMutation}
            marketplace={subscription.marketplace}
          />
        </Portal>
      ) : null}
    </>
  );
};

export default RenewalModal;
