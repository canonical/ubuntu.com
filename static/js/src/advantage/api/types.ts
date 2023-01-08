import {
  EntitlementType,
  SupportLevel,
  UserSubscriptionMachineType,
  UserSubscriptionMarketplace,
  UserSubscriptionPeriod,
  UserSubscriptionType,
} from "./enum";

export type PendingPurchaseId = string;

export type StripePublishableKey = string;

export type UserSubscriptionEntitlement = {
  enabled_by_default: boolean;
  is_in_beta: boolean;
  is_available: boolean;
  is_editable: boolean;
  support_level: SupportLevel | null;
  type: EntitlementType;
};

export type UserSubscriptionEntitlementUpdate = {
  type: EntitlementType;
  is_enabled: boolean;
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
  is_subscription_active: boolean;
  is_subscription_auto_renewing: boolean;
  should_present_auto_renewal: boolean;
  has_access_to_support: boolean;
  has_access_to_token: boolean;
  is_renewed: boolean;
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
  current_number_of_machines: number;
  number_of_machines: number;
  number_of_active_machines: number;
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
  [UserSubscriptionMarketplace.CanonicalUA]: {
    monthly: string;
    yearly: string;
  };
  [UserSubscriptionMarketplace.Blender]: {
    monthly: string;
    yearly: string;
  };
  [UserSubscriptionMarketplace.CanonicalCUBE]?: {
    monthly: string;
    yearly: string;
  };
  [UserSubscriptionMarketplace.Free]?: {
    monthly: string;
    yearly: string;
  };
};
