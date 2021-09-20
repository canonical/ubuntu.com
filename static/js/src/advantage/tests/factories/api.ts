import { Factory } from "fishery";
import {
  ContractToken,
  LastPurchaseIds,
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
    id: `yearly||aBWF0x8vv5S6VO7AyCYZzvjY3JQr384ZTeXMnJmUuf${sequence}||X82c-derYgcJzAIxn9oCkTmnj8RdWWTp2kT9xQ0Bl3${sequence}`,
    account_id: `aBWF0x8vv5S684ZTeXMnJmUuVO7AyCYZzvjY3J${sequence}`,
    contract_id: `mUuVO7AyCYZzvjY3JaBWF0x8vv5S684ZTeXMnJ${sequence}`,
    currency: "USD",
    end_date: new Date("2022-07-09T07:21:21Z"),
    entitlements: [],
    listing_id: `lADzAkHCZRIASpBZ8YiAiCT2XbDpBSyER7j9vj${sequence}`,
    machine_type: UserSubscriptionMachineType.Physical,
    marketplace: UserSubscriptionMarketplace.CanonicalUA,
    number_of_machines: 1,
    period: UserSubscriptionPeriod.Yearly,
    price: 150000,
    product_name: "UA Applications - Standard (Physical)",
    renewal_id: `jY3JaBWF0x8vv5S68mUuVO7AyCYZzv4ZTeXMnJ${sequence}`,
    start_date: new Date("2021-08-11T02:56:54Z"),
    statuses: userSubscriptionStatusesFactory.build(),
    subscription_id: `VO7AyCYZzvjY3JaBWF0xmUu8vv5S684ZTeXMnJ${sequence}`,
    type: UserSubscriptionType.Yearly,
  })
);

export const freeSubscriptionFactory = Factory.define<UserSubscription>(
  ({ sequence }) => ({
    id: `monthly||Y3JQr384aBWF0x8vv5S6VO7AyCYZzvjZTeXMnJmUuf${sequence}||n9oCkTmnX82c-derYgcJzAIxj8RdWWTp2kT9xQ0Bl3${sequence}`,
    account_id: `F9sf54ZfJt59AMwynubzPyaGE9Z4D${sequence}`,
    contract_id: `mUuVO7AyCYZzvjY3JaBWF0x8vv5S684ZTeXMnJ${sequence}`,
    currency: "USD",
    end_date: null,
    entitlements: [],
    listing_id: null,
    machine_type: UserSubscriptionMachineType.Physical,
    marketplace: UserSubscriptionMarketplace.Free,
    number_of_machines: 3,
    period: null,
    price: null,
    product_name: null,
    renewal_id: null,
    start_date: new Date("2021-07-09T07:14:56Z"),
    statuses: userSubscriptionStatusesFactory.build(),
    subscription_id: null,
    type: UserSubscriptionType.Free,
  })
);

export const contractTokenFactory = Factory.define<ContractToken>(
  ({ sequence }) => ({
    contract_token: `zPyaGE9Z4DF9sf54ZfJt59AMwynub${sequence}`,
  })
);

export const lastPurchaseIdsFactory = Factory.define<LastPurchaseIds>(
  ({ sequence }) => ({
    monthly: `Jt59AzPyaGE9Z4DF9sf54ZfMwynub${sequence}`,
    yearly: `54ZfJ9AMwyzPyaGE9Z4DF9sf5tnub${sequence}`,
  })
);
