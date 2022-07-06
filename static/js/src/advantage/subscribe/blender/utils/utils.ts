import { marketplace } from "./../../../../PurchaseModal/utils/utils";

export enum Support {
  unset = "unset",
  standard = "standard",
  advanced = "advanced",
}

export enum Periods {
  monthly = "monthly",
  yearly = "yearly",
}

export type ProductIDs = `blender-support-${Support}-${Periods}`;

export type Product = {
  canBeTrialled: boolean;
  longId: string;
  name: string;
  period: Periods;
  price: {
    value: number;
    currency: string;
  };
  private: boolean;
  id: ProductIDs;
  productID: string;
  marketplace: marketplace;
};

export type ProductListings = {
  [key in ProductIDs]?: Product;
};

export const isMonthlyAvailable = (product: Product | null) => {
  if (!product || !product.productID) return false;

  const monthlyID = `${product.productID}-${Periods.monthly}`;
  return !!window.blenderProductList[monthlyID as ProductIDs];
};
