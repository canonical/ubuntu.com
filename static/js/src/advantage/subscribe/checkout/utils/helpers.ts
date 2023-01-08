import { Action, Data, FormValues, Product, UserInfo } from "./types";

export function getUserInfoFromVariables(
  data: Data,
  variables: FormValues
): UserInfo {
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

export function getInitialFormValues(
  product: Product,
  action: Action,
  userInfo?: UserInfo,
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
    captchaValue: null,
    TermsAndConditions: false,
    MarketingOptIn: false,
    Description: false,
    marketplace: product.marketplace,
    FreeTrial: canBeTrialled(product, action) ? "useFreeTrial" : "payNow",
  };
}

export const canBeTrialled = (product: Product, action: Action) => {
  if (action != "purchase") {
    return false;
  }

  let canTrial = product.canBeTrialled;

  if (window.canTrial !== undefined) {
    canTrial = window.canTrial;
  }

  return canTrial;
};
