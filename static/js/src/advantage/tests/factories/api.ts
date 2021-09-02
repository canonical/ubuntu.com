import { Factory } from "fishery";
import {
  UserSubscription,
  UserSubscriptionEntitlement,
  UserSubscriptionStatuses,
} from "advantage/api/types";
import { EntitlementType, UserSubscriptionType } from "advantage/api/enum";

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
    end_date: new Date("2022-07-09T07:21:21Z"),
    entitlements: [],
    listing_id: `lADzAkHCZRIASpBZ8YiAiCT2XbDpBSyER7j9vj${sequence}`,
    machine_type: "physical",
    marketplace: "canonical-ua",
    number_of_machines: 1,
    period: "yearly",
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
    end_date: null,
    entitlements: [],
    listing_id: null,
    machine_type: "physical",
    marketplace: "free",
    number_of_machines: 3,
    period: null,
    price_per_unit: null,
    product_name: null,
    start_date: new Date("2021-07-09T07:14:56Z"),
    statuses: userSubscriptionStatusesFactory.build(),
    type: UserSubscriptionType.Free,
  })
);
