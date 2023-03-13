import { PaymentMethod, PaymentMethodCreateParams } from "@stripe/stripe-js";
import {
  UserSubscriptionMarketplace,
  UserSubscriptionPeriod,
} from "advantage/api/enum";

interface DefaultPaymentMethod {
  id: PaymentMethod["id"];
  brand: PaymentMethod.Card["brand"];
  last4: PaymentMethod.Card["last4"];
  expMonth: PaymentMethod.Card["exp_month"];
  expYear: PaymentMethod.Card["exp_year"];
}

interface CustomerInfo extends PaymentMethodCreateParams.BillingDetails {
  defaultPaymentMethod?: DefaultPaymentMethod;
  taxID?: { value?: string };
}

export interface UserInfo {
  customerInfo: CustomerInfo;
  accountInfo?: {
    name?: string;
  };
}

export interface AccountInfo {
  accountInfo?: {
    name?: string;
  };
}

export interface Data {
  accountId?: string;
  paymentMethod?: PaymentMethod.Card;
  paymentMethodId?: PaymentMethod["id"];
}

export interface FormValues {
  email?: string;
  name?: string;
  buyingFor?: "organisation" | "myself";
  organisationName?: string;
  defaultPaymentMethod?: DefaultPaymentMethod;
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
  marketplace: UserSubscriptionMarketplace;
  FreeTrial: string;
  isTaxSaved: boolean;
  isCardValid: boolean;
}

export type marketplace = "canonical-ua" | "canonical-cube" | "blender";

export const marketplaceDisplayName = {
  "canonical-ua": "Ubuntu Pro",
  "canonical-cube": "CUE",
  blender: "Blender",
  free: "Personal Subscription",
};

export interface Product {
  longId: string;
  period: UserSubscriptionPeriod;
  marketplace: UserSubscriptionMarketplace;
  id: string;
  name: string;
  price: {
    value: number;
    discount?: null | number;
  };
  canBeTrialled?: boolean;
}

export type Cart = {
  items: Product[];
};

export type Action = "purchase" | "resize" | "trial" | "offer" | "renewal";

type AddressObejct = {
  city?: string;
  country?: string;
  line1?: string;
  postal_code?: string;
  state?: string;
};

export type PaymentPayload = {
  account_id?: string;
  customer_info?: {
    payment_method_id: string;
    email?: string;
    name?: string;
    address: AddressObejct;
    tax_id: {
      type: string;
      value?: string;
    };
  };
  marketplace: UserSubscriptionMarketplace;
  action: Action;
  previous_purchase_id?: string | null;
  captcha_value?: string | null;
  products?: [
    {
      product_listing_id: string;
      quantity: number;
    }
  ];
  renewal_id?: string;
  offer_id?: string;
};

export type TaxInfo = {
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  start_of_cycle?: string;
  end_of_cycle?: string;
};

export type LoginSession = {
  account: {
    authentication_token: string;
    email: string;
    fullname: string;
  };
};
