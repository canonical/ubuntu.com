import React, { useEffect, useState } from "react";
import { Row, Col, Button, CheckboxInput } from "@canonical/react-components";
import useStripeCustomerInfo from "./APICalls/StripeCustomerInfo";
import registerPaymentMethod from "./APICalls/RegisterPaymentMethod";
import PaymentMethodSummary from "./components/PaymentMethodSummary";
import PaymentMethodForm from "./components/PaymentMethodForm";
import Summary from "./components/Summary";
import { Formik } from "formik";
import useProduct from "./APICalls/Product";
import usePreview from "./APICalls/Preview";
import makePurchase from "./APICalls/Purchase";
import usePendingPurchase from "./APICalls/PendingPurchase";

const PurchaseModal = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [areTermsChecked, setTermsChecked] = useState(false);
  const [isCardValid, setCardValid] = useState(false);
  const {
    data: userInfo,
    isLoading: isUserInfoLoading,
  } = useStripeCustomerInfo();

  const { isLoading: isProductLoading } = useProduct();
  const { data: preview, isLoading: isPreviewLoading } = usePreview();
  const { data: pendingPurchase, setPendingPurchaseID } = usePendingPurchase();

  const paymentMethodMutation = registerPaymentMethod();
  const purchaseMutation = makePurchase();

  const onPayClick = () => {
    purchaseMutation.mutate("", {
      onSuccess: (data) => {
        console.log("Purchase Successful 🎉");
        console.log({ data });
        setPendingPurchaseID(data);
      },
      onError: (error) => {
        // An error happened!
        console.log("OH NO");
        console.log(error.message);
      },
    });
  };

  const isFirstStep =
    isEdit || paymentError || !userInfo?.customerInfo?.defaultPaymentMethod;

  return (
    <div>
      <Formik
        initialValues={{
          email: userInfo?.customerInfo?.email ?? "",
          name: userInfo?.customerInfo?.name ?? "",
          buyingFor: "organisation",
          organisationName: userInfo?.accountInfo?.name ?? "",
          address: userInfo?.customerInfo?.address?.line1 ?? "",
          postalCode: userInfo?.customerInfo?.address?.postal_code ?? "",
          country: userInfo?.customerInfo?.address?.country ?? "",
          city: userInfo?.customerInfo?.address?.city ?? "",
          usState: userInfo?.customerInfo?.address?.state ?? "",
          CAProvince: userInfo?.customerInfo?.address?.state ?? "",
          VATNumber: "",
        }}
        enableReinitialize={true}
        onSubmit={(values, actions) => {
          paymentMethodMutation.mutate(values, {
            onSuccess: (data, variables) => {
              console.log({ data });
            },
            onError: (error, variables) => {
              // An error happened!
              console.log(error.message);
            },
          });
          actions.setSubmitting(false);
        }}
      >
        {({ isValid, dirty, submitForm }) => (
          <>
            <header className="p-modal__header">
              <h2
                className="p-modal__title u-no-margin--bottom"
                id="modal-title"
              >
                Complete purchase {status}
              </h2>
            </header>
            <div id="modal-description" className="p-modal__body">
              {isUserInfoLoading ||
              isProductLoading ||
              (window.accountId && isPreviewLoading) ? (
                <h1>LOADING.....</h1>
              ) : (
                <>
                  {/* <Summary /> */}
                  {isFirstStep ? (
                    <PaymentMethodForm
                      setCardValid={setCardValid}
                      paymentError={paymentError}
                    />
                  ) : (
                    <PaymentMethodSummary
                      setIsEdit={setIsEdit}
                      setPaymentError={setPaymentError}
                    />
                  )}
                </>
              )}
              {isFirstStep ? null : (
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
              )}
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
                    disabled={(!userInfo && !dirty) || !isValid || !isCardValid}
                    className="col-small-2 col-medium-2 col-3 p-button--positive u-no-margin"
                    style={{ textAlign: "center" }}
                    onClick={submitForm}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    className="col-small-2 col-medium-2 col-3 p-button--positive u-no-margin"
                    style={{ textAlign: "center" }}
                    disabled={!areTermsChecked}
                    onClick={onPayClick}
                  >
                    Pay
                  </Button>
                )}
              </Row>
            </footer>
          </>
        )}
      </Formik>
    </div>
  );
};

export default PurchaseModal;
