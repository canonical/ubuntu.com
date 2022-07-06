import { onLoginClick } from "advantage/ecom-events";
import React from "react";
import useStripeCustomerInfo from "../../../../../PurchaseModal/hooks/useStripeCustomerInfo";
import { getIsFreeTrialEnabled } from "../../utils/utils";

export default function Heading() {
  const { data: userInfo } = useStripeCustomerInfo();
  const freeTrial = getIsFreeTrialEnabled();

  return (
    <section className="p-strip--suru-topped js-shop-hero u-no-padding--bottom">
      <div className="row">
        <div className="col-12 u-sv3">
          {userInfo ? (
            <h1>Add machines to your subscription</h1>
          ) : (
            <>
              <h1>Subscribe to Ubuntu Advantage</h1>
              <p>
                If you have existing subscriptions or sales offers,{" "}
                <a href="/login" onClick={onLoginClick}>
                  sign in
                </a>{" "}
                to see them.
              </p>
            </>
          )}
          {freeTrial ? (
            <h2 className="p-heading--3">
              Evaluate Ubuntu Advantage with your first month free on all
              subscriptions
            </h2>
          ) : null}
        </div>
      </div>
    </section>
  );
}
