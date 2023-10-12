import { UserSubscriptionMarketplace } from "advantage/api/enum";

export type Product = {
  longId?: string;
  name: string;
  price?: {
    value: number;
    currency: string;
  };
  id: string;
  marketplace?: UserSubscriptionMarketplace;
  metadata: Array<{ key: string; value: string }>;
};
