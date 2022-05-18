import React from "react";
import useStripeCustomerInfo from "../../../../../PurchaseModal/hooks/useStripeCustomerInfo";

export default function Heading() {
  const { data: userInfo } = useStripeCustomerInfo();
  const freeTrial = false;

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
                <a
                  href="/login"
                  // onClick="dataLayer.push({ 'event' : 'GAEvent', 'eventCategory' : 'Advantage subscribe', 'eventAction' : 'Authentication', 'eventLabel' : 'Sign in', 'eventValue' : undefined });"
                >
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
