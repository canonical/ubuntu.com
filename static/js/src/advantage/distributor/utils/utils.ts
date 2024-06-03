import { Item } from "advantage/offers/types";
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
  | "uaia-essential-physical-channel-one-year-usd"
  | "uaia-essential-physical-channel-one-year-gbp"
  | "uaia-essential-physical-channel-one-year-eur"
  | "uaia-essential-physical-channel-two-year-usd"
  | "uaia-essential-physical-channel-two-year-gbp"
  | "uaia-essential-physical-channel-two-year-eur"
  | "uaia-essential-physical-channel-three-year-usd"
  | "uaia-essential-physical-channel-three-year-gbp"
  | "uaia-essential-physical-channel-three-year-eur"
  | "uaia-standard-physical-channel-one-year-usd"
  | "uaia-standard-physical-channel-one-year-gbp"
  | "uaia-standard-physical-channel-one-year-eur"
  | "uaia-standard-physical-channel-two-year-usd"
  | "uaia-standard-physical-channel-two-year-gbp"
  | "uaia-standard-physical-channel-two-year-eur"
  | "uaia-standard-physical-channel-three-year-usd"
  | "uaia-standard-physical-channel-three-year-gbp"
  | "uaia-standard-physical-channel-three-year-eur"
  | "uaia-advanced-physical-channel-one-year-usd"
  | "uaia-advanced-physical-channel-one-year-gbp"
  | "uaia-advanced-physical-channel-one-year-eur"
  | "uaia-advanced-physical-channel-two-year-usd"
  | "uaia-advanced-physical-channel-two-year-gbp"
  | "uaia-advanced-physical-channel-two-year-eur"
  | "uaia-advanced-physical-channel-three-year-usd"
  | "uaia-advanced-physical-channel-three-year-gbp"
  | "uaia-advanced-physical-channel-three-year-eur"
  | "uio-standard-physical-channel-one-year-usd"
  | "uio-standard-physical-channel-one-year-gbp"
  | "uio-standard-physical-channel-one-year-eur"
  | "uio-standard-physical-channel-two-year-usd"
  | "uio-standard-physical-channel-two-year-gbp"
  | "uio-standard-physical-channel-two-year-eur"
  | "uio-standard-physical-channel-three-year-usd"
  | "uio-standard-physical-channel-three-year-gbp"
  | "uio-standard-physical-channel-three-year-eur"
  | "uio-advanced-physical-channel-one-year-usd"
  | "uio-advanced-physical-channel-one-year-gbp"
  | "uio-advanced-physical-channel-one-year-eur"
  | "uio-advanced-physical-channel-two-year-usd"
  | "uio-advanced-physical-channel-two-year-gbp"
  | "uio-advanced-physical-channel-two-year-eur"
  | "uio-advanced-physical-channel-three-year-usd"
  | "uio-advanced-physical-channel-three-year-gbp"
  | "uio-advanced-physical-channel-three-year-eur"
  | "uaia-essential-virtual-channel-one-year-usd"
  | "uaia-essential-virtual-channel-one-year-gbp"
  | "uaia-essential-virtual-channel-one-year-eur"
  | "uaia-essential-virtual-channel-two-year-usd"
  | "uaia-essential-virtual-channel-two-year-gbp"
  | "uaia-essential-virtual-channel-two-year-eur"
  | "uaia-essential-virtual-channel-three-year-usd"
  | "uaia-essential-virtual-channel-three-year-gbp"
  | "uaia-essential-virtual-channel-three-year-eur"
  | "uaia-standard-virtual-channel-one-year-usd"
  | "uaia-standard-virtual-channel-one-year-gbp"
  | "uaia-standard-virtual-channel-one-year-eur"
  | "uaia-standard-virtual-channel-two-year-usd"
  | "uaia-standard-virtual-channel-two-year-eur"
  | "uaia-standard-virtual-channel-two-year-gbp"
  | "uaia-standard-virtual-channel-three-year-usd"
  | "uaia-standard-virtual-channel-three-year-gbp"
  | "uaia-standard-virtual-channel-three-year-eur"
  | "uaia-advanced-virtual-channel-one-year-usd"
  | "uaia-advanced-virtual-channel-one-year-gbp"
  | "uaia-advanced-virtual-channel-one-year-eur"
  | "uaia-advanced-virtual-channel-two-year-usd"
  | "uaia-advanced-virtual-channel-two-year-gbp"
  | "uaia-advanced-virtual-channel-two-year-eur"
  | "uaia-advanced-virtual-channel-three-year-usd"
  | "uaia-advanced-virtual-channel-three-year-gbp"
  | "uaia-advanced-virtual-channel-three-year-eur"
  | "uio-standard-virtual-channel-one-year-usd"
  | "uio-standard-virtual-channel-one-year-gbp"
  | "uio-standard-virtual-channel-one-year-eur"
  | "uio-standard-virtual-channel-two-year-usd"
  | "uio-standard-virtual-channel-two-year-gbp"
  | "uio-standard-virtual-channel-two-year-eur"
  | "uio-standard-virtual-channel-three-year-usd"
  | "uio-standard-virtual-channel-three-year-gbp"
  | "uio-standard-virtual-channel-three-year-eur"
  | "uio-advanced-virtual-channel-one-year-usd"
  | "uio-advanced-virtual-channel-one-year-gbp"
  | "uio-advanced-virtual-channel-one-year-eur"
  | "uio-advanced-virtual-channel-two-year-usd"
  | "uio-advanced-virtual-channel-two-year-gbp"
  | "uio-advanced-virtual-channel-two-year-eur"
  | "uio-advanced-virtual-channel-three-year-usd"
  | "uio-advanced-virtual-channel-three-year-gbp"
  | "uio-advanced-virtual-channel-three-year-eur"
  | "uai-essential-desktop-channel-one-year-usd"
  | "uai-essential-desktop-channel-one-year-gbp"
  | "uai-essential-desktop-channel-one-year-eur"
  | "uai-essential-desktop-channel-two-year-usd"
  | "uai-essential-desktop-channel-two-year-gbp"
  | "uai-essential-desktop-channel-two-year-eur"
  | "uai-essential-desktop-channel-three-year-usd"
  | "uai-essential-desktop-channel-three-year-gbp"
  | "uai-essential-desktop-channel-three-year-eur"
  | "uai-standard-desktop-channel-one-year-usd"
  | "uai-standard-desktop-channel-one-year-gbp"
  | "uai-standard-desktop-channel-one-year-eur"
  | "uai-standard-desktop-channel-two-year-usd"
  | "uai-standard-desktop-channel-two-year-gbp"
  | "uai-standard-desktop-channel-two-year-eur"
  | "uai-standard-desktop-channel-three-year-usd"
  | "uai-standard-desktop-channel-three-year-gbp"
  | "uai-standard-desktop-channel-three-year-eur"
  | "uai-advanced-desktop-channel-one-year-usd"
  | "uai-advanced-desktop-channel-one-year-gbp"
  | "uai-advanced-desktop-channel-one-year-eur"
  | "uai-advanced-desktop-channel-two-year-usd"
  | "uai-advanced-desktop-channel-two-year-gbp"
  | "uai-advanced-desktop-channel-two-year-eur"
  | "uai-advanced-desktop-channel-three-year-usd"
  | "uai-advanced-desktop-channel-three-year-gbp"
  | "uai-advanced-desktop-channel-three-year-eur"
  | "no-product";

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

export type ProductListings = Record<string, ChannelProduct>;

export type ChannelProduct = {
  id: string;
  name: ValidProducts;
  marketplace: marketplace;
  product: { id: ValidProductID; name: ValidProductName };
  price: number;
  currency: string;
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
  sla: SLA
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

export const getMockProductId = (
  productName: ValidProductName
): ValidProductID => {
  const responseMap: Record<ValidProductName, ValidProductID> = {
    "Ubuntu Pro": "uaia-essential-physical",
    "Ubuntu Pro + Infra Support (weekday)": "uio-standard-physical",
    "Ubuntu Pro + Infra Support (24/7)": "uio-advanced-physical",
    "Ubuntu Pro + Support (weekday)": "uaia-standard-physical",
    "Ubuntu Pro + Support (24/7)": "uaia-advanced-physical",
    "Ubuntu Pro - Virtual": "uaia-essential-virtual",
    "Ubuntu Pro + Support (weekday) - Virtual": "uaia-standard-virtual",
    "Ubuntu Pro + Support (24/7) - Virtual": "uaia-advanced-virtual",
    "Ubuntu Pro + Infra Support (weekday) - Virtual": "uio-standard-virtual",
    "Ubuntu Pro + Infra Support (24/7) - Virtual": "uio-advanced-virtual",
    "Ubuntu Pro Desktop": "uai-essential-desktop",
    "Ubuntu Pro Desktop + Support (weekday)": "uai-standard-desktop",
    "Ubuntu Pro Desktop + Support (24/7)": "uai-advanced-desktop",
    "no-product": "no-product",
  };

  return responseMap[productName] || "no-product";
};

export const getMockPrice = (productId: ValidProductID) => {
  const responseMap: Record<ValidProductID, number> = {
    "uai-essential-desktop": 2500,
    "uai-standard-desktop": 15000,
    "uai-advanced-desktop": 30000,
    "uaia-essential-physical": 50000,
    "uio-advanced-physical": 177500,
    "uio-standard-physical": 88500,
    "uaia-advanced-physical": 340000,
    "uaia-standard-physical": 170000,
    "uaia-essential-virtual": 16700,
    "uio-advanced-virtual": 59200,
    "uio-standard-virtual": 29500,
    "uaia-advanced-virtual": 113300,
    "uaia-standard-virtual": 56700,
    "no-product": 0,
  };
  return responseMap[productId] || 0;
};

export const mockProductNames: ValidProductName[] = [
  "Ubuntu Pro",
  "Ubuntu Pro + Infra Support (weekday)",
  "Ubuntu Pro + Infra Support (24/7)",
  "Ubuntu Pro + Support (weekday)",
  "Ubuntu Pro + Support (24/7)",
  "Ubuntu Pro - Virtual",
  "Ubuntu Pro + Support (weekday) - Virtual",
  "Ubuntu Pro + Support (24/7) - Virtual",
  "Ubuntu Pro + Infra Support (weekday) - Virtual",
  "Ubuntu Pro + Infra Support (24/7) - Virtual",
  "Ubuntu Pro Desktop",
  "Ubuntu Pro Desktop + Support (weekday)",
  "Ubuntu Pro Desktop + Support (24/7)",
];

const mockCurrencies: Currencies[] = [
  Currencies.eur,
  Currencies.gbp,
  Currencies.usd,
];
const mockDurations: Durations[] = [
  Durations.one,
  Durations.two,
  Durations.three,
];
const generateMockProductList = (
  productNames: ValidProductName[],
  currencies: Currencies[],
  durations: Durations[]
) => {
  const allList: ProductListings = {};

  for (const productName of productNames) {
    if (productName !== "no-product") {
      for (const currency of currencies) {
        for (const duration of durations) {
          const durationsNumber =
            duration === Durations.one ? 1 : duration === Durations.two ? 2 : 3;
          const productID = getMockProductId(productName);
          const name = `${getMockProductId(
            productName
          )}-channel-${duration}-${currency}` as ValidProducts;
          const value = Number(
            converMockCurrency(
              currency,
              getMockPrice(getMockProductId(productName))
            ) * durationsNumber
          );

          allList[name] = {
            id: "lAIeXbXxG9D_nA5v5C5DQeisJ4E2DkLrmxtjXzvCU2nE",
            name: name,
            marketplace: "canonical-pro-channel",
            product: {
              id: productID,
              name: productName,
            },
            price: value,
            currency: currency.toUpperCase(),
          };
        }
      }
    }
  }
  return allList;
};

function converMockCurrency(currency: Currencies, price: number): number {
  const usdToGbp = 0.72;
  const usdToEur = 0.85;
  if (currency === Currencies.gbp) {
    return price * usdToGbp;
  } else if (currency === Currencies.eur) {
    return price * usdToEur;
  } else {
    return price;
  }
}

export const mockProducList = generateMockProductList(
  mockProductNames,
  mockCurrencies,
  mockDurations
);

export const getPreSelectedItem = (items: Item[]) => {
  const preSelectedItem = items.map((item: Item) => {
    const { id } = item;
    const names = item?.name.split("-channel-");
    const name = names[0];
    const quantity = item?.allowance;
    switch (name) {
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
  });
  return preSelectedItem;
};

export const getPreCurrency = (items: Item[]) => {
  const preSelectedCurrency = items.map((item: Item) => {
    const names = item?.name.split("-channel-");
    const name = names[1];
    const year = name.split("-year-");
    const currency = year[1];
    return currency as keyof typeof Currencies;
  });
  return preSelectedCurrency[0];
};

export const getPreDuration = (items: Item[]) => {
  const preSelectedDuration = items.map((item: Item) => {
    const names = item?.name.split("-channel-");
    const name = names[1];
    const year = name.split("-year-")[0] as keyof typeof Durations;
    return Durations[year];
  });
  return preSelectedDuration[0];
};
