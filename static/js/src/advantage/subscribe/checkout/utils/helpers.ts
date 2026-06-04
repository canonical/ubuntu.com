import { UserSubscriptionMarketplace } from "advantage/api/enum";
import { FormValues, UserInfo } from "./types";

export function getInitialFormValues(
  marketplace: UserSubscriptionMarketplace,
  canTrial?: boolean,
  userInfo?: UserInfo,
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
    marketplace: marketplace,
    isTaxSaved: !!userInfo?.customerInfo?.address?.country,
    isCardValid: !!userInfo?.customerInfo?.defaultPaymentMethod,
    isInfoSaved: !!userInfo?.customerInfo?.defaultPaymentMethod,
    TermsOfService: false,
    DataPrivacy: false,
    ...(canTrial && {
      FreeTrial: !window.currentPaymentId ? "useFreeTrial" : "payNow",
    }),
  };
}

export const canBeTrialled = (
  productCanBeTrialled?: boolean,
  userCanTrial?: boolean,
) => {
  if (productCanBeTrialled == undefined) {
    return false;
  }

  if (userCanTrial == undefined) {
    return productCanBeTrialled;
  }

  return userCanTrial && productCanBeTrialled;
};

const beforeUnloadHandler = (event: Event) => {
  // Recommended
  event.preventDefault();

  // Included for legacy support, e.g. Chrome/Edge < 119
  event.returnValue = true;
};

export const confirmNavigateListener = {
  set: () => {
    window.addEventListener("beforeunload", beforeUnloadHandler);
  },
  clear: () => {
    window.removeEventListener("beforeunload", beforeUnloadHandler);
  },
};
