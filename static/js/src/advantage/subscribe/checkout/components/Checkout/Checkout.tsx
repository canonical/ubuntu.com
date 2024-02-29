import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import {
  Col,
  List,
  Notification,
  Row,
  Spinner,
} from "@canonical/react-components";
import { checkoutEvent } from "advantage/ecom-events";
import useCustomerInfo from "../../hooks/useCustomerInfo";
import { canBeTrialled, getInitialFormValues } from "../../utils/helpers";
import { Action, marketplaceDisplayName, Product } from "../../utils/types";
import BuyButton from "../BuyButton";
import ConfirmAndBuy from "../ConfirmAndBuy";
import FreeTrial from "../FreeTrial";
import Summary from "../Summary";
import Taxes from "../Taxes";
import UserInfoForm from "../UserInfoForm";

type Props = {
  product: Product;
  quantity: number;
  action: Action;
};

const Checkout = ({ product, quantity, action }: Props) => {
  const [error, setError] = useState<React.ReactNode>(null);
  const { data: userInfo, isLoading: isUserInfoLoading } = useCustomerInfo();
  const userCanTrial = window.canTrial;
  const productCanBeTrialled = product?.canBeTrialled;
  const canTrial = canBeTrialled(productCanBeTrialled, userCanTrial);
  const initialValues = getInitialFormValues(product, canTrial, userInfo);

  useEffect(() => {
    const handleInputChange = () => {
      error ? setError(null) : null;
    };

    const inputElements = document.querySelectorAll("input");
    const selectElements = document.querySelectorAll("select");

    inputElements.forEach((input) => {
      input.addEventListener("change", handleInputChange);
    });

    selectElements.forEach((select) => {
      select.addEventListener("change", handleInputChange);
    });

    return () => {
      inputElements.forEach((input) => {
        input.removeEventListener("change", handleInputChange);
      });

      selectElements.forEach((select) => {
        select.removeEventListener("change", handleInputChange);
      });
    };
  }, [error]);

  if (!localStorage.getItem("gaEventTriggered")) {
    localStorage.setItem("gaEventTriggered", "true");
    checkoutEvent(window.GAFriendlyProduct, "2");
  }
  return (
    <>
      <div className="p-strip">
        <div className="u-fixed-width">
          <h1 className="p-heading--2">
            Your {marketplaceDisplayName[product.marketplace]} purchase
          </h1>
        </div>
      </div>
      <div className="p-strip u-no-padding--top checkout-container">
        <Row>
          {error ? (
            <Notification severity="negative" title="error">
              {error}
            </Notification>
          ) : null}
          {isUserInfoLoading ? (
            <>
              {" "}
              <Col size={12}>
                <div className="p-card">
                  <div className="p-card__content">
                    <Spinner /> Loading&hellip;{" "}
                  </div>
                </div>
              </Col>
            </>
          ) : (
            <Formik
              onSubmit={() => {}}
              initialValues={initialValues}
              enableReinitialize={
                (!!userInfo?.customerInfo?.address?.country &&
                  action === "renewal") ||
                (!!userInfo?.customerInfo?.defaultPaymentMethod &&
                  action === "purchase")
              }
            >
              <>
                <Col emptyLarge={7} size={6}>
                  <p>* indicates a mandatory field</p>
                </Col>
                <List
                  stepped
                  detailed
                  items={[
                    {
                      title: "Region and taxes",
                      content: (
                        <Taxes
                          product={product}
                          quantity={quantity}
                          setError={setError}
                        />
                      ),
                    },
                    {
                      title: "Your purchase",
                      content: (
                        <Summary
                          quantity={quantity}
                          product={product}
                          action={action}
                          setError={setError}
                        />
                      ),
                    },
                    {
                      title: "Your information",
                      content: <UserInfoForm setError={setError} />,
                    },
                    ...(canTrial
                      ? [
                          {
                            title: "Free trial",
                            content: (
                              <FreeTrial
                                quantity={quantity}
                                product={product}
                                action={action}
                              />
                            ),
                          },
                        ]
                      : []),
                    {
                      title: "Confirm and buy",
                      content: (
                        <>
                          <ConfirmAndBuy product={product} action={action} />
                          <Row>
                            <Col emptyLarge={7} size={6}>
                              <BuyButton
                                product={product}
                                quantity={quantity}
                                action={action}
                                setError={setError}
                              ></BuyButton>
                            </Col>
                          </Row>
                        </>
                      ),
                    },
                  ]}
                />
              </>
            </Formik>
          )}
        </Row>
      </div>
    </>
  );
};

export default Checkout;
