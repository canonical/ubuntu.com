import type { StripePublishableKey } from "advantage/api/types";
import { useQuery } from "@tanstack/react-query";

export const useStripePublishableKey = () => {
  const { data: stripePublishableKey } = useQuery<StripePublishableKey>({
    queryKey: ["stripePublishableKey"],
  });
  return { stripePublishableKey };
};
