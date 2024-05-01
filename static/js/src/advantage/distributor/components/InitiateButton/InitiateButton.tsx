import React from "react";
import { Button } from "@canonical/react-components";
import { Offer as OfferType } from "../../../offers/types";

type Prop = {
  offer: OfferType;
};

export default function InitiateButton({ offer }: Prop) {
  const channelOfferData = {
    offer: offer,
  };
  return (
    <>
      <Button
        className="u-no-margin--bottom"
        disabled={!offer.actionable}
        onClick={(e) => {
          e.preventDefault();
          localStorage.setItem(
            "channel-offer-data",
            JSON.stringify(channelOfferData)
          );
          location.href = "/pro/distributor/shop";
        }}
      >
        Initiate order
      </Button>
    </>
  );
}
