import {
  EntitlementType,
  SupportLevel,
  UserSubscriptionMachineType,
  UserSubscriptionMarketplace,
  UserSubscriptionPeriod,
  UserSubscriptionType,
} from "./enum";

export type PendingPurchaseId = string;

export type UserSubscriptionEntitlement = {
  enabled_by_default: boolean;
  support_level: SupportLevel | null;
  type: EntitlementType | string;
};

export type UserSubscriptionStatuses = {
  has_pending_purchases: boolean;
  is_cancellable: boolean;
  is_cancelled: boolean;
  is_downsizeable: boolean;
  is_expired: boolean;
  is_expiring: boolean;
  is_in_grace_period: boolean;
  is_renewable: boolean;
  is_renewal_actionable: boolean;
  is_trialled: boolean;
  is_upsizeable: boolean;
};

export type UserSubscription = {
  id: string;
  account_id: string;
  contract_id: string;
  currency: string;
  end_date: Date | null;
  entitlements: UserSubscriptionEntitlement[];
  listing_id: string | null;
  machine_type: UserSubscriptionMachineType;
  marketplace: UserSubscriptionMarketplace;
  number_of_machines: number;
  period: UserSubscriptionPeriod | null;
  price: number | null;
  product_name: string | null;
  renewal_id: string | null;
  start_date: Date;
  statuses: UserSubscriptionStatuses;
  subscription_id: string | null;
  type: UserSubscriptionType;
};

export type ContractToken = {
  contract_token: string;
};

export type LastPurchaseIds = {
  monthly: string;
  yearly: string;
};
