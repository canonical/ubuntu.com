import React, { useState } from "react";
import { Row, Col } from "@canonical/react-components";

import useStripeCustomerInfo from "../../hooks/useStripeCustomerInfo";
import PaymentMethodSummary from "../PaymentMethodSummary";

import ModalHeader from "../ModalParts/ModalHeader";
import ModalBody from "../ModalParts/ModalBody";
import ModalFooter from "../ModalParts/ModalFooter";
import FreeTrialRadio from "../FreeTrialRadio";
import TermsCheckbox from "../TermsCheckbox";
import { getIsFreeTrialEnabled } from "../../utils/utils";
import { BuyButtonProps } from "../../utils/utils";

type StepTwoProps = {
  termsLabel: React.ReactNode;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  error: React.ReactNode | null;
  setError: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  closeModal: () => void;
  product: any;
  preview: any;
  Summary: React.ComponentType;
  BuyButton: React.ComponentType<BuyButtonProps>;
};

function StepTwo({
  termsLabel,
  setStep,
  error,
  setError,
  closeModal,
  product,
  preview,
  Summary,
  BuyButton,
}: StepTwoProps) {
  const [areTermsChecked, setTermsChecked] = useState(false);
  const { isLoading: isUserInfoLoading } = useStripeCustomerInfo();
  const [isUsingFreeTrial, setIsUsingFreeTrial] = useState(
    product?.canBeTrialled
  );

  const trialNotAvailable = () => {
    if (getIsFreeTrialEnabled()) {
      return (
        <Row>
          <Col size={10} emptyLarge={2}>
            <p>
              <strong>
                Free Trial is not available for this account.{" "}
                <a href="/contact-us">Contact us</a> for further information.
              </strong>
            </p>
          </Col>
        </Row>
      );
    }
    return null;
  };

  return (
    <>
      <ModalHeader title="Your details" />

      <ModalBody isLoading={isUserInfoLoading} error={error}>
        <>
          <Summary />
          {product?.canBeTrialled ? (
            <FreeTrialRadio
              isUsingFreeTrial={isUsingFreeTrial}
              setIsUsingFreeTrial={setIsUsingFreeTrial}
              preview={preview}
            />
          ) : (
            trialNotAvailable()
          )}
          <PaymentMethodSummary setStep={setStep} />
          <TermsCheckbox label={termsLabel} setTermsChecked={setTermsChecked} />
        </>
      </ModalBody>

      <ModalFooter closeModal={closeModal}>
        <BuyButton
          areTermsChecked={areTermsChecked}
          isUsingFreeTrial={isUsingFreeTrial}
          setTermsChecked={setTermsChecked}
          setError={setError}
          setStep={setStep}
        />
      </ModalFooter>
    </>
  );
}

export default StepTwo;
