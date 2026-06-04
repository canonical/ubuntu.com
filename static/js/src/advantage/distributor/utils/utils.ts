import { UserSubscriptionMarketplace } from "advantage/api/enum";
import { OfferItem } from "advantage/offers/types";

export function generateUniqueId() {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export type Metadata = {
  key: string;
  value: string;
};

export type SubscriptionItem = {
  id: string;
  type: DistributorProductTypes;
  support: Support;
  sla: SLA;
  quantity: number;
};

export type ValidProducts =
  | `${ValidProductID}-${Durations}y-channel-${Currencies}`
  | "no-product";

export enum DistributorProductTypes {
  physical = "physical",
  desktop = "desktop",
  virtual = "virtual",
}

export enum SLA {
  none = "none",
  weekday = "Weekday",
  everyday = "24/7",
}

export enum Support {
  none = "none",
  infra = "Infra",
  full = "Full",
}

export enum Durations {
  one = 1 as number,
  two = 2 as number,
  three = 3 as number,
}

export enum Currencies {
  usd = "usd",
  gbp = "gbp",
  eur = "eur",
}

export type TechnicalUserContact = {
  name: string;
  email: string;
};

export type ProductListings = { [key: string]: ChannelProduct };

export type ChannelProduct = {
  id: string;
  longId: string;
  name: string;
  price: {
    value: number;
    currency: string;
  };
  productID: ValidProductID;
  productName: string;
  marketplace: UserSubscriptionMarketplace;
  exclusion_group: string;
  effective_days?: number;
};

export const currencyFormatter = (currency: Currencies) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  });
};

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

export type ValidProductID =
  | "uaia-essential-physical"
  | "uio-standard-physical"
  | "uio-advanced-physical"
  | "uaia-standard-physical"
  | "uaia-advanced-physical"
  | "uaia-essential-virtual"
  | "uaia-standard-virtual"
  | "uaia-advanced-virtual"
  | "uio-standard-virtual"
  | "uio-advanced-virtual"
  | "uai-essential-desktop"
  | "uai-standard-desktop"
  | "uai-advanced-desktop"
  | "no-product";

export const getProductId = (
  productType: DistributorProductTypes,
  support: Support,
  sla: SLA,
): ValidProductID => {
  const productKey = `${productType}-${support}-${sla}`;
  switch (productKey) {
    case `${DistributorProductTypes.physical}-${Support.infra}-${SLA.weekday}`:
      return "uio-standard-physical";
    case `${DistributorProductTypes.physical}-${Support.infra}-${SLA.everyday}`:
      return "uio-advanced-physical";
    case `${DistributorProductTypes.physical}-${Support.none}-${SLA.none}`:
      return "uaia-essential-physical";
    case `${DistributorProductTypes.physical}-${Support.full}-${SLA.weekday}`:
      return "uaia-standard-physical";
    case `${DistributorProductTypes.physical}-${Support.full}-${SLA.everyday}`:
      return "uaia-advanced-physical";
    case `${DistributorProductTypes.virtual}-${Support.none}-${SLA.none}`:
      return "uaia-essential-virtual";
    case `${DistributorProductTypes.virtual}-${Support.full}-${SLA.weekday}`:
      return "uaia-standard-virtual";
    case `${DistributorProductTypes.virtual}-${Support.full}-${SLA.everyday}`:
      return "uaia-advanced-virtual";
    case `${DistributorProductTypes.virtual}-${Support.infra}-${SLA.weekday}`:
      return "uio-standard-virtual";
    case `${DistributorProductTypes.virtual}-${Support.infra}-${SLA.everyday}`:
      return "uio-advanced-virtual";
    case `${DistributorProductTypes.desktop}-${Support.none}-${SLA.none}`:
      return "uai-essential-desktop";
    case `${DistributorProductTypes.desktop}-${Support.full}-${SLA.weekday}`:
      return "uai-standard-desktop";
    case `${DistributorProductTypes.desktop}-${Support.full}-${SLA.everyday}`:
      return "uai-advanced-desktop";
    default:
      return "no-product";
  }
};

export const getPreSelectedItem = (item: OfferItem) => {
  const { id, allowance, productID } = item;
  const quantity = allowance;

  switch (productID) {
    case "uio-standard-physical":
      return {
        id,
        type: DistributorProductTypes.physical,
        support: Support.infra,
        sla: SLA.weekday,
        quantity,
      };
    case "uio-advanced-physical":
      return {
        id,
        type: DistributorProductTypes.physical,
        support: Support.infra,
        sla: SLA.everyday,
        quantity,
      };
    case "uaia-essential-physical":
      return {
        id,
        type: DistributorProductTypes.physical,
        support: Support.none,
        sla: SLA.none,
        quantity,
      };
    case "uaia-standard-physical":
      return {
        id,
        type: DistributorProductTypes.physical,
        support: Support.full,
        sla: SLA.weekday,
        quantity,
      };
    case "uaia-advanced-physical":
      return {
        id,
        type: DistributorProductTypes.physical,
        support: Support.full,
        sla: SLA.everyday,
        quantity,
      };
    case "uaia-essential-virtual":
      return {
        id,
        type: DistributorProductTypes.virtual,
        support: Support.none,
        sla: SLA.none,
        quantity,
      };
    case "uaia-standard-virtual":
      return {
        id,
        type: DistributorProductTypes.virtual,
        support: Support.full,
        sla: SLA.weekday,
        quantity,
      };
    case "uaia-advanced-virtual":
      return {
        id,
        type: DistributorProductTypes.virtual,
        support: Support.full,
        sla: SLA.everyday,
        quantity,
      };
    case "uio-standard-virtual":
      return {
        id,
        type: DistributorProductTypes.virtual,
        support: Support.infra,
        sla: SLA.weekday,
        quantity,
      };
    case "uio-advanced-virtual":
      return {
        id,
        type: DistributorProductTypes.virtual,
        support: Support.infra,
        sla: SLA.everyday,
        quantity,
      };
    case "uai-essential-desktop":
      return {
        id,
        type: DistributorProductTypes.desktop,
        support: Support.none,
        sla: SLA.none,
        quantity,
      };
    case "uai-standard-desktop":
      return {
        id,
        type: DistributorProductTypes.desktop,
        support: Support.full,
        sla: SLA.weekday,
        quantity,
      };
    case "uai-advanced-desktop":
      return {
        id,
        type: DistributorProductTypes.desktop,
        support: Support.full,
        sla: SLA.everyday,
        quantity,
      };
    default:
      return null;
  }
};

export const getPreCurrency = (item: OfferItem): Currencies => {
  const currency = item?.currency?.toLowerCase();
  return Object.values(Currencies).includes(currency as Currencies)
    ? (currency as Currencies)
    : Currencies.usd;
};

export const getPreDuration = (item: OfferItem): Durations => {
  if (item.effectiveDays === 365) return Durations.one;
  else if (item.effectiveDays === 730) return Durations.two;
  else if (item.effectiveDays === 1095) return Durations.three;
  return Durations.one;
};

export const PRO_SELECTOR_KEYS = {
  PRODUCT_TYPE: "pro-selector-productType",
  VERSION: "pro-selector-version",
  QUANTITY: "pro-selector-quantity",
  FEATURE: "pro-selector-feature",
  SUPPORT: "pro-selector-support",
  SLA: "pro-selector-sla",
  PERIOD: "pro-selector-period",
  PUBLIC_CLOUD: "pro-selector-publicCloud",
  PRODUCT_USER: "pro-selector-productUser",
  IOT_DEVICE: "pro-selector-iotDevice",
} as const;

export const DISTRIBUTOR_SELECTOR_KEYS = {
  SUBSCRIPTION_LIST: "distributor-selector-subscriptionList",
  CURRENCY: "distributor-selector-currency",
  OFFER_DATA: "channel-offer-data",
  DURATION: "distributor-selector-duration",
  TECHNICAL_USER_CONTACT: "distributor-selector-technicalUserContact",
  PRODUCT_TYPE: "distributor-selector-productType",
  PRODUCT_LISTING: "distributor-product-listing",
} as const;

export const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};
