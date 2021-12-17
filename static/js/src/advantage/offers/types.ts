import { UserSubscriptionPeriod } from "../api/enum";
import { marketplace } from "../../PurchaseModal/utils/utils";

export type Price = {
  currency: string;
  value: number;
};

export type ProductListing = {
  allowanceMetric: string;
  allowance: number;
  bundleQuantity: number;
  createdAt: string;
  effectiveDays: number;
  id: string;
  lastModifiedAt: string;
  marketplace: marketplace;
  name: string;
  period: UserSubscriptionPeriod;
  price: Price;
  productID: string;
  status: string;
};

export type Offer = {
  accountID: string;
  actionable: boolean;
  createdAt: string;
  externalIDs: string | null;
  id: string;
  lastModified: string;
  marketplace: marketplace;
  productListings: [ProductListing];
};
