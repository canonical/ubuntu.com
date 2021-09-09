import {
  EntitlementType,
  SupportLevel,
  UserSubscriptionMachineType,
  UserSubscriptionMarketplace,
  UserSubscriptionPeriod,
  UserSubscriptionType,
} from "./enum";

export type PendingPurchaseId = string;

export type UsingTestBackend = boolean;

export type UserSubscriptionEntitlement = {
  enabled_by_default: boolean;
  support_level: SupportLevel | null;
  type: EntitlementType | string;
};

export type UserSubscriptionStatuses = {
  is_cancellable: boolean;
  is_cancelled: boolean;
  is_downsizeable: boolean;
  is_expired: boolean;
  is_expiring: boolean;
  is_in_grace_period: boolean;
  is_renewable: boolean;
  is_trialled: boolean;
  is_upsizeable: boolean;
};

export type UserSubscription = {
  account_id: string;
  contract_id: string;
  end_date: Date | null;
  entitlements: UserSubscriptionEntitlement[];
  listing_id: string | null;
  marketplace: UserSubscriptionMarketplace;
  machine_type: UserSubscriptionMachineType;
  number_of_machines: number;
  period: UserSubscriptionPeriod | null;
  price_per_unit: number | null;
  product_name: string | null;
  start_date: Date;
  statuses: UserSubscriptionStatuses;
  type: UserSubscriptionType;
};

export type ContractToken = {
  contract_token: string;
};
