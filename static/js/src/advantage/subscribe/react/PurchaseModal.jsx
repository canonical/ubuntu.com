import React, { useState } from "react";
import { Row, Col, Button, CheckboxInput } from "@canonical/react-components";
import useStripeCustomerInfo from "./APICalls/StripeCustomerInfo";
import PaymentMethodSummary from "./components/PaymentMethodSummary";
import PaymentMethodForm from "./components/PaymentMethodForm";
import Summary from "./components/Summary";
import { useForm } from "react-hook-form";

const PurchaseModal = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [areTermsChecked, setTermsChecked] = useState(false);
  const [isCardValid, setCardValid] = useState(false);
  const {
    data: userInfo,
    isLoading: isUserInfoLoading,
  } = useStripeCustomerInfo();
  const formContext = useForm({ mode: "all" });

  const {
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = formContext;

  const onSubmit = (data) => {
    console.log(data);
    console.log(errors);
  };

  const isFirstStep =
    isEdit || paymentError || !userInfo?.customerInfo?.defaultPaymentMethod;

  return (
    <div>
      <header className="p-modal__header">
        <h2 className="p-modal__title u-no-margin--bottom" id="modal-title">
          Complete purchase
        </h2>
      </header>
      <div id="modal-description" className="p-modal__body">
        <Summary />
        {isUserInfoLoading ? (
          <h1>LOADING.....</h1>
        ) : isFirstStep ? (
          <PaymentMethodForm
            formContext={formContext}
            setCardValid={setCardValid}
            paymentError={paymentError}
          />
        ) : (
          <PaymentMethodSummary
            setIsEdit={setIsEdit}
            setPaymentError={setPaymentError}
          />
        )}
        <Row className="u-no-padding">
          <Col size="12">
            <CheckboxInput
              name="TermsCheckbox"
              onChange={(e) => {
                setTermsChecked(e.target.checked);
              }}
              label={
                <>
                  I agree to the{" "}
                  <a
                    href="/legal/ubuntu-advantage-service-terms"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ubuntu Advantage service terms
                  </a>
                </>
              }
            />
          </Col>
        </Row>
      </div>
      <footer className="p-modal__footer">
        <Row className="u-no-padding">
          <Button
            className="js-cancel-modal col-small-2 col-medium-2 col-start-medium-3 col-start-large-7 col-3 u-no-margin"
            aria-controls="purchase-modal"
            style={{ textAlign: "center" }}
          >
            Cancel
          </Button>

          {isFirstStep ? (
            <Button
              disabled={!isDirty || !isValid || !isCardValid}
              className="col-small-2 col-medium-2 col-3 p-button--positive u-no-margin"
              style={{ textAlign: "center" }}
              onClick={handleSubmit(onSubmit)}
            >
              Continue
            </Button>
          ) : (
            <Button
              className="col-small-2 col-medium-2 col-3 p-button--positive u-no-margin"
              style={{ textAlign: "center" }}
              disabled={!areTermsChecked}
            >
              Pay
            </Button>
          )}
        </Row>
      </footer>
    </div>
  );
};

export default PurchaseModal;
