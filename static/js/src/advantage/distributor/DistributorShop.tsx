import React from "react";
import DistributorShopForm from "./components/DistributorShopForm/DistributorShopForm";
import { Offer as OfferType } from "../offers/types";
import DistributorShopSummary from "./components/DistributorShopForm/DistributorShopSummary/DistributorShopSummary";
import { Strip } from "@canonical/react-components";

const DistributorShop = () => {
  const channelOfferData = localStorage.getItem("channel-offer-data");
  const parsedChannelOfferData =
    channelOfferData && JSON.parse(channelOfferData);
  const offer = parsedChannelOfferData?.offer;

  if (!channelOfferData || !parsedChannelOfferData || !offer) {
    return (
      <Strip className="p-section">
        <h1>Somethinig is wrong.</h1>
        <p>
          Initiate order again at <a href="/pro/distributor">this page</a>.
        </p>
      </Strip>
    );
  }

  return (
    <>
      <DistributorShopForm offer={offer as OfferType} />
      <DistributorShopSummary offer={offer as OfferType} />
    </>
  );
};

export default DistributorShop;
