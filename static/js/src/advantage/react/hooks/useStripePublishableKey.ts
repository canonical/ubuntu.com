import type { StripePublishableKey } from "advantage/api/types";
import { useQuery } from "react-query";

export const useStripePublishableKey = () => {
  const { data: stripePublishableKey } = useQuery<StripePublishableKey>(
    "stripePublishableKey"
  );
  return { stripePublishableKey };
};
