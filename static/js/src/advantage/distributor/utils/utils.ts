import { PaymentMethod, PaymentMethodCreateParams } from "@stripe/stripe-js";
import { marketplace } from "advantage/subscribe/checkout/utils/types";

interface DefaultPaymentMethod {
  brand: PaymentMethod.Card["brand"];
  last4: PaymentMethod.Card["last4"];
  expMonth: PaymentMethod.Card["exp_month"];
  expYear: PaymentMethod.Card["exp_year"];
}

interface CustomerInfo extends PaymentMethodCreateParams.BillingDetails {
  defaultPaymentMethod: DefaultPaymentMethod;
  taxID: { value?: string };
}

interface UserInfo {
  customerInfo: CustomerInfo;
  accountInfo: {
    name?: string;
  };
}

interface Data {
  accountId?: string;
  paymentMethod?: PaymentMethod.Card;
}

export interface FormValues {
  email?: string;
  name?: string;
  buyingFor?: "organisation" | "myself";
  organisationName?: string;
  address?: string;
  postalCode?: string;
  country?: string;
  city?: string;
  usState?: string;
  caProvince?: string;
  VATNumber?: string;
  freeTrial?: string;
}

export function generateUniqueId() {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function getUserInfoFromVariables(data: Data, variables: FormValues): UserInfo {
  return {
    customerInfo: {
      email: variables.email,
      name: variables.name,
      address: {
        line1: variables.address,
        postal_code: variables.postalCode,
        country: variables.country,
        city: variables.city,
        state:
          variables.country === "US" ? variables.usState : variables.caProvince,
      },
      defaultPaymentMethod: {
        brand: data?.paymentMethod?.brand ?? "",
        last4: data?.paymentMethod?.last4 ?? "",
        expMonth: data?.paymentMethod?.exp_month ?? 0,
        expYear: data?.paymentMethod?.exp_year ?? 0,
      },
      taxID: { value: variables.VATNumber },
    },
    accountInfo: {
      name: variables.organisationName,
    },
  };
}

function getInitialFormValues(
  userInfo: UserInfo,
  accountId?: string
): FormValues {
  return {
    email: userInfo?.customerInfo?.email ?? "",
    name: userInfo?.customerInfo?.name ?? "",
    buyingFor:
      !accountId || userInfo?.accountInfo?.name ? "organisation" : "myself",
    organisationName: userInfo?.accountInfo?.name ?? "",
    address: userInfo?.customerInfo?.address?.line1 ?? "",
    postalCode: userInfo?.customerInfo?.address?.postal_code ?? "",
    country: userInfo?.customerInfo?.address?.country ?? "",
    city: userInfo?.customerInfo?.address?.city ?? "",
    usState: userInfo?.customerInfo?.address?.state ?? "",
    caProvince: userInfo?.customerInfo?.address?.state ?? "",
    VATNumber: userInfo?.customerInfo?.taxID?.value ?? "",
  };
}

export { getInitialFormValues, getUserInfoFromVariables };

export const getIsFreeTrialEnabled = () =>
  process.env.NODE_ENV === "development";

export type BuyButtonProps = {
  areTermsChecked: boolean;
  isUsingFreeTrial: boolean;
  isDescriptionChecked: boolean;
  isMarketingOptInChecked: boolean;
  setTermsChecked: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDescriptionChecked: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMarketingOptInChecked: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
};

export type SubscriptionList = {
  id: string;
  type: DistributorProductTypes;
};

export enum DistributorProductTypes {
  virtual = "virtual",
  physical = "physical",
  desktop = "desktop",
}

export enum LTSVersions {
  jammy = "22.04",
  focal = "20.04",
  bionic = "18.04",
  xenial = "16.04",
  trusty = "14.04",
}

export enum Support {
  none = "none",
  infra = "essential",
  full = "advanced",
}

export enum SLA {
  none = "none",
  weekday = "weekday",
  everyday = "everyday",
}

export enum Currencies {
  usd = "USD",
  gbp = "GBP",
  eur = "EUR",
}

export enum Durations {
  one = "one-year",
  two = "two-years",
  three = "three-years",
}
export type ProductIDs = `${DistributorProductTypes}-${Support}-${SLA}-${Durations}`;

export type ValidProducts =
  | "uaia-essential-physical-one-year"
  | "uaia-essential-physical-two-years"
  | "uaia-essential-physical-three-years"
  | "uaia-advanced-physical-one-year"
  | "uaia-advanced-physical-two-years"
  | "uaia-advanced-physical-three-years"
  | "uaia-standard-physical-one-year"
  | "uaia-standard-physical-two-years"
  | "uaia-standard-physical-three-years"
  | "uaia-standard-desktop-one-year"
  | "uaia-advanced-desktop-two-years"
  | "uaia-advanced-desktop-three-years"
  | "no-product";

export type ProductListings = {
  [key in ValidProducts]?: Product;
};

export type Product = {
  longId: string;
  name: string;
  duration: Durations;
  price: {
    value: number;
    currency: string;
  };
  private: boolean;
  id: ProductIDs;
  productID: string;
  marketplace: marketplace;
};

export const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const getProduct = (
  productType: DistributorProductTypes,
  support: Support,
  sla: SLA,
  durations: Durations
): ValidProducts => {
  const productKey = `${productType}-${support}-${sla}-${durations}`;
  switch (productKey) {
    case `${DistributorProductTypes.physical}-${Support.infra}-${SLA.none}-${Durations.one}`:
      return "uaia-essential-physical-one-year";
    case `${DistributorProductTypes.physical}-${Support.infra}-${SLA.none}-${Durations.two}`:
      return "uaia-essential-physical-two-years";
    case `${DistributorProductTypes.physical}-${Support.infra}-${SLA.none}-${Durations.two}`:
      return "uaia-essential-physical-three-years";
    case `${DistributorProductTypes.physical}-${Support.none}-${SLA.none}-${Durations.one}`:
      return "uaia-standard-physical-one-year";
    case `${DistributorProductTypes.physical}-${Support.none}-${SLA.none}-${Durations.two}`:
      return "uaia-standard-physical-two-years";
    case `${DistributorProductTypes.physical}-${Support.none}-${SLA.none}-${Durations.two}`:
      return "uaia-standard-physical-three-years";
    case `${DistributorProductTypes.physical}-${Support.full}-${SLA.none}-${Durations.one}`:
      return "uaia-advanced-physical-one-year";
    case `${DistributorProductTypes.physical}-${Support.full}-${SLA}-${Durations.two}`:
      return "uaia-advanced-physical-two-years";
    case `${DistributorProductTypes.physical}-${Support.full}-${SLA.none}-${Durations.two}`:
      return "uaia-advanced-physical-three-years";
    default:
      return "no-product";
  }
};

export const getLabel = (
  toFind: string,
  array: { label: string; value: string }[]
) => {
  return array.find((element) => element.value === toFind)?.label;
};
