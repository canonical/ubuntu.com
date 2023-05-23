import { UserSubscriptionMarketplace } from "./../../../api/enum";
import { Factory } from "fishery";
import { Offer, Item } from "../../types";

export const ItemFactory = Factory.define<Item>(() => ({
  allowance: 2,
  id: "lAOqpXALfo-fyPavKxNwlu6pAxNqcPNzxgz2Ya1p3K_4",
  name: "uai-advanced-desktop-oneoff",
  price: 30000,
}));

export const OfferFactory = Factory.define<Offer>(() => ({
  actionable: true,
  account_id: "lAOqpXALfo-fyPavKxNwlu6pAxNqcPNzxgz2Ya1p3K_4",
  created_at: "2021-12-16T14:46:49Z",
  id: "oABmA3a_j82O4u-scDMNTncKQNbYD4brCAJbNAYiY7u0",
  items: [ItemFactory.build()],
  marketplace: UserSubscriptionMarketplace.CanonicalUA,
  total: 180000,
  discount: null,
}));

export const DiscountOfferFactory = Factory.define<Offer>(() => ({
  actionable: true,
  account_id: "lAOqpXALfo-fyPavKxNwlu6pAxNqcPNzxgz2Ya1p3K_4",
  created_at: "2021-12-16T14:46:49Z",
  id: "oABmA3a_j82O4u-scDMNTncKQNbYD4brCAJbNAYiY7u0",
  items: [ItemFactory.build()],
  marketplace: UserSubscriptionMarketplace.CanonicalUA,
  total: 340000,
  discount: 10.5,
}));
