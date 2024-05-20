import React from "react";
import DistributorShopForm from "./components/DistributorShopForm/DistributorShopForm";
import { Offer as OfferType } from "../offers/types";
import DistributorShopSummary from "./components/DistributorShopForm/DistributorShopSummary/DistributorShopSummary";

const DistributorShop = () => {
  // const channelOfferData = localStorage.getItem("channel-offer-data") || "";
  // const parsedChannelOfferData = JSON.parse(channelOfferData);
  // const offer = parsedChannelOfferData?.offer;
  // if (!parsedChannelOfferData || !offer) {
  //   return (
  //     <Strip className="u-no-padding--top">
  //       <h1>Somethinig is wrong.</h1>
  //       <p className="p-heading--4">
  //         Initiate order again at <a href="/pro/distributor">this page</a>.
  //       </p>
  //     </Strip>
  //   );
  // }
  const offer = {
    account_id: "aAIL8S9pbKfjiMl1_COENPU6ihwqQZzOxvyYdgnxHWYI",
    actionable: true,
    activation_account_id: "aACel74nW_2C8T6Db2wdRACFlUN-PZiYxcgx9hJ0EnKo",
    can_change_items: true,
    created_at: "2024-04-22T17:44:36Z",
    discount: 10,
    distributor_account_name: "Distributor, Ltd.",
    end_user_account_name: "End Users, Ltd.",
    external_ids: [
      {
        ids: ["zift-id-invalid"],
        origin: "Zift",
      },
    ],
    id: "oAPEY-cDXT1pr8r2_FBi1MX9bvJkPgfbyH9DeezYYGAw",
    is_channel_offer: true,
    items: [
      {
        allowance: 2,
        id: "lAIeXbXxG9D_nA5v5C5DQeisJ4E2DkLrmxtjXzvCU2nE",
        name: "uai-advanced-desktop-channel-two-year-usd",
        price: 60000,
      },
    ],
    marketplace: "canonical-pro-channel",
    reseller_account_name: "Resellers, Inc.",
    technical_contact: "contact@example.com",
    total: 60000,
  };

  return (
    <>
      <DistributorShopForm offer={offer as OfferType} />
      <DistributorShopSummary offer={offer as OfferType} />
    </>
  );
};

export default DistributorShop;
