import { UserSubscriptionMarketplace } from "./../../../api/enum";
import { Factory } from "fishery";
import { Offer, OfferItem } from "../../types";

export const ItemFactory = Factory.define<OfferItem>(() => ({
  allowance: 2,
  id: "lAOqpXALfo-fyPavKxNwlu6pAxNqcPNzxgz2Ya1p3K_4",
  name: "uai-advanced-desktop-1y-channel-eur-v1",
  price: 60000,
}));

export const ChannelOfferFactory = Factory.define<Offer>(() => ({
  actionable: true,
  account_id: "lAOqpXALfo-fyPavKxNwlu6pAxNqcPNzxgz2Ya1p3K_4",
  created_at: "2024-04-22T17:44:36Z",
  id: "oABmA3a_j82O4u-scDMNTncKQNbYD4brCAJbNAYiY7u0",
  items: [ItemFactory.build()],
  marketplace: UserSubscriptionMarketplace.CanonicalProChannel,
  total: 60000,
  is_channel_offer: true,
  discount: 10,
  channel_deal_creator_name: "Deal creator, Ltd.",
  distributor_account_name: "Distributor, Ltd.",
  end_user_account_name: "End Users, Ltd.",
  reseller_account_name: "Resellers, Inc.",
  technical_contact_email: "contact@example.com",
  technical_contact_name: "John Doe",
  opportunity_number: "12345",
  can_change_items: true,
  version: "1",
  activation_account_id: "aACel74nW_2C8T6Db2wdRACFlUaaaaa",
  external_ids: [
    {
      ids: ["zift-id-test"],
      origin: "Zift",
    },
  ],
}));
