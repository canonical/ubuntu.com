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
  isMarketingOptInChecked: boolean;
  setTermsChecked: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMarketingOptInChecked: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
};

export enum ProductTypes {
  physical = "physical",
  virtual = "virtual",
  desktop = "desktop",
  aws = "aws",
  azure = "azure",
  gcp = "gcp",
}

export enum LTSVersions {
  jammy = "22.04",
  focal = "20.04",
  bionic = "18.04",
  xenial = "16.04",
  trusty = "14.04",
}

export enum Support {
  essential = "essential",
  standard = "standard",
  advanced = "advanced",
}

export type ProductIDs = `uai-${Support}-${ProductTypes}`;

export type Product = {
  canBeTrialled: boolean;
  longId: string;
  name: string;
  period: string;
  price: {
    value: number;
    currency: string;
  };
  private: boolean;
  productID: ProductIDs;
};

export type ProductListings = {
  [key in ProductIDs]: Product;
};
