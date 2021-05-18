import React, { useEffect, useState } from "react";
import { Modal, Button, Row, Col } from "@canonical/react-components";
import { add, format } from "date-fns";

const config = {
  attributes: true,
};

const DATE_FORMAT = "dd MMMM yyyy";

const PurchaseModal = () => {
  const [modalOpen, setModalOpen] = useState(true);
  const [product, setProduct] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [observerSet, setObserverSet] = useState(false);

  const buyButton = document.querySelector("#buy-now-button");

  function handleProductChange() {
    console.log(JSON.parse(buyButton.dataset.product));
    setProduct(JSON.parse(buyButton.dataset.product));
    setQuantity(buyButton.dataset.quantity);
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
        <section
          id="summary-section"
          className="p-strip is-shallow u-no-padding--top"
        >
          <Row>
            <Col size="3">
              <p className="u-text-light">Plan type:</p>
            </Col>
            <Col size="9">
              <p>{product.name}</p>
            </Col>
          </Row>
          <Row>
            <Col size="3">
              <p className="u-text-light">Machines:</p>
            </Col>
            <Col size="9">
              <p>{quantity}</p>
            </Col>
          </Row>
          <Row>
            <Col size="3">
              <p className="u-text-light">Starts:</p>
            </Col>
            <Col size="9">
              <p>{format(new Date(), DATE_FORMAT)}</p>
            </Col>
          </Row>
          <Row>
            <Col size="3">
              <p className="u-text-light">Ends:</p>
            </Col>
            <Col size="9">
              <p>
                {format(
                  add(new Date(), {
                    months: product.period === "monthly" ? 1 : 12,
                  }),
                  DATE_FORMAT
                )}
              </p>
            </Col>
          </Row>
          <Row>
            <Col size="3">
              <p className="u-text-light">Subtotal:</p>
            </Col>
            <Col size="9">
              <p></p>
            </Col>
          </Row>
        </section>
      </div>

      <footer className="p-modal__footer">
        <div className="row u-no-padding">
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
        </div>
      </footer>
    </div>
  );
};

export default PurchaseModal;
