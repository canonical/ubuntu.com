import { UserSubscriptionMarketplace } from "advantage/api/enum";
import { Item } from "advantage/offers/types";

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

export type TechincalUserContact = {
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
  version: number;
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

const mockVersions = [1];

const generateMockProductList = (
  productNames: ValidProductName[],
  currencies: Currencies[],
  durations: Durations[],
  versions: number[]
) => {
  const allList: { [key: string]: ChannelProduct } = {};
  for (const productName of productNames) {
    if (productName !== "no-product") {
      for (const currency of currencies) {
        for (const duration of durations) {
          for (const version of versions) {
            const productID = getMockProductId(productName);
            const name = `${productID}-${duration}y-channel-${currency}`;
            const value = Number(
              converMockCurrency(currency, getMockPrice(productID)) * duration
            );

            const channelProduct: ChannelProduct = {
              id: `${name}-v${version}`, // valid product e.g. uai-essential-desktop-1y-channel-gbp-v1
              longId: "lACpi3WWwkw6XP09Zh5MciTF9_aRgK9cPF1RYERLaVlM", // listing.id
              name: `${name}-v${version}`, // e.g. uai-essential-desktop-1y-channel-gbp-v1
              price: {
                value: value, // listing.price
                currency: currency.toUpperCase(), // listing.currency
              },
              productID: productID, // listing.product.id e.g. uai-standard-desktop
              productName: productName, // listing.product.name e.g. Ubuntu Pro + Support (weekday)
              marketplace: UserSubscriptionMarketplace.CanonicalProChannel,
              version: version,
            };
            allList[name] = channelProduct as ChannelProduct;
          }
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
  mockDurations,
  mockVersions
);

export const getPreSelectedItem = (items: Item[]) => {
  const preSelectedItem = items.map((item: Item) => {
    const { id, name, allowance } = item;
    const quantity = allowance;
    const match = name.match(/(.*)-[123]y/);
    const baseName = match ? match[1] : null;
    switch (baseName) {
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

export const getPreCurrency = (items: Item[]): keyof typeof Currencies => {
  for (const item of items) {
    const name = item?.name;
    const pattern = /\b(eur|gbp|usd)\b/i;
    const match = name.match(pattern);

    if (match) {
      const currency = match[0].toLowerCase() as keyof typeof Currencies;
      return currency;
    }
  }
  return Currencies.usd;
};

export const getPreDuration = (items: Item[]): Durations => {
  for (const item of items) {
    const names = item?.name;
    const regex = /(\d)y/;
    const match = names.match(regex);
    if (match) {
      const duration = parseInt(match[1]);
      return duration;
    }
  }
  return Durations.one;
};
