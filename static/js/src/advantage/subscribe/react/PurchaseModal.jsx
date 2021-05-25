import React, { useState } from "react";
import { Button, Row, Col, CheckboxInput } from "@canonical/react-components";
import Summary from "./components/Summary";
import usePurchase from "./APICalls/Purchase";
import useStripeCustomerInfo from "./APICalls/StripeCustomerInfo";
import PaymentMethodSummary from "./components/PaymentMethodSummary";
import PaymentMethodForm from "./components/PaymentMethodForm";

const config = {
  attributes: true,
};

const PurchaseModal = () => {
  const [product, setProduct] = useState({ price: {}, ok: false });
  const [quantity, setQuantity] = useState(1);
  const [observerSet, setObserverSet] = useState(false);
  const [areTermsChecked, setTermsChecked] = useState(false);

  const {
    data: userInfo,
    isLoading: isUserInfoLoading,
  } = useStripeCustomerInfo();

  const { makePurchase } = usePurchase(product, quantity);

  const buyButton = document.querySelector("#buy-now-button");

  function handleProductChange() {
    setProduct(JSON.parse(buyButton.dataset.product));

    setQuantity(parseInt(buyButton.dataset.quantity));
  }

  //observerSet prevents us from creating a new observer on each render
  if (!observerSet) {
    const observer = new MutationObserver(handleProductChange);
    observer.observe(buyButton, config);
    setObserverSet(true);
  }
  return (
    <div>
      <header className="p-modal__header">
        <h2 className="p-modal__title u-no-margin--bottom" id="modal-title">
          Complete purchase
        </h2>
      </header>
      <div id="modal-description" className="p-modal__body">
        {isUserInfoLoading ? (
          <h1>LOADING.....</h1>
        ) : (
          <>
            <Summary product={product} quantity={quantity} />
            {!!userInfo.customerInfo &&
            !!userInfo.customerInfo.defaultPaymentMethod ? (
              <PaymentMethodSummary />
            ) : (
              <PaymentMethodForm />
            )}
          </>
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

          <Button
            className="col-small-2 col-medium-2 col-3 p-button--positive u-no-margin"
            style={{ textAlign: "center" }}
            onClick={makePurchase}
          >
            Continue
          </Button>
        </Row>
      </footer>
    </div>
  );
};

export default PurchaseModal;
