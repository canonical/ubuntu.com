import {
  AccountContractInfo,
  AccountInfo,
  GetContractTokenResponse,
} from "./contracts-types";

export type ContractToken = GetContractTokenResponse["contractToken"];

export type ContractWithToken = AccountContractInfo & {
  token: ContractToken;
};

export type PendingPurchaseId = string;

export type PersonalAccount = AccountInfo & {
  contracts: ContractWithToken[];
  free_token: ContractToken;
};

export type UsingTestBackend = boolean;

export type UserSubscriptionEntitlement = {
  enabled_by_default: boolean;
  support_level: "essential" | "advanced" | "standard" | null;
  type: string;
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

export enum UserSubscriptionType {
  Free = "free",
  Yearly = "yearly",
  Monthly = "monthly",
  Trial = "trial",
  Legacy = "legacy",
}

export type UserSubscription = {
  account_id: string;
  end_date: Date | null;
  entitlements: UserSubscriptionEntitlement[];
  listing_id: string | null;
  machine_type: string;
  marketplace: string;
  number_of_machines: number;
  period: string | null;
  price_per_unit: number | null;
  product_name: string | null;
  start_date: Date;
  statuses: UserSubscriptionStatuses;
  type: UserSubscriptionType;
};
