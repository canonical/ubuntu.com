import React, { ReactNode, RefObject, useCallback, useState } from "react";
import { Formik } from "formik";
import {
  ContextualMenu,
  Notification,
  NotificationSeverity,
  Spinner,
} from "@canonical/react-components";
import {
  UserSubscriptionMarketplace,
  UserSubscriptionPeriod,
} from "advantage/api/enum";
import { UserSubscription } from "advantage/api/types";
import FormikField from "advantage/react/components/FormikField";
import { useSetAutoRenewal, useUserSubscriptions } from "advantage/react/hooks";
import { selectAutoRenewableSubscriptionsByMarketplace } from "advantage/react/hooks/useUserSubscriptions";
import { currencyFormatter, formatDate } from "advantage/react/utils";
import { sendAnalyticsEvent } from "advantage/react/utils/sendAnalyticsEvent";
import RenewalSettingsForm from "./RenewalSettingsForm";

type AutoRenewalLabelProps = {
  period: UserSubscriptionPeriod;
  total: number;
  date: string | Date;
  products: string[];
};

const AutoRenewalLabel = ({
  period,
  total,
  date,
  products,
}: AutoRenewalLabelProps) => {
  let doWhat = null;
  let next = null;
  let forHowLong = null;
  if (period === "yearly") {
    doWhat = <>Renew</>;
    forHowLong = <strong>for the next year</strong>;
    next = (
      <>
        The renewal will happen on <strong>{date}</strong>
      </>
    );
  } else if (period === "monthly") {
    doWhat = <>Automatically renew</>;
    forHowLong = <strong>every month</strong>;
    next = (
      <>
        The next renewal will be on <strong>{date}</strong>
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
      {doWhat} {toWhat} {forHowLong} for{" "}
      <strong>{currencyFormatter.format(total)}</strong>
      *. <br />
      {next}: <br />
      <small>
        {products.map((product) => (
          <>
            {product}
            <br />
          </>
        ))}
      </small>
    </>
  );
};

function generateAutoRenewalToggles(
  billingSubscriptions: UserSubscription[]
): {
  toggles: ReactNode[];
  initialValues: { [key: string]: boolean };
} {
  const toggles: ReactNode[] = [];
  const initialValues: { [key: string]: boolean } = {};

  // We create a separate toggle for each period
  [UserSubscriptionPeriod.Yearly, UserSubscriptionPeriod.Monthly].forEach(
    (period) => {
      const filteredBillingSubscriptions = billingSubscriptions.filter(
        (subscription) => subscription.period === period
      );
      if (filteredBillingSubscriptions.length === 0) {
        return;
      }

      let total = 0;
      let date: Date | null = null;
      const products: string[] = [];

      filteredBillingSubscriptions.forEach((subscription) => {
        total +=
          ((subscription.price ?? 0) *
            subscription.current_number_of_machines) /
          (100 * subscription.number_of_machines);
        products.push(
          `${subscription.current_number_of_machines}x ${subscription.product_name}`
        );
        if (!date) {
          date = subscription.end_date;
        }
      });

      toggles.push(
        <FormikField
          label={
            <AutoRenewalLabel
              period={period}
              total={total}
              date={formatDate(date ?? new Date(), "d MMMM yyyy")}
              products={products}
            />
          }
          labelClassName="u-no-margin--bottom"
          name={filteredBillingSubscriptions[0].subscription_id ?? ""}
          type="checkbox"
        />
      );
      initialValues[filteredBillingSubscriptions[0].subscription_id ?? ""] =
        filteredBillingSubscriptions[0].statuses.is_subscription_auto_renewing;
    }
  );

  return { toggles, initialValues };
}

type Props = {
  positionNodeRef: RefObject<HTMLDivElement>;
  marketplace: UserSubscriptionMarketplace;
};

export const RenewalSettings = ({
  positionNodeRef,
  marketplace,
}: Props): JSX.Element => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const setAutoRenew = useSetAutoRenewal();
  const {
    data: renewableSubscriptions,
    isError: isSubscriptionsError,
    isLoading: isLoadingSubscriptions,
  } = useUserSubscriptions({
    select: selectAutoRenewableSubscriptionsByMarketplace(marketplace),
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
    const { toggles, initialValues } = generateAutoRenewalToggles(
      renewableSubscriptions
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
