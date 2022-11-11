import { PaymentMethod, PaymentMethodCreateParams } from "@stripe/stripe-js";
import { Periods } from "advantage/subscribe/react/utils/utils";

export interface DefaultPaymentMethod {
  id: PaymentMethod["id"];
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
  paymentMethodId?: PaymentMethod["id"];
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
  captchaValue: string | null;
  TermsAndConditions: boolean;
  MarketingOptIn: boolean;
  Description: boolean;
  FreeTrial: string;
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
        id: data?.paymentMethodId ?? "",
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
  accountId?: string,
  canBeTrialled?: boolean
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
    captchaValue: null,
    TermsAndConditions: false,
    MarketingOptIn: false,
    Description: false,
    FreeTrial: canBeTrialled ? "useFreeTrial" : "payNow",
  };
}

export { getUserInfoFromVariables, getInitialFormValues };

export const getIsFreeTrialEnabled = () =>
  process.env.NODE_ENV === "development";

export type marketplace = "canonical-ua" | "canonical-cube" | "blender";

export const marketplaceDisplayName = {
  "canonical-ua": "Ubuntu Pro",
  "canonical-cube": "CUE",
  blender: "Blender",
};

export interface Product {
  longId: string;
  period: Periods;
  marketplace: marketplace;
  id: string;
  name: string;
  price: {
    value: number;
  };
  canBeTrialled?: boolean;
}

export type Action = "purchase" | "resize" | "trial" | "offer" | "renewal";
