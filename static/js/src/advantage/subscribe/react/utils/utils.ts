import { marketplace } from "./../../../../PurchaseModal/utils/utils";
import { PaymentMethod, PaymentMethodCreateParams } from "@stripe/stripe-js";

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

export { getUserInfoFromVariables, getInitialFormValues };

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

export enum ProductTypes {
  physical = "physical",
  virtual = "virtual",
  desktop = "desktop",
  publicCloud = "publicCloud",
}

export enum PublicClouds {
  aws = "aws",
  azure = "azure",
  gcp = "gcp",
  oracle = "oracle",
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

export enum Features {
  infra = "uai",
  pro = "uaia",
}

export enum Periods {
  monthly = "monthly",
  yearly = "yearly",
}

// export type ProductIDs = `${Features}-${Support}-${ProductTypes}-${Periods}`;
export type ProductIDs = `${ProductTypes}-${Features}-${Support}-${SLA}-${Periods}`;

export type ValidProducts =
  | "uai-essential-physical-yearly"
  | "uai-essential-physical-monthly"
  | "uai-standard-physical-yearly"
  | "uai-advanced-physical-yearly"
  | "uaia-essential-physical-yearly"
  | "uaia-essential-physical-monthly"
  | "uio-standard-physical-yearly"
  | "uio-advanced-physical-yearly"
  | "uaia-standard-physical-yearly"
  | "uaia-advanced-physical-yearly"
  | "uai-essential-desktop-yearly"
  | "uai-essential-desktop-monthly"
  | "uai-standard-desktop-yearly"
  | "uai-advanced-desktop-yearly"
  | "no-product";

export type ProductListings = {
  [key in ValidProducts]?: Product;
};

export type Product = {
  canBeTrialled: boolean;
  longId: string;
  name: string;
  period: Periods;
  price: {
    value: number;
    currency: string;
  };
  private: boolean;
  id: ProductIDs;
  productID: string;
  marketplace: marketplace;
};

export const isMonthlyAvailable = (product: Product | null) => {
  if (!product || !product.id) return false;

  const monthlyID = product.id.replace(Periods.yearly, Periods.monthly);
  return !!window.productList[monthlyID as ValidProducts];
};

export const isPublicCloud = (type: ProductTypes) =>
  type === ProductTypes.publicCloud;

export const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const getProduct = (
  productType: ProductTypes,
  feature: Features,
  support: Support,
  sla: SLA,
  period: Periods
): ValidProducts => {
  const productKey = `${productType}-${feature}-${support}-${sla}-${period}`;
  switch (productKey) {
    case `${ProductTypes.physical}-${Features.infra}-${Support.none}-${SLA.none}-${Periods.yearly}`:
      return "uai-essential-physical-yearly";
    case `${ProductTypes.physical}-${Features.infra}-${Support.none}-${SLA.none}-${Periods.monthly}`:
      return "uai-essential-physical-monthly";
    case `${ProductTypes.physical}-${Features.infra}-${Support.infra}-${SLA.weekday}-${Periods.yearly}`:
      return "uai-standard-physical-yearly";
    case `${ProductTypes.physical}-${Features.infra}-${Support.infra}-${SLA.everyday}-${Periods.yearly}`:
      return "uai-advanced-physical-yearly";
    case `${ProductTypes.physical}-${Features.pro}-${Support.none}-${SLA.none}-${Periods.yearly}`:
      return "uaia-essential-physical-yearly";
    case `${ProductTypes.physical}-${Features.pro}-${Support.none}-${SLA.none}-${Periods.monthly}`:
      return "uaia-essential-physical-monthly";
    case `${ProductTypes.physical}-${Features.pro}-${Support.infra}-${SLA.weekday}-${Periods.yearly}`:
      return "uio-standard-physical-yearly";
    case `${ProductTypes.physical}-${Features.pro}-${Support.infra}-${SLA.everyday}-${Periods.yearly}`:
      return "uio-advanced-physical-yearly";
    case `${ProductTypes.physical}-${Features.pro}-${Support.full}-${SLA.weekday}-${Periods.yearly}`:
      return "uaia-standard-physical-yearly";
    case `${ProductTypes.physical}-${Features.pro}-${Support.full}-${SLA.everyday}-${Periods.yearly}`:
      return "uaia-advanced-physical-yearly";
    case `${ProductTypes.desktop}-${Features.pro}-${Support.none}-${SLA.none}-${Periods.yearly}`:
      return "uai-essential-desktop-yearly";
    case `${ProductTypes.desktop}-${Features.pro}-${Support.none}-${SLA.none}-${Periods.monthly}`:
      return "uai-essential-desktop-monthly";
    case `${ProductTypes.desktop}-${Features.pro}-${Support.full}-${SLA.weekday}-${Periods.yearly}`:
      return "uai-standard-desktop-yearly";
    case `${ProductTypes.desktop}-${Features.pro}-${Support.full}-${SLA.everyday}-${Periods.yearly}`:
      return "uai-advanced-desktop-yearly";
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
