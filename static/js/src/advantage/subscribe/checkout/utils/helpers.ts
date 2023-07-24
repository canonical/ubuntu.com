import { FormValues, Product, UserInfo } from "./types";

export function getInitialFormValues(
  product: Product,
  canTrial: boolean,
  userInfo?: UserInfo
): FormValues {
  const accountName = userInfo?.accountInfo?.name;
  const customerName = userInfo?.customerInfo.name;
  const buyingFor =
    customerName && accountName === customerName ? "myself" : "organisation";

  return {
    email: userInfo?.customerInfo?.email ?? "",
    name: customerName ?? "",
    buyingFor: buyingFor,
    organisationName: accountName ?? "",
    defaultPaymentMethod: userInfo?.customerInfo?.defaultPaymentMethod,
    address: userInfo?.customerInfo?.address?.line1 ?? "",
    postalCode: userInfo?.customerInfo?.address?.postal_code ?? "",
    country: userInfo?.customerInfo?.address?.country ?? "",
    city: userInfo?.customerInfo?.address?.city ?? "",
    usState: userInfo?.customerInfo?.address?.state ?? "",
    caProvince: userInfo?.customerInfo?.address?.state ?? "",
    VATNumber: userInfo?.customerInfo?.taxID?.value ?? "",
    captchaValue: window.captcha,
    TermsAndConditions: false,
    MarketingOptIn: false,
    Description: false,
    FreeTrial: canTrial && !window.currentPaymentId ? "useFreeTrial" : "payNow",
    marketplace: product.marketplace,
    isTaxSaved: !!userInfo?.customerInfo?.address?.country,
    isCardValid: !!userInfo?.customerInfo?.defaultPaymentMethod,
    isInfoSaved: !!userInfo?.customerInfo?.defaultPaymentMethod,
    totalPrice: undefined,
    TermsOfService: false,
    DataPrivacy: false,
  };
}

export const canBeTrialled = (
  productCanBeTrialled?: boolean,
  userCanTrial?: boolean
) => {
  if (productCanBeTrialled == undefined) {
    return false;
  }

  if (userCanTrial == undefined) {
    return productCanBeTrialled;
  }

  return userCanTrial && productCanBeTrialled;
};
