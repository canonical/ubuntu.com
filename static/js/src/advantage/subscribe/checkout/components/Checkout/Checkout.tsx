import { useState } from "react";
import { Formik } from "formik";
import {
  Col,
  List,
  Notification,
  Row,
  Spinner,
  Strip,
} from "@canonical/react-components";
import { checkoutEvent } from "advantage/ecom-events";
import useCustomerInfo from "../../hooks/useCustomerInfo";
import { canBeTrialled, getInitialFormValues } from "../../utils/helpers";
import {
  Action,
  Coupon,
  CheckoutProducts,
  marketplaceDisplayName,
} from "../../utils/types";
import BuyButton from "../BuyButton";
import ConfirmAndBuy from "../ConfirmAndBuy";
import FreeTrial from "../FreeTrial";
import Summary from "../Summary";
import Taxes from "../Taxes";
import UserInfoForm from "../UserInfoForm";
import { UserSubscriptionMarketplace } from "advantage/api/enum";
import AdditionalNotes from "../AdditionalNotes";
import type { DisplayError } from "../../utils/types";

type Props = {
  products: CheckoutProducts[];
  action: Action;
  coupon: Coupon;
};

const Checkout = ({ products, action, coupon }: Props) => {
  const [error, setError] = useState<DisplayError | null>(null);
  const [errorType, setErrorType] = useState<string>("");
  const [isTotalLoading, setIsTotalLoading] = useState<boolean>(true);

  const { data: userInfo, isLoading: isUserInfoLoading } = useCustomerInfo();
  const userCanTrial = window.canTrial;
  const marketplace = products[0].product.marketplace;
  let canTrial = false;
  if (
    marketplace !== UserSubscriptionMarketplace.CanonicalProChannel &&
    products?.length === 1
  ) {
    const product = products[0].product;
    const productCanBeTrialled = product?.canBeTrialled;
    canTrial = canBeTrialled(productCanBeTrialled, userCanTrial);
  }

  const product = products[0].product;
  const initialValues = getInitialFormValues(marketplace, canTrial, userInfo);

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
            <Notification severity="negative" title={error.title ?? "error"}>
              {error.description}
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
              {({ values }) => (
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
                          <Taxes products={products} setError={setError} />
                        ),
                      },
                      {
                        title: "Your purchase",
                        content: (
                          <Summary
                            products={products}
                            action={action}
                            coupon={coupon}
                            setError={setError}
                            setErrorType={setErrorType}
                            setIsTotalLoading={setIsTotalLoading}
                          />
                        ),
                      },
                      ...(product?.price?.value == 0 || product?.isFree
                        ? []
                        : [
                            {
                              title: "Your information",
                              content: <UserInfoForm setError={setError} />,
                            },
                          ]),
                      ...(canTrial
                        ? [
                            {
                              title: "Free trial",
                              content: (
                                <FreeTrial
                                  products={products}
                                  action={action}
                                />
                              ),
                            },
                          ]
                        : []),
                      ...(marketplace ===
                      UserSubscriptionMarketplace.CanonicalProChannel
                        ? [
                            {
                              title: "Additional notes",
                              content: (
                                <Strip className="u-no-padding--top">
                                  <AdditionalNotes />
                                </Strip>
                              ),
                            },
                          ]
                        : []),
                      {
                        title: "Confirm and buy",
                        content: (
                          <>
                            <ConfirmAndBuy
                              products={products}
                              action={action}
                            />
                            <Row>
                              <Col emptyLarge={7} size={6}>
                                <BuyButton
                                  products={products}
                                  action={action}
                                  setError={setError}
                                  coupon={coupon}
                                  errorType={errorType}
                                  isDisabled={
                                    !(
                                      values.TermsAndConditions &&
                                      values.Description &&
                                      values.captchaValue
                                    ) || isTotalLoading
                                  }
                                />
                              </Col>
                            </Row>
                          </>
                        ),
                      },
                    ]}
                  />
                </>
              )}
            </Formik>
          )}
        </Row>
      </div>
    </>
  );
};

export default Checkout;
