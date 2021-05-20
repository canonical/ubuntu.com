import React, { useState } from "react";
import { Button, Row, Col } from "@canonical/react-components";
import Summary from "./components/Summary";
import usePurchase from "./APICalls/Purchase";
import useStripeCustomerInfo from "./APICalls/StripeCustomerInfo";

const config = {
  attributes: true,
};

const cardImageMap = {
  visa: "https://assets.ubuntu.com/v1/2060e728-VBM_COF.png",
  mastercard: "https://assets.ubuntu.com/v1/f42c6739-mc_symbol.svg",
  amex: "https://assets.ubuntu.com/v1/5f4f3f7b-Amex_logo_color.svg",
  discover: "https://assets.ubuntu.com/v1/f5e8abde-discover_logo.jpg",
};

const PurchaseModal = () => {
  const [product, setProduct] = useState({ price: {}, ok: false });
  const [quantity, setQuantity] = useState(1);
  const [observerSet, setObserverSet] = useState(false);

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
              <div>
                <Row className="u-no-padding">
                  <Col size="3">
                    <p className="u-text-light">Receipt will be sent to:</p>
                  </Col>

                  <Col size="9">
                    <p>{userInfo.customerInfo.email}</p>
                  </Col>
                </Row>

                <Row className="u-no-padding">
                  <Col size="6" className="u-vertically-center">
                    <p className="u-text-light">Payment method:</p>
                  </Col>

                  <Col size="6" className="u-align--right">
                    <Button className="p-button js-change-payment-method">
                      Change...
                    </Button>
                  </Col>
                </Row>

                <div className="p-card">
                  <Row className="u-no-padding">
                    <Col size="2" medium="1" small="1">
                      <img
                        src={
                          cardImageMap[
                            userInfo.customerInfo.defaultPaymentMethod.brand
                          ]
                        }
                      />
                    </Col>
                    <Col size="8" small="3">
                      <span>{userInfo.customerInfo.name}</span>
                      <br />
                      <span>
                        <span style={{ textTransform: "capitalize" }}>
                          {userInfo.customerInfo.defaultPaymentMethod.brand}
                        </span>{" "}
                        ending in{" "}
                        {userInfo.customerInfo.defaultPaymentMethod.last4}
                      </span>
                    </Col>
                    <Col size="2" small="3" emptySmall="2">
                      <span className="u-text-light">Expires:</span>
                      <br />
                      <span>
                        {userInfo.customerInfo.defaultPaymentMethod.expMonth
                          .toString()
                          .padStart(2, "0")}
                        /
                        {userInfo.customerInfo.defaultPaymentMethod.expYear
                          .toString()
                          .slice(-2)}
                      </span>
                    </Col>
                  </Row>
                </div>
                <Row className="u-no-padding">
                  <Col size="12">{/* Terms checkbox */}</Col>
                </Row>
              </div>
            ) : (
              <h1>nope</h1>
            )}
          </>
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

          <Button
            className="col-small-2 col-medium-2 col-3 p-button--positive u-no-margin"
            style={{ textAlign: "center" }}
            onClick={() => {
              makePurchase();
            }}
          >
            Continue
          </Button>
        </Row>
      </footer>
    </div>
  );
};

export default PurchaseModal;
