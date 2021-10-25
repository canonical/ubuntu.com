import { StripePublishableKey } from "advantage/api/types";
import type { QueryClient } from "react-query";

declare global {
  interface Window {
    stripePublishableKey?: StripePublishableKey;
  }
}

const getWindowData = () => ({
  stripePublishableKey: window.stripePublishableKey,
});

export const useLoadWindowData = (queryClient: QueryClient) => {
  const { stripePublishableKey } = getWindowData();
  // Insert the data from the template into the react-query store.
  queryClient.setQueryData("stripePublishableKey", stripePublishableKey);
};
