import {
  ContextualMenu,
  Notification,
  NotificationSeverity,
  Spinner,
} from "@canonical/react-components";
import React, { ReactNode, RefObject, useCallback, useState } from "react";
import { Formik } from "formik";
import FormikField from "advantage/react/components/FormikField";
import { formatDate } from "advantage/react/utils";

import { useSetAutoRenewal, useUserSubscriptions } from "advantage/react/hooks";
import { selectAutoRenewableUASubscriptions } from "advantage/react/hooks/useUserSubscriptions";
import { sendAnalyticsEvent } from "advantage/react/utils/sendAnalyticsEvent";
import {
  UserSubscriptionMarketplace,
  UserSubscriptionPeriod,
} from "advantage/api/enum";
import RenewalSettingsForm from "./RenewalSettingsForm";
import { AutoRenewal } from "./types";
import { UserSubscription } from "advantage/api/types";

export const subscriptionBasedMarketplaces: UserSubscriptionMarketplace[] = [
  UserSubscriptionMarketplace.CanonicalUA,
];

type Props = {
  positionNodeRef: RefObject<HTMLDivElement>;
};

const generatePrice = (billingSubscription: BillingSubscription): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    currency: billingSubscription.currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  });
  // The total is in cents so it needs to be divided by 100.
  return formatter.format((billingSubscription.total || 0) / 100);
};

const AutoRenewalLabel = ({ period, cost, when, products }: AutoRenewal) => {
  let doWhat = null;
  let next = null;
  let forHowLong = null;
  if (period === "yearly") {
    doWhat = <>Renew</>;
    forHowLong = <strong>for the next year</strong>;
    next = (
      <>
        The renewal will happen on <strong>{when}</strong>
      </>
    );
  } else if (period === "monthly") {
    doWhat = <>Automatically renew</>;
    forHowLong = <strong>every month</strong>;
    next = (
      <>
        The next renewal will be on <strong>{when}</strong>
      </>
    );
  }

  let toWhat = null;
  if (products.length === 1) {
    toWhat = (
      <>
        my <strong>{period}</strong> subscription
      </>
    );
  } else {
    toWhat = (
      <>
        my{" "}
        <strong>
          {products.length} {period}
        </strong>{" "}
        subscriptions
      </>
    );
  }

  return (
    <>
      <p className="u-no-padding">
        {doWhat} {toWhat} {forHowLong} for <strong>{cost}</strong>*.
      </p>
      <p className="u-no-padding">{next}:</p>
      <small>
        <ul>
          {products.map((product) => (
            <li key={product}>{product}</li>
          ))}
        </ul>
      </small>
    </>
  );
};

class BillingSubscription {
  id = "";
  when: Date = new Date();
  total = 0;
  currency = "";
  n_user_subs = 0;
  products: string[] = [];
  status = false;

  exists(): boolean {
    return this.id !== null && this.id !== "";
  }
}

class SubscriptionBasedMarketplace {
  yearly: BillingSubscription = new BillingSubscription();
  monthly: BillingSubscription = new BillingSubscription();

  period(p: string): BillingSubscription | null {
    if (p === UserSubscriptionPeriod.Yearly) {
      return this.yearly;
    } else if (p === UserSubscriptionPeriod.Monthly) {
      return this.monthly;
    }
    return null;
  }
}

export function consolidateUserSubscriptions(
  userSubscriptions: UserSubscription[]
): { [key: string]: SubscriptionBasedMarketplace } {
  const billingSubscriptions: {
    [key: string]: SubscriptionBasedMarketplace;
  } = {};
  userSubscriptions?.forEach((userSubscription) => {
    if (
      !userSubscription.period ||
      !userSubscription.marketplace ||
      !userSubscription.end_date ||
      !userSubscription.statuses.should_present_auto_renewal ||
      !subscriptionBasedMarketplaces.includes(userSubscription.marketplace)
    ) {
      return;
    }

    let marketplace = billingSubscriptions[userSubscription.marketplace];
    if (!marketplace) {
      marketplace = new SubscriptionBasedMarketplace();
      billingSubscriptions[userSubscription.marketplace] = marketplace;
    }
    const billingSubscription = marketplace.period(userSubscription.period);
    if (billingSubscription === null) {
      return;
    }

    billingSubscription.when = userSubscription.end_date;
    billingSubscription.total +=
      userSubscription.number_of_machines * (userSubscription.price || 0);
    billingSubscription.currency = userSubscription.currency;
    billingSubscription.products.push(
      `${userSubscription.number_of_machines}x ${userSubscription.product_name}`
    );
    billingSubscription.n_user_subs += 1;
    billingSubscription.status =
      userSubscription.statuses.is_subscription_auto_renewing;
    billingSubscription.id = userSubscription.subscription_id || "";
  });
  return billingSubscriptions;
}

function generateAutoRenewalToggles(billingSubscriptions: {
  [key: string]: SubscriptionBasedMarketplace;
}): {
  toggles: ReactNode[];
  initialValues: { [key: string]: boolean };
} {
  const toggles: ReactNode[] = [];
  const initialValues: { [key: string]: boolean } = {};

  // For each marketplace we know supports auto-renewable subscriptions,
  // create a toggle for the auto-renewal setting.
  subscriptionBasedMarketplaces.forEach((mp) => {
    [UserSubscriptionPeriod.Yearly, UserSubscriptionPeriod.Monthly].forEach(
      (period) => {
        const marketplace: SubscriptionBasedMarketplace =
          billingSubscriptions[mp];
        if (!marketplace) {
          return;
        }
        const billingSubscription = marketplace[period];
        if (!billingSubscription.exists()) {
          return;
        }
        toggles.push(
          <FormikField
            label={
              <AutoRenewalLabel
                {...{
                  period,
                  cost: generatePrice(billingSubscription),
                  when: formatDate(billingSubscription.when, "d MMMM yyyy"),
                  products: billingSubscription.products,
                }}
              />
            }
            labelClassName="u-no-margin--bottom"
            name={billingSubscription.id}
            type="checkbox"
          />
        );
        initialValues[billingSubscription.id] = billingSubscription.status;
      }
    );
  });

  return { toggles, initialValues };
}

export const RenewalSettings = ({ positionNodeRef }: Props): JSX.Element => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const setAutoRenew = useSetAutoRenewal();
  const {
    data: renewableSubscriptions,
    isError: isSubscriptionsError,
    isLoading: isLoadingSubscriptions,
  } = useUserSubscriptions({
    select: selectAutoRenewableUASubscriptions,
  });

  const onCloseMenu = useCallback(() => {
    setMenuOpen(false);
    // Reset the form so that errors are cleared.
    setAutoRenew.reset();
  }, [setAutoRenew]);
  let content: ReactNode = null;

  if (isLoadingSubscriptions) {
    content = <Spinner text="Loading..." />;
  } else if (isSubscriptionsError || !renewableSubscriptions) {
    content = (
      <Notification
        data-test="subscriptions-loading-error"
        severity={NotificationSeverity.NEGATIVE}
      >
        There was a problem loading your subscription information. Please
        refresh the page or try again later.
      </Notification>
    );
  } else {
    const billingSubscriptions: {
      [key: string]: SubscriptionBasedMarketplace;
    } = consolidateUserSubscriptions(renewableSubscriptions);
    const { toggles, initialValues } = generateAutoRenewalToggles(
      billingSubscriptions
    );
    content = (
      <Formik
        initialValues={initialValues}
        data-test="renewal-toggles"
        onSubmit={(state) => {
          setAutoRenew.mutate(state, {
            onSuccess: () => {
              onCloseMenu();
            },
          });
        }}
      >
        <>
          {setAutoRenew.isError ? (
            <Notification
              data-test="update-error"
              severity="negative"
              title="Could not update auto renewal settings:"
            >
              {setAutoRenew.error?.message}
            </Notification>
          ) : null}
          <RenewalSettingsForm
            loading={setAutoRenew.isLoading}
            success={setAutoRenew.isSuccess}
            onCloseMenu={onCloseMenu}
          >
            {toggles}
          </RenewalSettingsForm>
        </>
      </Formik>
    );
  }

  return (
    <ContextualMenu
      constrainPanelWidth
      dropdownClassName="p-subscription__renewal-dropdown"
      hasToggleIcon
      onToggleMenu={(isOpen) => {
        if (isOpen) {
          setMenuOpen(true);
        } else {
          onCloseMenu();
        }
        sendAnalyticsEvent({
          eventCategory: "Advantage",
          eventAction: "subscription-auto-renewal-form",
          eventLabel: `auto renewal dropdown ${isOpen ? "opened" : "closed"}`,
        });
      }}
      position="left"
      positionNode={positionNodeRef.current}
      toggleClassName="is-dense u-no-margin--bottom"
      toggleLabel="Renewal settings"
      visible={menuOpen}
    >
      {content}
    </ContextualMenu>
  );
};

export default RenewalSettings;
