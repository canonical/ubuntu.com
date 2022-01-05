import {
  UserSubscriptionMarketplace,
  UserSubscriptionPeriod,
} from "./../../../api/enum";
import { Factory } from "fishery";
import { Offer, ProductListing, Price } from "../../types";

export const PriceFactory = Factory.define<Price>(() => ({
  currency: "USD",
  value: 10000,
}));

export const ProductListingFactory = Factory.define<ProductListing>(() => ({
  allowanceMetric: "units",
  allowance: 5,
  bundleQuantity: 1,
  createdAt: "2021-11-24T17:02:15.998Z",
  effectiveDays: 365,
  id: "abcdefghijklmnopqrstuvwxyz",
  lastModifiedAt: "2021-11-24T17:02:15.998Z",
  marketplace: UserSubscriptionMarketplace.CanonicalUA,
  name: "",
  period: UserSubscriptionPeriod.Yearly,
  price: PriceFactory.build(),
  productID: "123456789",
  status: "active",
}));

export const OfferFactory = Factory.define<Offer>(() => ({
  accountID: "account-123456789",
  actionable: true,
  createdAt: "2021-11-24T17:02:15.998Z",
  externalIDs: null,
  id: "a1b2c3d4e5f6g7h8i9j0",
  lastModified: "2021-11-24T17:02:15.998Z",
  marketplace: UserSubscriptionMarketplace.CanonicalUA,
  productListings: [ProductListingFactory.build()],
}));
