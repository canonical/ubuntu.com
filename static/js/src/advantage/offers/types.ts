import { UserSubscriptionMarketplace } from "advantage/api/enum";

export type Item = {
  allowance: number;
  id: string;
  name: string;
  price: number;
};

export type Offer = {
  account_id: string;
  actionable: boolean;
  created_at: string;
  id: string;
  items: Item[];
  marketplace: UserSubscriptionMarketplace;
  total: number;
  discount?: number | null;
};
