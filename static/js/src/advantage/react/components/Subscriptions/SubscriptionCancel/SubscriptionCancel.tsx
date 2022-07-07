import {
  ActionButton,
  ButtonAppearance,
  Modal,
  Notification,
  Spinner,
} from "@canonical/react-components";
import type { ModalProps } from "@canonical/react-components";
import React, { useState } from "react";
import * as Yup from "yup";
import {
  useCancelContract,
  useUserSubscriptions,
  useCancelTrial,
} from "advantage/react/hooks";
import { selectSubscriptionById } from "advantage/react/hooks/useUserSubscriptions";
import { SelectedId } from "../Content/types";
import { Formik } from "formik";
import SubscriptionCancelFields from "./SubscriptionCancelFields";
import { SubscriptionCancelValues } from "./SubscriptionCancelFields/SubscriptionCancelFields";
import { sendAnalyticsEvent } from "advantage/react/utils/sendAnalyticsEvent";

type Props = {
  isTrial?: boolean;
  selectedId?: SelectedId;
  onCancelSuccess: () => void;
  onClose: NonNullable<ModalProps["close"]>;
};

enum CancelError {
  SubscriptionMissing = "subscription-missing",
  Failed = "failed",
}

const CancelSchema = Yup.object().shape({
  cancel: Yup.string()
    .test(
      "confirmationText",
      "You must enter the correct confirmation text",
      (item) => item?.toLowerCase() === "cancel"
    )
    .required("The confirmation text is required"),
});

const generateError = (error: CancelError | null) => {
  return (
    <>
      {error === CancelError.SubscriptionMissing ? (
        <>
          It could be that you have a pending payment that is blocking this
          action.{" "}
        </>
      ) : null}
      Contact <a href="/contact-us">Canonical sales</a> if the problem persists.
    </>
  );
};

const SubscriptionCancel = ({
  isTrial,
  selectedId,
  onCancelSuccess,
  onClose,
}: Props) => {
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<CancelError | null>(null);
  const { data: subscription, isLoading } = useUserSubscriptions({
    select: selectSubscriptionById(selectedId),
  });
  const cancelContract = useCancelContract(subscription);
  const cancelTrial = useCancelTrial(subscription?.account_id);
  const subscriptionType = isTrial ? "trial" : "subscription";

  return (
    <div className="p-subscriptions__sticky-footer-modal">
      <Formik<SubscriptionCancelValues>
        initialValues={{
          cancel: "",
        }}
        onSubmit={() => {
          if (subscriptionType === "subscription") {
            cancelContract.mutate(null, {
              onError: (error) =>
                setError(
                  error.message.includes("no monthly subscription")
                    ? CancelError.SubscriptionMissing
                    : CancelError.Failed
                ),
              onSuccess: () => {
                onCancelSuccess();
                sendAnalyticsEvent({
                  eventCategory: "Advantage",
                  eventAction: "subscription-cancel-form",
                  eventLabel: "subscription cancelled",
                });
              },
            });
          } else {
            cancelTrial.mutate(null, {
              onSuccess: () => {
                onCancelSuccess();
                sendAnalyticsEvent({
                  eventCategory: "Advantage",
                  eventAction: "subscription-cancel-form",
                  eventLabel: "trial cancelled",
                });
              },
            });
          }
        }}
        validateOnMount
        validationSchema={CancelSchema}
      >
        {({ handleSubmit }) => (
          <Modal
            buttonRow={
              <ActionButton
                appearance={ButtonAppearance.NEGATIVE}
                className="u-no-margin--bottom"
                disabled={!isValid}
                loading={cancelContract.isLoading}
                success={cancelContract.isSuccess}
                onClick={() => handleSubmit()}
                type="button"
              >
                Yes, cancel {subscriptionType}
              </ActionButton>
            }
            close={onClose}
            title={
              <>
                Cancel {subscriptionType} {subscription?.product_name}
              </>
            }
          >
            {isLoading ? (
              <Spinner data-test="form-loading" />
            ) : (
              <>
                {error ? (
                  <Notification
                    data-test="cancel-error"
                    severity="negative"
                    title={`Could not cancel ${subscriptionType}:`}
                  >
                    {generateError(error)}
                  </Notification>
                ) : null}
                <SubscriptionCancelFields
                  setIsValid={setIsValid}
                  isTrial={isTrial}
                />
              </>
            )}
          </Modal>
        )}
      </Formik>
    </div>
  );
};

export default SubscriptionCancel;
