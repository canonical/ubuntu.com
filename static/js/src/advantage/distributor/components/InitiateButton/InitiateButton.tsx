import { useContext } from "react";
import { Button } from "@canonical/react-components";
import { Offer as OfferType } from "../../../offers/types";
import { FormContext } from "advantage/distributor/utils/FormContext";
import { DISTRIBUTOR_SELECTOR_KEYS } from "advantage/distributor/utils/utils";

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
          localStorage.setItem(
            DISTRIBUTOR_SELECTOR_KEYS.OFFER_DATA,
            JSON.stringify(offer),
          );
          location.href = "/pro/distributor/shop";
        }}
        disabled={!offer.actionable || offer.purchase}
      >
        {offer.purchase ? "Already used" : "Initiate order"}
      </Button>
    </div>
  );
}
