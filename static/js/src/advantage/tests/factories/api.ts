import { Factory } from "fishery";
import {
  ContractToken,
  UserSubscription,
  UserSubscriptionEntitlement,
  UserSubscriptionStatuses,
} from "advantage/api/types";
import {
  EntitlementType,
  UserSubscriptionMachineType,
  UserSubscriptionPeriod,
  UserSubscriptionMarketplace,
  UserSubscriptionType,
} from "advantage/api/enum";

export const userSubscriptionEntitlementFactory = Factory.define<UserSubscriptionEntitlement>(
  () => ({
    enabled_by_default: true,
    support_level: null,
    type: EntitlementType.EsmApps,
  })
);

export const userSubscriptionStatusesFactory = Factory.define<UserSubscriptionStatuses>(
  () => ({
    is_cancellable: false,
    is_cancelled: false,
    is_downsizeable: false,
    is_expired: false,
    is_expiring: false,
    is_in_grace_period: false,
    is_renewable: false,
    is_trialled: false,
    is_upsizeable: false,
  })
);

export const userSubscriptionFactory = Factory.define<UserSubscription>(
  ({ sequence }) => ({
    account_id: `aBWF0x8vv5S684ZTeXMnJmUuVO7AyCYZzvjY3J${sequence}`,
    contract_id: `mUuVO7AyCYZzvjY3JaBWF0x8vv5S684ZTeXMnJ${sequence}`,
    end_date: new Date("2022-07-09T07:21:21Z"),
    entitlements: [],
    listing_id: `lADzAkHCZRIASpBZ8YiAiCT2XbDpBSyER7j9vj${sequence}`,
    marketplace: UserSubscriptionMarketplace.CanonicalUA,
    machine_type: UserSubscriptionMachineType.Physical,
    number_of_machines: 1,
    period: UserSubscriptionPeriod.Yearly,
    price_per_unit: 150000,
    product_name: "UA Applications - Standard (Physical)",
    start_date: new Date("2021-08-11T02:56:54Z"),
    statuses: userSubscriptionStatusesFactory.build(),
    type: UserSubscriptionType.Yearly,
  })
);

export const freeSubscriptionFactory = Factory.define<UserSubscription>(
  ({ sequence }) => ({
    account_id: `F9sf54ZfJt59AMwynubzPyaGE9Z4D${sequence}`,
    contract_id: `mUuVO7AyCYZzvjY3JaBWF0x8vv5S684ZTeXMnJ${sequence}`,
    end_date: null,
    entitlements: [],
    listing_id: null,
    marketplace: UserSubscriptionMarketplace.Free,
    machine_type: UserSubscriptionMachineType.Physical,
    number_of_machines: 3,
    period: null,
    price_per_unit: null,
    product_name: null,
    start_date: new Date("2021-07-09T07:14:56Z"),
    statuses: userSubscriptionStatusesFactory.build(),
    type: UserSubscriptionType.Free,
  })
);

export const contractTokenFactory = Factory.define<ContractToken>(
  ({ sequence }) => ({
    contract_token: `zPyaGE9Z4DF9sf54ZfJt59AMwynub${sequence}`,
  })
);
