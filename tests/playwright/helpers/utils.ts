export const ENDPOINTS = {
  calculate: "/account/canonical-ua/purchase/calculate*",
  customerInfo: "/account/customer-info*",
  ensure: "/account/purchase-account*",
  getPurchase: "/account/purchases/*",
  getSubscription: "/pro/user-subscriptions*",
  marketo: "/marketo/submit",
  postPurchase: "/pro/purchase*",
  postInvoice: "/account/purchases/*/retry*",
  preview: "/pro/purchase/preview*",
  stripePaymentMethod : "https://api.stripe.com/v1/payment_methods",
 };

export const getRandomEmail = () =>
  `playwright-test-${Math.random().toString(36).substring(2,12)}@canonical.com`;
