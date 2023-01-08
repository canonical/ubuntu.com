import React, { useState } from "react";
import { Formik } from "formik";
import { Col, List, Notification, Row } from "@canonical/react-components";
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
  const { data: userInfo } = useCustomerInfo();
  const isGuest: boolean = !userInfo?.customerInfo?.email;

  const initialValues = getInitialFormValues(
    product,
    action,
    userInfo,
    window.accountId
  );

  return (
    <div className="p-strip--suru-topped u-no-padding--bottom checkout-container">
      <Row>
        <h1>Your {marketplaceDisplayName[product.marketplace]} purchase</h1>
        {error ? (
          <Notification severity="negative" title="error">
            {error}
          </Notification>
        ) : null}
        <Formik
          onSubmit={() => {}}
          initialValues={initialValues}
          enableReinitialize={true}
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
                ...(canBeTrialled(product, action)
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
      </Row>
    </div>
  );
};

export default Checkout;
