import React from "react";
import CubePurchase from "../CubePurchase";

type Props = {
  studyLabURL: string;
  productName: string;
  productListingId: string;
  isEnrolled: boolean;
  buttonText?: string;
  buttonAppearance?: "neutral" | "positive";
};

const PrepareButton = ({
  studyLabURL,
  productName,
  productListingId,
  isEnrolled,
  buttonText = "Prepare",
  buttonAppearance = "neutral",
}: Props) => {
  return (
    <>
      {isEnrolled ? (
        <a
          className={`p-button--${buttonAppearance} u-no-margin--right`}
          href={studyLabURL}
        >
          {buttonText}
        </a>
      ) : (
        <CubePurchase
          productName={productName}
          productListingId={productListingId}
          buttonText={buttonText}
          buttonAppearance={buttonAppearance}
        />
      )}
    </>
  );
};

export default PrepareButton;
