import React from "react";
import { onLoginClick } from "advantage/ecom-events";
import useCustomerInfo from "advantage/subscribe/checkout/hooks/useCustomerInfo";
import { getIsFreeTrialEnabled } from "../../utils/utils";

export default function Heading() {
  const { data: userInfo } = useCustomerInfo();
  const freeTrial = getIsFreeTrialEnabled();

  return (
    <section className="p-strip--suru-topped js-shop-hero u-no-padding--bottom">
      <div className="row">
        <div className="col-12 u-sv3">
          {userInfo ? (
            <h1>Add machines to your subscription</h1>
          ) : (
            <>
              <h1>Subscribe to Ubuntu Pro</h1>
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
              Evaluate Ubuntu Pro with your first month free on all
              subscriptions
            </h2>
          ) : null}
        </div>
      </div>
    </section>
  );
}
