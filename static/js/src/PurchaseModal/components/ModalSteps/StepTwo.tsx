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
  descriptionLabel: React.ReactNode;
  marketingLabel: React.ReactNode;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  error: React.ReactNode | null;
  setError: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  closeModal: () => void;
  product: any;
  preview: any;
  Summary: React.ComponentType;
  BuyButton: React.ComponentType<BuyButtonProps>;
  modalTitle?: string;
  isFreeTrialApplicable?: boolean;
};

function StepTwo({
  termsLabel,
  descriptionLabel,
  marketingLabel,
  setStep,
  error,
  setError,
  closeModal,
  product,
  preview,
  Summary,
  BuyButton,
  modalTitle = "Summary",
  isFreeTrialApplicable = false,
}: StepTwoProps) {
  const [areTermsChecked, setTermsChecked] = useState(false);
  const [isMarketingOptInChecked, setIsMarketingOptInChecked] = useState(false);
  const [isDescriptionChecked, setIsDescriptionChecked] = useState(false);
  const { isLoading: isUserInfoLoading } = useStripeCustomerInfo();
  const [isUsingFreeTrial, setIsUsingFreeTrial] = useState(
    product?.canBeTrialled
  );

  const trialNotAvailable = () => {
    if (getIsFreeTrialEnabled() && isFreeTrialApplicable) {
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
      <ModalHeader title={modalTitle} />

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
          <TermsCheckbox
            label={descriptionLabel}
            setTermsChecked={setIsDescriptionChecked}
          />
          <TermsCheckbox
            label={marketingLabel}
            setTermsChecked={setIsMarketingOptInChecked}
          />
        </>
      </ModalBody>

      <ModalFooter closeModal={closeModal}>
        <BuyButton
          areTermsChecked={areTermsChecked}
          isUsingFreeTrial={isUsingFreeTrial}
          isMarketingOptInChecked={isMarketingOptInChecked}
          setIsMarketingOptInChecked={setIsMarketingOptInChecked}
          setTermsChecked={setTermsChecked}
          isDescriptionChecked={isDescriptionChecked}
          setIsDescriptionChecked={setIsDescriptionChecked}
          setError={setError}
          setStep={setStep}
        />
      </ModalFooter>
    </>
  );
}

export default StepTwo;
