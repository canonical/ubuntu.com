import { useContext } from "react";
import { Button } from "@canonical/react-components";
import { FormContext } from "../../utils/FormContext";
import { ProductUsers } from "../../utils/utils";

export default function PaymentButton() {
  const { quantity, product, productUser } = useContext(FormContext);
  let params = new URLSearchParams(document.location.search);
  let referral_id =  params.get("referral_id") || "";
  const shopCheckoutData = {
    products: [
      {
        product: product,
        quantity: Number(quantity) ?? 0,
      },
    ],
    action: "purchase",
    metadata: [{"key": "referralID", "value": referral_id}],
  };

  return (
    <>
      {productUser === ProductUsers.myself ? (
        <Button
          appearance="positive"
          onClick={(e) => {
            e.preventDefault();
            location.href = "/pro/dashboard";
          }}
        >
          Register
        </Button>
      ) : (
        <Button
          appearance="positive"
          onClick={(e) => {
            e.preventDefault();
            localStorage.setItem(
              "shop-checkout-data",
              JSON.stringify(shopCheckoutData),
            );
            location.href = "/account/checkout";
          }}
        >
          Continue to checkout
        </Button>
      )}
    </>
  );
}
