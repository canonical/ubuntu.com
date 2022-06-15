// import React from "react";
// import PurchaseModal from "../../../PurchaseModal";
// import usePreview from "../../subscribe/react/hooks/usePreview";
// import Summary from "./Summary";
// import BuyButton from "./BuyButton";

// const BlenderPurchase = () => {
//   // const { product, quantity } = useProduct();
//   const { data: preview } = usePreview();

//   const termsLabel = (
//     <>
//       I agree to the{" "}
//       <a
//         href="/legal/ubuntu-advantage-service-terms"
//         target="_blank"
//         rel="noopener norefferer"
//       >
//         Ubuntu Advantage terms
//       </a>
//       , which apply to the{" "}
//       <a href="/legal/solution-support">Solution Support</a> service.
//     </>
//   );

//   const marketingLabel =
//     "I agree to receive information about Canonical's products and services";

//   const closeModal = () => {
//     const purchaseModal = document.querySelector("#purchase-modal");
//     purchaseModal?.classList.add("u-hide");
//   };

//   return (
//     <PurchaseModal
//       termsLabel={termsLabel}
//       marketingLabel={marketingLabel}
//       product={product}
//       preview={preview}
//       quantity={quantity}
//       closeModal={closeModal}
//       Summary={Summary}
//       BuyButton={BuyButton}
//       marketplace="blender"
//     />
//   );
// };

// export default BlenderPurchase;
