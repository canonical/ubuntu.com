import React, { useContext } from "react";
import { Col, Row } from "@canonical/react-components";
import { FormContext } from "advantage/subscribe/react/utils/FormContext";
import { ProductTypes } from "../../utils/utils";
import { currencyFormatter } from "advantage/react/utils";

const imgUrl = {
  [ProductTypes.physical]: "https://assets.ubuntu.com/v1/fdf83d49-Server.svg",
  [ProductTypes.virtual]:
    "https://assets.ubuntu.com/v1/9ed50294-Virtual+machine.svg",
  [ProductTypes.desktop]: "https://assets.ubuntu.com/v1/4b732966-Laptop.svg",
  [ProductTypes.aws]: "",
  [ProductTypes.azure]: "",
  [ProductTypes.gcp]: "",
};

const ProductSummary = () => {
  const { quantity, type, product } = useContext(FormContext);

  return (
    <section
      className={`p-strip--light is-shallow p-shop-cart ${
        !product || !quantity || quantity < 1 ? "p-shop-cart--hidden" : ""
      }`}
      id="summary-section"
    >
      <Row>
        <Col size={12}>
          <h3>Your chosen plan</h3>
        </Col>
      </Row>
      <Row className="u-sv3">
        <Col size={8} className="p-shop-cart__selected-product">
          <span id="summary-plan-quantity">{quantity}x</span>
          <img id="summary-plan-image" src={imgUrl[type]} />
          <span id="summary-plan-name">{product?.name}</span>
        </Col>
        <div className="col-4 p-shop-cart__buy">
          <span>
            <strong className="js-summary-cost">
              {currencyFormatter.format(
                ((product?.price.value ?? 0) / 100) * quantity
              )}{" "}
              /year
            </strong>
          </span>
          <button
            className="p-button--positive u-no-margin--bottom u-float-right"
            id="buy-now-button"
            aria-controls="purchase-modal"
          >
            Buy now
          </button>
          <p className="p-text--small">
            Any applicable taxes are calculated before payment
          </p>
        </div>
      </Row>
    </section>
  );
};

export default ProductSummary;
