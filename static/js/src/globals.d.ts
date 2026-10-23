export {};

import type { Stripe } from "@stripe/stripe-js";
import type { StripePublishableKey } from "./advantage/api/types";

export type DataLayerEvent = {
  event: string;
  eventAction: string;
  eventCategory: string;
  eventLabel?: string;
  eventValue?: number;
};

declare global {
  interface Window {
    // The tag manager is included as a global variable in the base template.
    dataLayer?: DataLayerEvent[];
    accountId?: string;
    accountJSONRes?: { fullname: string; email: string };
    CaptchaCallback?: () => void;
    Stripe?: (publishableKey: string) => Stripe;
    stripePublishableKey?: StripePublishableKey;
    pendingPurchaseId?: string;
    hasPaymentMethod?: boolean;
    usabilla_live: (event: string, trigger: string) => void;
    __usabilla_loaded?: boolean;
    cookieStore?: EventTarget & {
      addEventListener: Window["addEventListener"];
    };
  }
}
