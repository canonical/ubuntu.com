import React from "react";
import useStripeCustomerInfo from "../../../../../PurchaseModal/hooks/useStripeCustomerInfo";

export default function Heading() {
  const { data: userInfo } = useStripeCustomerInfo();

  return (
    <section className="p-strip--suru-topped js-shop-hero u-no-padding--bottom">
      <div className="row">
        <div className="col-12 u-sv3">
          <img
            src="https://assets.ubuntu.com/v1/0e26dbb5-blender_logo.svg"
            style={{ width: "222px" }}
          />
          <h1>Subscribe to Blender support</h1>
          {userInfo ? null : (
            <>
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
        </div>
      </div>
    </section>
  );
}
