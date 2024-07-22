import React, { useContext } from "react";
import { Button } from "@canonical/react-components";
import { Offer as OfferType } from "../../../offers/types";
import { FormContext } from "advantage/distributor/utils/FormContext";

type Prop = {
  offer: OfferType;
};

export default function InitiateButton({ offer }: Prop) {
  const { setOffer } = useContext(FormContext);

  return (
    <div className="distributor-initiate-button">
      <Button
        className="u-no-margin--bottom"
        onClick={(e) => {
          e.preventDefault();
          setOffer(offer);
          localStorage.setItem("channel-offer-data", JSON.stringify(offer));
          location.href = "/pro/distributor/shop";
        }}
        disabled={!offer.actionable || offer.purchase}
      >
        {offer.purchase ? "Already used" : "Initiate order"}
      </Button>
    </div>
  );
}
