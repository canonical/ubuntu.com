import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Modal, Button, Row, Col } from "@canonical/react-components";
import { add, format } from "date-fns";
import { formatter } from "../renderers/form-renderer";

const config = {
  attributes: true,
};

const DATE_FORMAT = "dd MMMM yyyy";

const cardImageMap = {
  visa: "https://assets.ubuntu.com/v1/2060e728-VBM_COF.png",
  mastercard: "https://assets.ubuntu.com/v1/f42c6739-mc_symbol.svg",
  amex: "https://assets.ubuntu.com/v1/5f4f3f7b-Amex_logo_color.svg",
  discover: "https://assets.ubuntu.com/v1/f5e8abde-discover_logo.jpg",
};

// v1/marketplace/canonical-ua/purchase/preview

const PurchaseModal = () => {
  const [product, setProduct] = useState({ price: {}, ok: false });
  const [quantity, setQuantity] = useState(1);
  const [observerSet, setObserverSet] = useState(false);

  // Fetch stripe user info
  const {
    isLoading: isUserInfoLoading,
    isError: isUserInfoError,
    isSuccess: isUserInfoSuccess,
    data: userInfo,
    error: userInfoError,
  } = useQuery(
    "userInfo",
    async () => {
      if (!window.accountId) {
        throw new Error("MISSING ACCOUNT_ID");
      }
      const response = await fetch(
        `/ua-contracts/v1/accounts/${window.accountId}/customer-info/stripe`
      );
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    },
    {
      enabled: !!window.accountId,
    }
  );

  // Fetch subscriptions
  const {
    isLoading: isSubscriptionsLoading,
    isError: isSubscriptionsError,
    isSuccess: isSubscriptionsSuccess,
    data: subscriptions,
    error: subscriptionsError,
  } = useQuery(
    "subscriptions",
    async () => {
      const response = await fetch(
        `/ua-contracts/v1/accounts/${window.accountId}/marketplace/canonical-ua/subscriptions?status=active`
      );
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const subscriptions = {};
      const data = await response.json();
      console.log(data);

      // create a subscriptions object with periods as the keys
      data.subscriptions.forEach((subscription) => {
        subscriptions[subscription.subscription.period] = subscription;
      });
      return subscriptions;
    },
    {
      enabled: !!window.accountId,
    }
  );

  // Preview
  const {
    isLoading: isPreviewLoading,
    isError: isPreviewError,
    isSuccess: isPreviewSuccess,
    data: preview,
    error: previewError,
  } = useQuery(
    ["preview", product],
    async () => {
      console.log({ product });
      console.log(subscriptions[product.period]);
      var numberAlreadyOwned = 0;

      subscriptions[product.period].purchasedProductListings.forEach(
        (listing) => {
          if (listing.productListing.id === product.id) {
            numberAlreadyOwned = listing.value;
          }
        }
      );

      const response = await fetch(
        `/ua-contracts/v1/marketplace/canonical-ua/purchase/preview`,
        {
          method: "POST",
          cache: "no-store",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountID: window.accountId,
            purchaseItems: [
              {
                productListingID: product.id,
                metric: "active-machines",
                value: quantity + numberAlreadyOwned,
              },
            ],
            previousPurchaseId: window.previousPurchaseIds[product.period],
          }),
        }
      );
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    },
    { enabled: !!window.accountId && product.ok && !!subscriptions }
  );

  if (isUserInfoError) {
    console.log(userInfoError);
  }

  const buyButton = document.querySelector("#buy-now-button");

  function handleProductChange() {
    console.log(JSON.parse(buyButton.dataset.product));
    setProduct(JSON.parse(buyButton.dataset.product));

    setQuantity(parseInt(buyButton.dataset.quantity));
  }

  //observerSet prevents us from creating a new observer on each render
  if (!observerSet) {
    const observer = new MutationObserver(handleProductChange);
    console.log("create new observer");
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
            <section
              id="summary-section"
              className="p-strip is-shallow u-no-padding--top"
            >
              <Row className="u-no-padding u-sv1">
                <Col size="3">
                  <div className="u-text-light">Plan type:</div>
                </Col>
                <Col size="9">
                  <div>{product.name}</div>
                </Col>
              </Row>
              <Row className="u-no-padding u-sv1">
                <Col size="3">
                  <div className="u-text-light">Machines:</div>
                </Col>
                <Col size="9">
                  <div>
                    {quantity} x {formatter.format(product.price.value / 100)}
                  </div>
                </Col>
              </Row>
              <Row className="u-no-padding u-sv1">
                <Col size="3">
                  <div className="u-text-light">Starts:</div>
                </Col>
                <Col size="9">
                  <div>{format(new Date(), DATE_FORMAT)}</div>
                </Col>
              </Row>
              {!!preview ? (
                <>
                  <Row className="u-no-padding u-sv1">
                    <Col size="3">
                      <div className="u-text-light">Ends:</div>
                    </Col>

                    <Col size="9">
                      {format(
                        new Date(preview.subscriptionEndOfCycle),
                        DATE_FORMAT
                      )}
                      <br />
                      <small>
                        The same date as your existing subscription.
                      </small>
                    </Col>
                  </Row>
                  <Row className="u-no-padding u-sv1">
                    <Col size="3">
                      <div className="u-text-light">For this period:</div>
                    </Col>
                    <Col size="9">
                      <div>
                        {formatter.format(
                          (preview.total - preview.taxAmount) / 100
                        )}
                      </div>
                    </Col>
                  </Row>
                  <Row className="u-no-padding u-sv1">
                    <Col size="3">
                      <div className="u-text-light">Tax:</div>
                    </Col>
                    <Col size="9">
                      <div>{formatter.format(preview.taxAmount / 100)}</div>
                    </Col>
                  </Row>
                  <Row className="u-no-padding u-sv1">
                    <Col size="3">
                      <div className="u-text-light">Total:</div>
                    </Col>
                    <Col size="9">
                      <div>
                        <b>{formatter.format(preview.total / 100)}</b>
                      </div>
                    </Col>
                  </Row>
                </>
              ) : (
                <>
                  <Row className="u-no-padding u-sv1">
                    <Col size="3">
                      <div className="u-text-light">Ends:</div>
                    </Col>
                    <Col size="9">
                      <div>
                        {format(
                          add(new Date(), {
                            months: product.period === "monthly" ? 1 : 12,
                          }),
                          DATE_FORMAT
                        )}
                      </div>
                    </Col>
                  </Row>
                  <Row className="u-no-padding u-sv1">
                    <Col size="3">
                      <div className="u-text-light">Subtotal:</div>
                    </Col>
                    <Col size="9">
                      <div>
                        {formatter.format(
                          (product.price.value * quantity) / 100
                        )}
                      </div>
                    </Col>
                  </Row>
                </>
              )}
            </section>
            {
              //summary
              isUserInfoSuccess &&
              !!userInfo.customerInfo &&
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
                </div>
              ) : (
                <h1>nope</h1>
              )
            }
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
            id="continue-button"
            className="col-small-2 col-medium-2 col-3 p-button--positive u-no-margin"
            style={{ textAlign: "center" }}
            disabled
            type="submit"
          >
            Continue
          </Button>
        </Row>
      </footer>
    </div>
  );
};

export default PurchaseModal;
