import React, { useState } from "react";
import { Formik } from "formik";
import {
  Col,
  List,
  Notification,
  Row,
  Spinner,
} from "@canonical/react-components";
import useCustomerInfo from "../../hooks/useCustomerInfo";
import { canBeTrialled, getInitialFormValues } from "../../utils/helpers";
import { Action, marketplaceDisplayName, Product } from "../../utils/types";
import BuyButton from "../BuyButton";
import ConfirmAndBuy from "../ConfirmAndBuy";
import FreeTrial from "../FreeTrial";
import SignIn from "../SignIn";
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
  const [isCardValid, setCardValid] = useState<boolean>(false);
  const [isTaxSaved, setTaxSaved] = useState<boolean>(false);
  const { data: userInfo, isLoading: isUserInfoLoading } = useCustomerInfo();
  const isGuest = !userInfo?.customerInfo?.email;
  const userCanTrial = window.canTrial;
  const productCanBeTrialled = product?.canBeTrialled;
  const canTrial = canBeTrialled(productCanBeTrialled, userCanTrial);
  const initialValues = getInitialFormValues(product, canTrial, userInfo);

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
              enableReinitialize={false}
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
                          setTaxSaved={setTaxSaved}
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
                        />
                      ),
                    },
                    ...(isGuest
                      ? [
                          {
                            title: "Sign in",
                            content: <SignIn />,
                          },
                        ]
                      : []),
                    {
                      title: "Your information",
                      content: (
                        <UserInfoForm
                          setCardValid={setCardValid}
                          setError={setError}
                        />
                      ),
                    },
                    ...(canTrial
                      ? [
                          {
                            title: "Free trial",
                            content: <FreeTrial />,
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
                                isCardValid={isCardValid}
                                isTaxSaved={isTaxSaved}
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
