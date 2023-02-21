import React from "react";
import { onLoginClick } from "advantage/ecom-events";
import useCustomerInfo from "advantage/subscribe/checkout/hooks/useCustomerInfo";

export default function Heading() {
  const { data: userInfo } = useCustomerInfo();

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
                <a href="/login" onClick={onLoginClick}>
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
