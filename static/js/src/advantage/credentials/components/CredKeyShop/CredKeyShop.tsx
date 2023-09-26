import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Spinner,
  Strip,
} from "@canonical/react-components";
import { currencyFormatter } from "advantage/react/utils";
import { getKeyProducts } from "advantage/credentials/api/keys";
import { Product } from "advantage/subscribe/checkout/utils/types";
import { useQuery } from "react-query";

const CredKeyShop = () => {
  const { isLoading, data: keyProducts } = useQuery(
    ["KeyProducts"],
    async () => {
      return getKeyProducts();
    }
  );
  const [CUEExamKey, setCUEExamKey] = useState<Product | null>(null);
  const checkoutData = localStorage.getItem("shop-checkout-data") || "{}";
  const parsedCheckoutData = JSON.parse(checkoutData);
  const initQuantity: number = parsedCheckoutData?.quantity;
  const [quantity, setQuantity] = useState(initQuantity ?? 1);
  const handleChange: React.ChangeEventHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    setQuantity(parseInt(event.target.value));
  };
  const handleSubmit = (
    event:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    localStorage.setItem(
      "shop-checkout-data",
      JSON.stringify({
        product: CUEExamKey,
        quantity: quantity,
        action: "purchase",
      })
    );
    location.href = "/account/checkout";
  };
  useEffect(() => {
    setCUEExamKey(keyProducts?.find((product: Product) => product.id === "cue-activation-key"));
  }, [keyProducts]);
  return (
    <>
      <Strip>
        <Row>
          <h3>How many exams attempts do you need?</h3>
        </Row>
        <Row>
          <Col size={6}>
            <Form onSubmit={handleSubmit}>
              <Input
                type="number"
                id="keyQuantity"
                min="1"
                value={quantity}
                onChange={handleChange}
              />
            </Form>
          </Col>
        </Row>
        <Row>
          <p>
            Each exam attempt allows you to register for one or more of the
            following certifications:
            <ul>
              <li>CUE.01: Linux</li>
              <li>CUE.02: Desktop</li>
              <li>CUE.03: Server</li>
            </ul>
          </p>
        </Row>
      </Strip>
      <section className="p-strip--light is-shallow p-shop-cart">
        <Row className="u-sv3">
          <Col size={6} className="p-heading--2">
            Your Order
          </Col>
        </Row>
        <Row className="u-sv3">
          <Col size={6}>{quantity} x Exam attempt key</Col>
          <Col size={3}>
            {currencyFormatter.format(
              ((CUEExamKey?.price.value ?? 0) / 100) * (Number(quantity) ?? 0)
            )}
          </Col>
          <Col size={3}>
            {isLoading?<Button appearance="positive"><Spinner></Spinner></Button>:<Button appearance="positive" type="submit" onClick={handleSubmit}>
              Buy Now
            </Button>}
          </Col>
        </Row>
      </section>
    </>
  );
};
export default CredKeyShop;
