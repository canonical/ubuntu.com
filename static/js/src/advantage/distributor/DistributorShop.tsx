import React from "react";
import { Strip } from "@canonical/react-components";
import DistributorShopForm from "./components/DistributorShopForm/DistributorShopForm";
import { Offer as OfferType } from "../offers/types";

const DistributorShop = () => {
  const channelOfferData = localStorage.getItem("channel-offer-data") || "";
  const parsedChannelOfferData = JSON.parse(channelOfferData);
  const offer = parsedChannelOfferData?.offer;

  if (!parsedChannelOfferData || !offer) {
    return (
      <Strip className="u-no-padding--top">
        <h1>Somethinig is wrong.</h1>
        <p className="p-heading--4">
          Initiate order again at <a href="/pro/distributor">this page</a>.
        </p>
      </Strip>
    );
  }

  return (
    <Strip className="u-no-padding--top" style={{ overflow: "unset" }}>
      <DistributorShopForm offer={offer as OfferType} />
    </Strip>
  );
};

export default DistributorShop;
