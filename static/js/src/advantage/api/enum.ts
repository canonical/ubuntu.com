export enum SupportLevel {
  None = "n/a",
  Essential = "essential",
  Standard = "standard",
  Advanced = "advanced",
}

export enum EntitlementType {
  Blender = "blender",
  CcEal = "cc-eal",
  Cis = "cis",
  EsmApps = "esm-apps",
  EsmInfra = "esm-infra",
  FipsUpdates = "fips-updates",
  Fips = "fips",
  LivepatchOnprem = "livepatch-onprem",
  Livepatch = "livepatch",
  Support = "support",
}

export enum UserSubscriptionMarketplace {
  Free = "free",
  CanonicalUA = "canonical-ua",
  Blender = "blender",
  CanonicalCUBE = "canonical-cube",
}

export enum UserSubscriptionType {
  Free = "free",
  Yearly = "yearly",
  Monthly = "monthly",
  Trial = "trial",
  Legacy = "legacy",
  KeyActivated = "key_activated",
}

export enum UserSubscriptionMachineType {
  Virtual = "virtual",
  Physical = "physical",
  Desktop = "desktop",
}

export enum UserSubscriptionPeriod {
  Yearly = "yearly",
  Monthly = "monthly",
}
