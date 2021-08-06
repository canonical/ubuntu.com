import { Factory } from "fishery";
import {
  AccountContractInfo,
  AccountInfo,
  AffordancesAptRepository,
  AllowanceInfo,
  BillingInfo,
  ContractInfo,
  ContractItem,
  DirectivesAptRepository,
  EntitlementAptRepository,
  ExternalIDs,
  Obligations,
  Price,
  Renewal,
  RenewalItem,
} from "advantage/api/contracts-types";

export const externalIDsFactory = Factory.define<ExternalIDs>(
  ({ sequence }) => ({
    origin: "free",
    IDs: [`id-${sequence}`],
  })
);

export const accountInfoFactory = Factory.define<AccountInfo>(
  ({ sequence }) => ({
    name: `test${sequence}@example.com`,
    id: `laAeA-QVF9Ijq0ya7HFZubII7oIxGWM848Eau_fuqi5${sequence}`,
    createdAt: "2021-07-09T07:14:56Z",
    externalAccountIDs: externalIDsFactory.buildList(2),
  })
);

export const allowanceInfoFactory = Factory.define<AllowanceInfo>(
  ({ sequence }) => ({
    metric: "units",
    value: sequence,
  })
);

export const contractItemFactory = Factory.define<ContractItem>(
  ({ sequence }) => ({
    contractID: `bAcm01ApqtkhOTCxCG2un1t4iKYi91hD8Vj0-nlLQiD${sequence}`,
    created: "2021-07-09T07:14:56Z",
    effectiveFrom: "2021-07-09T07:14:56Z",
    effectiveTo: "9999-12-31T00:00:00Z",
    externalIDs: externalIDsFactory.buildList(2),
    id: sequence,
    lastModified: "2021-07-09T07:14:56Z",
    metric: "units",
    reason: "purchase_made",
    value: sequence,
  })
);

export const affordancesAptRepositoryFactory = Factory.define<AffordancesAptRepository>(
  () => ({
    architectures: ["amd64", "ppc64el", "ppc64le", "s390x", "x86_64"],
    series: ["xenial"],
  })
);

export const obligationsFactory = Factory.define<Obligations>(() => ({
  enableByDefault: false,
}));

export const directivesAptRepositoryFactory = Factory.define<DirectivesAptRepository>(
  () => ({
    additionalPackages: ["ubuntu-commoncriteria"],
    aptKey: "912DADD99EE1CC6BFFFF243A186E733F491C46F9",
    aptURL: "https://esm.staging.ubuntu.com/cc",
    suites: ["xenial"],
  })
);

export const entitlementAptRepositoryFactory = Factory.define<EntitlementAptRepository>(
  () => ({
    affordances: affordancesAptRepositoryFactory.build(),
    directives: directivesAptRepositoryFactory.build(),
    entitled: true,
    obligations: obligationsFactory.build(),
    type: "cc-eal",
    series: {
      bionic: {
        affordances: affordancesAptRepositoryFactory.build(),
        directives: directivesAptRepositoryFactory.build(),
        obligations: obligationsFactory.build(),
      },
    },
  })
);

export const entitlementFactory = entitlementAptRepositoryFactory.params({});

export const contractInfoFactory = Factory.define<ContractInfo>(
  ({ sequence }) => ({
    allowances: allowanceInfoFactory.buildList(2),
    createdAt: "2021-07-09T07:14:56Z",
    createdBy: "admin",
    effectiveFrom: "2021-07-09T07:14:56Z",
    effectiveTo: "9999-12-31T00:00:00Z",
    id: `bAcm01ApqtkhOTCxCG2un1t4iKYi91hD8Vj0-nlLQiD${sequence}`,
    items: contractItemFactory.buildList(2),
    name: `test${sequence}@example.com`,
    origin: "free",
    products: ["free"],
    resourceEntitlements: entitlementFactory.buildList(2),
  })
);

export const accountContractInfoFactory = Factory.define<AccountContractInfo>(
  () => ({
    accountInfo: accountInfoFactory.build(),
    contractInfo: contractInfoFactory.build(),
  })
);

export const priceFactory = Factory.define<Price>(({ sequence }) => ({
  value: sequence,
  currency: "GBP",
  months: 4,
}));

export const renewalItemFactory = Factory.define<RenewalItem>(() => ({
  allowance: allowanceInfoFactory.build(),
  pricePerUnit: priceFactory.build(),
  priceTotal: priceFactory.build(),
}));

export const billingInfoFactory = Factory.define<BillingInfo>(
  ({ sequence }) => ({
    subscriptionID: `bAcm01ApqtkhOTCxCG2un1t4iKYi91hD8Vj0-nlLQiD${sequence}`,
    customerID: `laAeA-QVF9Ijq0ya7HFZubII7oIxGWM848Eau_fuqi5${sequence}`,
    createdBy: "admin",
    origin: "stripe",
    planID: `eABcD-QVF9Ijq0ya7HFZubII7oIxGWM848Eau_fuqi5${sequence}`,
  })
);

export const renewalFactory = Factory.define<Renewal>(({ sequence }) => ({
  id: `laAeA-QVF9Ijq0ya7HFZubII7oIxGWM848Eau_fuqi5${sequence}`,
  renewalItems: renewalItemFactory.buildList(2),
  start: "2021-06-09T07:14:56Z",
  end: "2021-07-09T07:14:56Z",
  externalAccountID: externalIDsFactory.build(),
  externalAssetIDs: externalIDsFactory.build(),
  createdAt: "2021-05-09T07:14:56Z",
  createdBy: "admin",
  lastModified: "2021-07-03T07:14:56Z",
  contractID: `bAcm01ApqtkhOTCxCG2un1t4iKYi91hD8Vj0-nlLQiD${sequence}`,
  status: "active",
  billing: billingInfoFactory.build(),
  actionable: true,
}));
