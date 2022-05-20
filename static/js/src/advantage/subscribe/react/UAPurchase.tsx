import React from "react";
import useProduct from "./hooks/useProduct";
import usePreview from "./hooks/usePreview";
import Summary from "./components/Summary";
import PurchaseModal from "../../../PurchaseModal";
import BuyButton from "./components/BuyButton";
import { Section } from "@canonical/react-components";
import useStripeCustomerInfo from "../../../PurchaseModal/hooks/useStripeCustomerInfo";
import Heading from "./components/Heading";
import Form from "./components/Form";
import ProductSummary from "./components/ProductSummary";

const UAPurchase = () => {
  const { product, quantity } = useProduct();
  const { data: preview } = usePreview();
  const { data: userInfo } = useStripeCustomerInfo();
  const freeTrial = false;

  const termsLabel = (
    <>
      I agree to the{" "}
      <a
        href="/legal/ubuntu-advantage-service-terms"
        target="_blank"
        rel="noopener noreferrer"
      >
        Ubuntu Advantage service terms
      </a>
    </>
  );

  const marketingLabel =
    "I agree to receive information about Canonical's products and services";

  const closeModal = window.handleTogglePurchaseModal ?? (() => {});

  return (
    <>
      <Heading />
      <Form />
      <ProductSummary />
      {/* <PurchaseModal
        termsLabel={termsLabel}
        marketingLabel={marketingLabel}
        product={product}
        preview={preview}
        quantity={quantity}
        closeModal={closeModal}
        Summary={Summary}
        BuyButton={BuyButton}
        isFreeTrialApplicable={true}
        marketplace="canonical-ua"
      /> */}
    </>
  );
};

export default UAPurchase;
