import React, { useState } from "react";
import { ActionButton } from "@canonical/react-components";
import { useFormikContext } from "formik";

import useStripeCustomerInfo from "../../APICalls/useStripeCustomerInfo";
import PaymentMethodForm from "../PaymentMethodForm";
import useProduct from "../../APICalls/useProduct";
import usePreview from "../../APICalls/usePreview";
import ModalHeader from "../ModalParts/ModalHeader";
import ModalBody from "../ModalParts/ModalBody";
import ModalFooter from "../ModalParts/ModalFooter";

type StepOneProps = {
  error: React.ReactNode | null;
  closeModal: () => void;
};

function StepOne({ error, closeModal }: StepOneProps) {
  const [isCardValid, setCardValid] = useState(false);
  const { dirty, submitForm, isValid, isSubmitting } = useFormikContext();
  const {
    data: userInfo,
    isLoading: isUserInfoLoading,
  } = useStripeCustomerInfo();
  const { isLoading: isPreviewLoading } = usePreview();
  const { isLoading: isProductLoading } = useProduct();

  return (
    <>
      <ModalHeader title="Your details" />

      <ModalBody
        isLoading={isUserInfoLoading || isProductLoading || isPreviewLoading}
        error={error}
      >
        <PaymentMethodForm setCardValid={setCardValid} />
      </ModalBody>

      <ModalFooter closeModal={closeModal}>
        <ActionButton
          disabled={(!userInfo && !dirty) || !isValid || !isCardValid}
          appearance="positive"
          className="col-small-2 col-medium-2 col-3 u-no-margin"
          style={{ textAlign: "center" }}
          onClick={submitForm}
          loading={isSubmitting}
        >
          Next step
        </ActionButton>
      </ModalFooter>
    </>
  );
}

export default StepOne;
