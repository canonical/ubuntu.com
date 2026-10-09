import type { Stripe, StripeCardElement } from "@stripe/stripe-js";
import { useMutation } from "@tanstack/react-query";
import {
  deletePaymentMethod,
  getPurchase,
  retryPurchase,
  setPaymentMethod,
} from "../api/contracts";

type RetryPaymentVariables = {
  pendingPurchaseId: string;
  stripeKey: string;
  stripe: Stripe | null;
};

type SavePaymentMethodVariables = {
  accountId: string;
  stripe: Stripe | null;
  card: StripeCardElement | null;
};

export const useRetryPaymentMutation = () =>
  useMutation<void, Error, RetryPaymentVariables>({
    mutationFn: async ({ pendingPurchaseId, stripeKey, stripe }) => {
      await retryPurchase(pendingPurchaseId);
      await new Promise((resolve) => window.setTimeout(resolve, 5000));
      const purchase = await getPurchase(pendingPurchaseId);
      if (purchase.status === "done") return;

      const invoice = purchase.invoice;
      if (!invoice) {
        throw new Error("No invoice available for pending payment");
      }
      if (invoice.paymentStatus.status === "need_3ds_authorization") {
        const stripeInstance = stripe ?? window.Stripe!(stripeKey);
        const result = await stripeInstance.confirmCardPayment(
          invoice.paymentStatus.piClientSecret,
        );
        if (result.error) throw result.error;
        return;
      }

      throw new Error("Pending payment could not be completed");
    },
  });

export const useSetPaymentMethodMutation = () =>
  useMutation<void, Error, SavePaymentMethodVariables>({
    mutationFn: async ({ accountId, stripe, card }) => {
      if (!stripe || !card) {
        throw new Error("Stripe failed to initialise");
      }
      const result = await stripe.createPaymentMethod({
        type: "card",
        card,
      });
      if (result.error || !result.paymentMethod) {
        throw new Error(
          result.error?.message ?? "There was an error with your card.",
        );
      }

      const response = await setPaymentMethod(
        accountId,
        result.paymentMethod.id,
      );
      if (response.errors) {
        throw new Error("There was an error with your card.");
      }
    },
  });

export const useDeletePaymentMethodMutation = () =>
  useMutation<void, Error, string>({
    mutationFn: async (accountId) => {
      const response = await deletePaymentMethod(accountId);
      if (response.errors) throw new Error("Unable to remove payment method");
    },
  });
