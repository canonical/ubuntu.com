import {
  ActionButton,
  Button,
  NotificationProps,
  Spinner,
} from "@canonical/react-components";
import React, { useCallback, useEffect } from "react";
import usePortal from "react-useportal";
import { Formik } from "formik";
import * as Yup from "yup";

import SubscriptionCancel from "../SubscriptionCancel";
import FormikField from "../../FormikField";
import { SelectedId } from "../Content/types";
import { useResizeContract, useUserSubscriptions } from "advantage/react/hooks";
import { selectSubscriptionById } from "advantage/react/hooks/useUserSubscriptions";
import { sendAnalyticsEvent } from "advantage/react/utils/sendAnalyticsEvent";
import usePendingPurchase from "advantage/subscribe/react/hooks/usePendingPurchase";
import { ResizeContractResponse } from "advantage/react/hooks/useResizeContract";
import { useQueryClient } from "react-query";
import { UserSubscription } from "advantage/api/types";

type Props = {
  onClose: () => void;
  selectedId?: SelectedId;
  setNotification: (props: NotificationProps | null) => void;
  setShowingCancel: (showingCancel: boolean) => void;
};

const sizeMessage = "You must have at least one machine.";

export const generateSchema = (subscription: UserSubscription) => {
  let min = 1;
  let minMessage = sizeMessage;
  let max = Infinity;
  let maxMessage = "";
  if (!subscription.statuses.is_downsizeable) {
    min = subscription.number_of_machines;
    minMessage = "You can not downsize this subscription";
  }
  if (!subscription.statuses.is_upsizeable) {
    max = subscription.number_of_machines;
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
    setPendingPurchaseID,
    error: pendingPurchaseError,
    isLoading: isPendingPurchaseLoading,
    isSuccess: isPendingPurchaseSuccess,
  } = usePendingPurchase();
  const isResizing = resizeContract.isLoading || isPendingPurchaseLoading;
  const isResized = resizeContract.isSuccess && isPendingPurchaseSuccess;
  const error =
    resizeContract.error ||
    // This type has to be case because it comes from a non-typescript file.
    (pendingPurchaseError as Error | null);

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
      setNotification({
        severity: "positive",
        children: "This subscription was resized.",
        onDismiss: () => setNotification(null),
      });
    }
  }, [isResized]);

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
  const ResizeSchema = generateSchema(subscription);
  return (
    <>
      <Formik
        initialValues={{
          size: subscription.number_of_machines,
        }}
        onSubmit={({ size }) => {
          resizeContract.mutate(size, {
            onSuccess: (response: ResizeContractResponse) => {
              sendAnalyticsEvent({
                eventCategory: "Advantage",
                eventAction: "subscription-resize-form",
                eventLabel: "subscription resized",
              });
              setPendingPurchaseID(response.id);
            },
          });
        }}
        validateOnMount
        validationSchema={ResizeSchema}
      >
        {({ dirty, handleSubmit, isValid, errors }) => {
          return (
            <form className="p-subscription__edit" onSubmit={handleSubmit}>
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
                      You can resize your subscriptions to as many machines as
                      needed.
                      <br />
                      Your next billing period will reflect the changes
                      accordingly.
                    </>
                  }
                  label="Number of machines"
                  min={
                    subscription.statuses.is_downsizeable
                      ? 1
                      : subscription.number_of_machines
                  }
                  max={
                    subscription.statuses.is_upsizeable
                      ? undefined
                      : subscription.number_of_machines
                  }
                  name="size"
                  type="number"
                  wrapperClassName="u-sv3"
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
                  data-testId="resize-submit-button"
                  appearance="positive"
                  className="p-subscription__resize-action"
                  disabled={!dirty || !isValid || isResizing}
                  loading={isResizing}
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
