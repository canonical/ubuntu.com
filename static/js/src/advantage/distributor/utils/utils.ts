import { marketplace } from "advantage/subscribe/checkout/utils/types";

export function generateUniqueId() {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export type SubscriptionItem = {
  id: string;
  type: DistributorProductTypes;
  support: Support;
  sla: SLA;
  quantity: number;
};

export type TechnicalContact = {
  name: string;
  email: string;
};

export type ValidProducts =
  | "Ubuntu Pro-one-year-usd"
  | "Ubuntu Pro-one-year-gbp"
  | "Ubuntu Pro-one-year-eur"
  | "Ubuntu Pro-two-year-usd"
  | "Ubuntu Pro-two-year-gbp"
  | "Ubuntu Pro-two-year-eur"
  | "Ubuntu Pro-three-year-usd"
  | "Ubuntu Pro-three-year-gbp"
  | "Ubuntu Pro-three-year-eur"
  | "Ubuntu Pro + Support (weekday)-one-year-usd"
  | "Ubuntu Pro + Support (weekday)-one-year-gbp"
  | "Ubuntu Pro + Support (weekday)-one-year-eur"
  | "Ubuntu Pro + Support (weekday)-two-year-usd"
  | "Ubuntu Pro + Support (weekday)-two-year-gbp"
  | "Ubuntu Pro + Support (weekday)-two-year-eur"
  | "Ubuntu Pro + Support (weekday)-three-year-usd"
  | "Ubuntu Pro + Support (weekday)-three-year-gbp"
  | "Ubuntu Pro + Support (weekday)-three-year-eur"
  | "Ubuntu Pro + Support (24/7)-one-year-usd"
  | "Ubuntu Pro + Support (24/7)-one-year-gbp"
  | "Ubuntu Pro + Support (24/7)-one-year-eur"
  | "Ubuntu Pro + Support (24/7)-two-year-usd"
  | "Ubuntu Pro + Support (24/7)-two-year-gbp"
  | "Ubuntu Pro + Support (24/7)-two-year-eur"
  | "Ubuntu Pro + Support (24/7)-three-year-usd"
  | "Ubuntu Pro + Support (24/7)-three-year-gbp"
  | "Ubuntu Pro + Support (24/7)-three-year-eur"
  | "Ubuntu Pro + Infra Support (weekday)-one-year-usd"
  | "Ubuntu Pro + Infra Support (weekday)-one-year-gbp"
  | "Ubuntu Pro + Infra Support (weekday)-one-year-eur"
  | "Ubuntu Pro + Infra Support (weekday)-two-year-usd"
  | "Ubuntu Pro + Infra Support (weekday)-two-year-gbp"
  | "Ubuntu Pro + Infra Support (weekday)-two-year-eur"
  | "Ubuntu Pro + Infra Support (weekday)-three-year-usd"
  | "Ubuntu Pro + Infra Support (weekday)-three-year-gbp"
  | "Ubuntu Pro + Infra Support (weekday)-three-year-eur"
  | "Ubuntu Pro + Infra Support (24/7)-one-year-usd"
  | "Ubuntu Pro + Infra Support (24/7)-one-year-gbp"
  | "Ubuntu Pro + Infra Support (24/7)-one-year-eur"
  | "Ubuntu Pro + Infra Support (24/7)-two-year-usd"
  | "Ubuntu Pro + Infra Support (24/7)-two-year-gbp"
  | "Ubuntu Pro + Infra Support (24/7)-two-year-eur"
  | "Ubuntu Pro + Infra Support (24/7)-three-year-usd"
  | "Ubuntu Pro + Infra Support (24/7)-three-year-gbp"
  | "Ubuntu Pro + Infra Support (24/7)-three-year-eur"
  | "Ubuntu Pro - Virtual-one-year-usd"
  | "Ubuntu Pro - Virtual-one-year-gbp"
  | "Ubuntu Pro - Virtual-one-year-eur"
  | "Ubuntu Pro - Virtual-two-year-usd"
  | "Ubuntu Pro - Virtual-two-year-gbp"
  | "Ubuntu Pro - Virtual-two-year-eur"
  | "Ubuntu Pro - Virtual-three-year-usd"
  | "Ubuntu Pro - Virtual-three-year-gbp"
  | "Ubuntu Pro - Virtual-three-year-eur"
  | "Ubuntu Pro - Virtual + Support (weekday)-one-year-usd"
  | "Ubuntu Pro - Virtual + Support (weekday)-one-year-gbp"
  | "Ubuntu Pro - Virtual + Support (weekday)-one-year-eur"
  | "Ubuntu Pro - Virtual + Support (weekday)-two-year-usd"
  | "Ubuntu Pro - Virtual + Support (weekday)-two-year-eur"
  | "Ubuntu Pro - Virtual + Support (weekday)-two-year-gbp"
  | "Ubuntu Pro - Virtual + Support (weekday)-three-year-usd"
  | "Ubuntu Pro - Virtual + Support (weekday)-three-year-gbp"
  | "Ubuntu Pro - Virtual + Support (weekday)-three-year-eur"
  | "Ubuntu Pro - Virtual + Support (24/7)-one-year-usd"
  | "Ubuntu Pro - Virtual + Support (24/7)-one-year-gbp"
  | "Ubuntu Pro - Virtual + Support (24/7)-one-year-eur"
  | "Ubuntu Pro - Virtual + Support (24/7)-two-year-usd"
  | "Ubuntu Pro - Virtual + Support (24/7)-two-year-gbp"
  | "Ubuntu Pro - Virtual + Support (24/7)-two-year-eur"
  | "Ubuntu Pro - Virtual + Support (24/7)-three-year-usd"
  | "Ubuntu Pro - Virtual + Support (24/7)-three-year-gbp"
  | "Ubuntu Pro - Virtual + Support (24/7)-three-year-eur"
  | "Ubuntu Pro - Virtual + Infra Support (weekday)-one-year-usd"
  | "Ubuntu Pro - Virtual + Infra Support (weekday)-one-year-gbp"
  | "Ubuntu Pro - Virtual + Infra Support (weekday)-one-year-eur"
  | "Ubuntu Pro - Virtual + Infra Support (weekday)-two-year-usd"
  | "Ubuntu Pro - Virtual + Infra Support (weekday)-two-year-gbp"
  | "Ubuntu Pro - Virtual + Infra Support (weekday)-two-year-eur"
  | "Ubuntu Pro - Virtual + Infra Support (weekday)-three-year-usd"
  | "Ubuntu Pro - Virtual + Infra Support (weekday)-three-year-gbp"
  | "Ubuntu Pro - Virtual + Infra Support (weekday)-three-year-eur"
  | "Ubuntu Pro - Virtual + Infra Support (24/7)-one-year-usd"
  | "Ubuntu Pro - Virtual + Infra Support (24/7)-one-year-gbp"
  | "Ubuntu Pro - Virtual + Infra Support (24/7)-one-year-eur"
  | "Ubuntu Pro - Virtual + Infra Support (24/7)-two-year-usd"
  | "Ubuntu Pro - Virtual + Infra Support (24/7)-two-year-gbp"
  | "Ubuntu Pro - Virtual + Infra Support (24/7)-two-year-eur"
  | "Ubuntu Pro - Virtual + Infra Support (24/7)-three-year-usd"
  | "Ubuntu Pro - Virtual + Infra Support (24/7)-three-year-gbp"
  | "Ubuntu Pro - Virtual + Infra Support (24/7)-three-year-eur"
  | "Ubuntu Pro Desktop-one-year-usd"
  | "Ubuntu Pro Desktop-one-year-gbp"
  | "Ubuntu Pro Desktop-one-year-eur"
  | "Ubuntu Pro Desktop-two-year-usd"
  | "Ubuntu Pro Desktop-two-year-gbp"
  | "Ubuntu Pro Desktop-two-year-eur"
  | "Ubuntu Pro Desktop-three-year-usd"
  | "Ubuntu Pro Desktop-three-year-gbp"
  | "Ubuntu Pro Desktop-three-year-eur"
  | "Ubuntu Pro Desktop + Support (weekday)-one-year-usd"
  | "Ubuntu Pro Desktop + Support (weekday)-one-year-gbp"
  | "Ubuntu Pro Desktop + Support (weekday)-one-year-eur"
  | "Ubuntu Pro Desktop + Support (weekday)-two-year-usd"
  | "Ubuntu Pro Desktop + Support (weekday)-two-year-gbp"
  | "Ubuntu Pro Desktop + Support (weekday)-two-year-eur"
  | "Ubuntu Pro Desktop + Support (weekday)-three-year-usd"
  | "Ubuntu Pro Desktop + Support (weekday)-three-year-gbp"
  | "Ubuntu Pro Desktop + Support (weekday)-three-year-eur"
  | "Ubuntu Pro Desktop + Support (24/7)-one-year-usd"
  | "Ubuntu Pro Desktop + Support (24/7)-one-year-gbp"
  | "Ubuntu Pro Desktop + Support (24/7)-one-year-eur"
  | "Ubuntu Pro Desktop + Support (24/7)-two-year-usd"
  | "Ubuntu Pro Desktop + Support (24/7)-two-year-gbp"
  | "Ubuntu Pro Desktop + Support (24/7)-two-year-eur"
  | "Ubuntu Pro Desktop + Support (24/7)-three-year-usd"
  | "Ubuntu Pro Desktop + Support (24/7)-three-year-gbp"
  | "Ubuntu Pro Desktop + Support (24/7)-three-year-eur"
  | "no-product";

export type ProductListings = {
  [key in ValidProducts]?: Product;
};

export enum DistributorProductTypes {
  physical = "physical",
  desktop = "desktop",
  virtual = "virtual",
}

export enum SLA {
  none = "none",
  weekday = "weekday",
  everyday = "24/7",
}

export enum Support {
  none = "none",
  infra = "Infra Support",
  full = "Support",
}

export enum Durations {
  one = "one-year",
  two = "two-year",
  three = "three-year",
}

export enum Currencies {
  usd = "usd",
  gbp = "gbp",
  eur = "eur",
}

export type ProductIDs = `${DistributorProductTypes}-${Durations}-${Currencies}`;

export type Product = {
  allowanceMetric: string;
  bundleQuantity: number;
  name: string;
  duration: Durations;
  price: {
    value: number;
    currency: string;
  };
  private: boolean;
  id: ProductIDs;
  productID: string;
  productName: string;
  status: string;
  marketplace: marketplace;
};

export const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export type ValidProductName =
  | "Ubuntu Pro"
  | "Ubuntu Pro + Infra Support (weekday)"
  | "Ubuntu Pro + Infra Support (24/7)"
  | "Ubuntu Pro + Support (weekday)"
  | "Ubuntu Pro + Support (24/7)"
  | "Ubuntu Pro - Virtual"
  | "Ubuntu Pro + Support (weekday) - Virtual"
  | "Ubuntu Pro + Support (24/7) - Virtual"
  | "Ubuntu Pro + Infra Support (weekday) - Virtual"
  | "Ubuntu Pro + Infra Support (24/7) - Virtual"
  | "Ubuntu Pro Desktop"
  | "Ubuntu Pro Desktop + Support (weekday)"
  | "Ubuntu Pro Desktop + Support (24/7)"
  | "no-product";

export const getProductName = (
  productType: DistributorProductTypes,
  support: Support,
  sla: SLA
): ValidProductName => {
  const productKey = `${productType}-${support}-${sla}`;
  switch (productKey) {
    case `${DistributorProductTypes.physical}-${Support.infra}-${SLA.weekday}`:
      return "Ubuntu Pro + Infra Support (weekday)";
    case `${DistributorProductTypes.physical}-${Support.infra}-${SLA.everyday}`:
      return "Ubuntu Pro + Infra Support (24/7)";
    case `${DistributorProductTypes.physical}-${Support.none}-${SLA.none}`:
      return "Ubuntu Pro";
    case `${DistributorProductTypes.physical}-${Support.full}-${SLA.weekday}`:
      return "Ubuntu Pro + Support (weekday)";
    case `${DistributorProductTypes.physical}-${Support.full}-${SLA.everyday}`:
      return "Ubuntu Pro + Support (24/7)";
    case `${DistributorProductTypes.virtual}-${Support.none}-${SLA.none}`:
      return "Ubuntu Pro - Virtual";
    case `${DistributorProductTypes.virtual}-${Support.full}-${SLA.weekday}`:
      return "Ubuntu Pro + Support (weekday) - Virtual";
    case `${DistributorProductTypes.virtual}-${Support.full}-${SLA.everyday}`:
      return "Ubuntu Pro + Support (24/7) - Virtual";
    case `${DistributorProductTypes.virtual}-${Support.infra}-${SLA.weekday}`:
      return "Ubuntu Pro + Infra Support (weekday) - Virtual";
    case `${DistributorProductTypes.virtual}-${Support.infra}-${SLA.everyday}`:
      return "Ubuntu Pro + Infra Support (24/7) - Virtual";
    case `${DistributorProductTypes.desktop}-${Support.none}-${SLA.none}`:
      return "Ubuntu Pro Desktop";
    case `${DistributorProductTypes.desktop}-${Support.full}-${SLA.weekday}`:
      return "Ubuntu Pro Desktop + Support (weekday)";
    case `${DistributorProductTypes.desktop}-${Support.full}-${SLA.everyday}`:
      return "Ubuntu Pro Desktop + Support (24/7)";
    default:
      return "no-product";
  }
};

export const getLabel = (
  toFind: string,
  array: { label: string; value: string }[]
) => {
  return array.find((element) => element.value === toFind)?.label;
};
