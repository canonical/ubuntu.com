import { Factory } from "fishery";
import {
  ContractWithToken,
  EnterpriseContract,
  EnterpriseContractEntitlements,
  EnterpriseContractInfo,
  EnterpriseContractRenewal,
  EnterpriseContracts,
  PersonalAccount,
} from "advantage/api/types";
import {
  accountContractInfoFactory,
  accountInfoFactory,
  contractInfoFactory,
  priceFactory,
  renewalFactory,
} from "./contracts";

export const contractWithTokenFactory = Factory.define<ContractWithToken>(
  () => ({
    ...accountContractInfoFactory.build(),
    token: "B13sf54ZfJt51AMwynubzPyaGE9ZA2",
  })
);

export const enterpriseContractInfoFactory = Factory.define<EnterpriseContractInfo>(
  () => ({
    ...contractInfoFactory.build(),
    createdAtFormatted: "09 July 2021",
    daysTillExpiry: 337,
    effectiveToFormatted: "09 July 2022",
    status: "active",
  })
);

export const enterpriseContractEntitlementsFactory = Factory.define<EnterpriseContractEntitlements>(
  () => ({
    livepatch: true,
  })
);

export const enterpriseContractRenewalFactory = Factory.define<EnterpriseContractRenewal>(
  () => ({
    ...renewalFactory.build(),
    recently_renewed: true,
    renewable: false,
  })
);

export const enterpriseContractFactory = Factory.define<EnterpriseContract>(
  ({ sequence }) => ({
    ...contractWithTokenFactory.build(),
    contractInfo: enterpriseContractInfoFactory.build(),
    entitlements: enterpriseContractEntitlementsFactory.build(),
    expiring: true,
    is_detached: false,
    machineCount: 7,
    period: "monthly",
    price_per_unit: priceFactory.build(),
    productID: "free",
    product_listing_id: `bAcm01ApqtkhOTCxCG2un1t4iKYi91hD8Vj0-nlLQiD${sequence}`,
    renewal: enterpriseContractRenewalFactory.build(),
    rowMachineCount: 5,
    supportLevel: "standard",
  })
);

export const enterpriseContractsFactory = Factory.define<EnterpriseContracts>(
  () => ({
    test: enterpriseContractFactory.build(),
  })
);

export const personalAccountFactory = Factory.define<PersonalAccount>(
  ({ sequence }) => ({
    ...accountInfoFactory.build(),
    contracts: contractWithTokenFactory.buildList(2),
    free_token: `F9sf54ZfJt59AMwynubzPyaGE9Z4D${sequence}`,
  })
);
