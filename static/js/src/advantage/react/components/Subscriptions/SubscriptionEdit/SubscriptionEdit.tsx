import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "react-query";
import usePortal from "react-useportal";
import { Formik } from "formik";
import { debounce } from "lodash";
import * as Yup from "yup";
import {
  ActionButton,
  Button,
  NotificationProps,
  Spinner,
} from "@canonical/react-components";
import {
  UserSubscriptionMarketplace,
  UserSubscriptionPeriod,
} from "advantage/api/enum";
import { UserSubscription } from "advantage/api/types";
import {
  usePreviewResizeContract,
  useResizeContract,
  useUserSubscriptions,
} from "advantage/react/hooks";
import { PreviewResizeContractResponse } from "advantage/react/hooks/usePreviewResizeContract";
import { ResizeContractResponse } from "advantage/react/hooks/useResizeContract";
import {
  selectAutoRenewableSubscriptionsByMarketplace,
  selectSubscriptionById,
} from "advantage/react/hooks/useUserSubscriptions";
import {
  currencyFormatter,
  formatDate,
  getNextCycleStart,
  isBlenderSubscription,
} from "advantage/react/utils";
import { sendAnalyticsEvent } from "advantage/react/utils/sendAnalyticsEvent";
import usePollPurchaseStatus from "advantage/subscribe/checkout/hooks/usePollPurchaseStatus";
import FormikField from "../../FormikField";
import { SelectedId } from "../Content/types";
import SubscriptionCancel from "../SubscriptionCancel";

type Props = {
  onClose: () => void;
  selectedId?: SelectedId;
  setNotification: (props: NotificationProps | null) => void;
  setShowingCancel: (showingCancel: boolean) => void;
};

export const generateSchema = (
  subscription: UserSubscription,
  unitName: string
) => {
  const sizeMessage = `You must have at least one ${unitName}`;
  let min = 1;
  let minMessage = sizeMessage;
  let max = Infinity;
  let maxMessage = "";
  if (!subscription.statuses.is_downsizeable) {
    min = subscription.current_number_of_machines;
    minMessage = "You can not downsize this subscription";
  }
  if (!subscription.statuses.is_upsizeable) {
    max = subscription.current_number_of_machines;
    maxMessage = "You can not upsize this subscription";
  }
  return Yup.object().shape({
    size: Yup.number()
      .min(min, minMessage)
      .max(max, maxMessage)
      .required(sizeMessage),
  });
};

const generateError = (error: Error | null) => {
  if (error?.message.includes("can only make one purchase")) {
    return (
      <span data-test="has-pending-purchase-error">
        You already have a pending purchase. Please go to{" "}
        <a href="/account/payment-methods">payment methods</a> to retry.
      </span>
    );
  }
  if (error?.message) {
    return (
      <span data-test="payment-error">
        Sorry, there was an unknown error with the payment. Check the details
        and try again. Contact <a href="/contact-us">Canonical sales</a> if the
        problem persists.
      </span>
    );
  }
  return null;
};

type ResizeSummaryProps = {
  oldNumberOfMachines: number;
  newNumberOfMachines: number;
  currentNumberOfMachines: number;
  isBlender: boolean;
  unitName: string;
  price: UserSubscription["price"];
  period: UserSubscription["period"];
  nextCycle: Date | null;
  preview?: PreviewResizeContractResponse;
  isPreviewLoading: boolean;
  totalCost: number;
};

const ResizeSummary = ({
  oldNumberOfMachines,
  newNumberOfMachines,
  currentNumberOfMachines,
  unitName,
  price,
  period,
  nextCycle,
  preview,
  isPreviewLoading,
  totalCost,
}: ResizeSummaryProps) => {
  const absoluteDelta = Math.abs(newNumberOfMachines - currentNumberOfMachines);
  if (absoluteDelta === 0) {
    return null;
  }

  const isDecreasing = newNumberOfMachines - currentNumberOfMachines < 0;
  const isMonthly = period === UserSubscriptionPeriod.Monthly;
  const unitPrice = (price ?? 0) / 100 / oldNumberOfMachines;

  return (
    <div>
      <p>
        You have {isDecreasing ? "removed" : "added"} {absoluteDelta} {unitName}
        {absoluteDelta > 1 ? "s" : ""}.
      </p>
      <p>
        {preview ? (
          <>
            You will be charged{" "}
            <b>{currencyFormatter.format(preview.total / 100)}</b> when you
            click Resize.
            <br />
          </>
        ) : null}
        {!isPreviewLoading && !preview ? (
          <>
            You will be charged nothing.
            <br />
          </>
        ) : null}
        {!isPreviewLoading ? (
          <>
            <br />
            Your {isMonthly ? "monthly" : "yearly"} payment will be{" "}
            <b>
              {isDecreasing
                ? currencyFormatter.format(
                    totalCost - absoluteDelta * unitPrice
                  )
                : currencyFormatter.format(
                    totalCost + absoluteDelta * unitPrice
                  )}
            </b>
            * . <br />
            <small>
              * Taxes and/or balance credits are not included in this price and
              may apply at renewal time.
            </small>
            <br />
          </>
        ) : (
          <Spinner />
        )}
        {isDecreasing && nextCycle ? (
          <>
            <br />
            This will be reflected in the next billing cycle on{" "}
            <b>{formatDate(nextCycle)}</b>
          </>
        ) : null}
      </p>
    </div>
  );
};

const SubscriptionEdit = ({
  onClose,
  selectedId,
  setNotification,
  setShowingCancel,
}: Props) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const queryClient = useQueryClient();
  const showPortal = useCallback(
    (show: boolean) => {
      // Programatically opening portals currently has an unresolved issue so we
      // need to provide a fake event:
      // https://github.com/alex-cory/react-useportal/issues/36
      const NULL_EVENT = { currentTarget: { contains: () => false } };
      if (show) {
        openPortal(NULL_EVENT);
      } else {
        closePortal(NULL_EVENT);
      }
      setShowingCancel(show);
    },
    [setShowingCancel]
  );
  const {
    data: subscription,
    isLoading: isSubscriptionLoading,
  } = useUserSubscriptions({
    select: selectSubscriptionById(selectedId),
  });
  const resizeContract = useResizeContract(subscription);
  const {
    setQuantity: setPreviewQuantity,
    isLoading: isPreviewLoading,
    data: preview,
  } = usePreviewResizeContract(subscription);
  const isBlender = isBlenderSubscription(subscription);
  const nextCycleStart = getNextCycleStart(subscription);

  const setPreviewQuantityDebounced = useMemo(
    () => debounce(setPreviewQuantity, 250),
    []
  );

  const unitName = isBlender ? "user" : "machine";

  const {
    setPendingPurchaseID,
    error: pendingPurchaseError,
    isLoading: isPendingPurchaseLoading,
    isSuccess: isPendingPurchaseSuccess,
  } = usePollPurchaseStatus();
  const isResizing = resizeContract.isLoading || isPendingPurchaseLoading;
  const isResized = resizeContract.isSuccess && isPendingPurchaseSuccess;
  const error =
    resizeContract.error ||
    // This type has to be case because it comes from a non-typescript file.
    (pendingPurchaseError as Error | null);

  const [resizeNumber, setResizeNumber] = useState(
    subscription?.current_number_of_machines ?? 0
  );

  const { data: renewableSubscriptions } = useUserSubscriptions({
    select: selectAutoRenewableSubscriptionsByMarketplace(
      subscription?.marketplace ?? UserSubscriptionMarketplace.CanonicalUA
    ),
  });

  const totalCost: number =
    renewableSubscriptions?.reduce(
      (price: number, renewableSubscription: UserSubscription) => {
        if (renewableSubscription?.period != subscription?.period) {
          return price;
        }

        return (
          price +
          ((renewableSubscription.price ?? 0) *
            renewableSubscription.current_number_of_machines) /
            (100 * renewableSubscription.number_of_machines)
        );
      },
      0
    ) || 0;

  useEffect(() => {
    if (isResized) {
      // Invalidate the data as it all may have changed.
      queryClient.invalidateQueries("userSubscriptions");
      queryClient.invalidateQueries("userInfo");
      // After resizing the purchase id will be updated, but there is a delay
      // before the API responds with the latest value so this invalidation may
      // cause the outdated id to be fetched.
      queryClient.invalidateQueries([
        "lastPurchaseIds",
        subscription?.account_id,
      ]);
      onClose();
      queryClient.removeQueries("preview");
      const newNumberOfMachines =
        resizeNumber + (subscription?.current_number_of_machines ?? 0);
      if (newNumberOfMachines > (subscription?.number_of_machines ?? 0)) {
        setNotification({
          severity: "positive",
          children: (
            <>
              This subscription was increased by{" "}
              <b>
                {newNumberOfMachines - (subscription?.number_of_machines ?? 0)}
              </b>{" "}
              to <b>{newNumberOfMachines}</b> {unitName}s
            </>
          ),
          onDismiss: () => setNotification(null),
        });
      } else {
        setNotification(null);
      }
    }
  }, [isResized, resizeNumber, subscription?.current_number_of_machines]);

  useEffect(() => {
    if (pendingPurchaseError) {
      // Invalidate the user subscriptions to get any status updates e.g.
      // has_pending_purchases.
      queryClient.invalidateQueries("userSubscriptions");
    }
  }, [pendingPurchaseError]);

  if (isSubscriptionLoading || !subscription) {
    return <Spinner />;
  }
  const handleChange = (e: React.ChangeEvent<HTMLFormElement>) => {
    setPreviewQuantityDebounced(e.target.value);
  };

  const ResizeSchema = generateSchema(subscription, unitName);
  return (
    <>
      <Formik
        initialValues={{
          size: subscription.current_number_of_machines,
        }}
        onSubmit={({ size }) => {
          resizeContract.mutate(size, {
            onSuccess: (response: ResizeContractResponse) => {
              sendAnalyticsEvent({
                eventCategory: "Advantage",
                eventAction: "subscription-resize-form",
                eventLabel: "subscription resized",
              });
              setResizeNumber(size - subscription.current_number_of_machines);
              setPendingPurchaseID(response.id);
            },
          });
        }}
        validateOnMount
        validationSchema={ResizeSchema}
      >
        {({ dirty, handleSubmit, isValid, errors, values }) => {
          return (
            <form
              className="p-subscription__edit"
              onSubmit={handleSubmit}
              onChange={handleChange}
            >
              <div className="u-sv2">
                <div className="u-sv3 u-hide--small">
                  <hr />
                </div>
                <h5>Resize subscription</h5>
                <FormikField
                  className="p-subscription__resize"
                  error={errors.size || generateError(error)}
                  help={
                    <>
                      Added {unitName}s will be available immediately.
                      <br />
                      Removed {unitName}s will be removed at the next billing
                      cycle.
                    </>
                  }
                  label={`Number of ${unitName}s`}
                  min={
                    subscription.statuses.is_downsizeable
                      ? 1
                      : subscription.current_number_of_machines
                  }
                  max={
                    subscription.statuses.is_upsizeable
                      ? undefined
                      : subscription.current_number_of_machines
                  }
                  name="size"
                  type="number"
                  wrapperClassName="u-sv3"
                />
                <ResizeSummary
                  oldNumberOfMachines={subscription.number_of_machines}
                  currentNumberOfMachines={
                    subscription.current_number_of_machines
                  }
                  newNumberOfMachines={values.size}
                  isBlender={isBlender}
                  unitName={unitName}
                  price={subscription.price}
                  period={subscription.period}
                  nextCycle={nextCycleStart}
                  preview={preview}
                  isPreviewLoading={isPreviewLoading}
                  totalCost={totalCost}
                />
              </div>
              <div className="p-subscription__resize-actions u-align--right u-sv3">
                <Button
                  appearance="base"
                  className="p-subscription__resize-action"
                  disabled={isResizing}
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </Button>
                <ActionButton
                  data-testid="resize-submit-button"
                  appearance="positive"
                  className="p-subscription__resize-action"
                  disabled={!dirty || !isValid || isResizing}
                  loading={isResizing || isPreviewLoading}
                  success={isResized}
                  type="submit"
                >
                  Resize
                </ActionButton>
              </div>
              {subscription?.statuses?.is_cancellable ? (
                <div>
                  <hr />
                  <Button
                    appearance="link"
                    className="u-align-text--left"
                    data-test="cancel-button"
                    onClick={() => {
                      showPortal(true);
                      sendAnalyticsEvent({
                        eventCategory: "Advantage",
                        eventAction: "subscription-cancel-form",
                        eventLabel: "subscription cancel form opened",
                      });
                    }}
                    type="button"
                  >
                    You can cancel this subscription online or contact us.
                  </Button>
                </div>
              ) : null}
            </form>
          );
        }}
      </Formik>
      {isOpen && (
        <Portal>
          <SubscriptionCancel
            selectedId={selectedId}
            onClose={() => showPortal(false)}
            onCancelSuccess={() => {
              onClose();
              setNotification({
                severity: "positive",
                children: "This subscription was cancelled.",
                onDismiss: () => setNotification(null),
              });
            }}
          />
        </Portal>
      )}
    </>
  );
};

export default SubscriptionEdit;
