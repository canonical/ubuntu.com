import { useState } from "react";
import { useQuery } from "react-query";
import { useStripe } from "@stripe/react-stripe-js";
import { getPurchase, postInvoiceID } from "../../advantage/api/contracts";

type PurchaseError = Error & { dontRetry: boolean };

const requires3DSCheck = (
  pi_decline_code: string,
  pi_status: string,
  pi_secret: string
) => {
  return (
    pi_decline_code === "authentication_required" ||
    (pi_status === "requires_action" && pi_secret)
  );
};

const usePendingPurchase = () => {
  const [pendingPurchaseId, setPendingPurchaseId] = useState("");

  const stripe = useStripe();

  const { isLoading, isError, isSuccess, data, error } = useQuery(
    ["pendingPurchase", pendingPurchaseId],
    async () => {
      const res = await getPurchase(pendingPurchaseId);

      if (!res.stripeInvoices || res.status === "processing") {
        throw new Error("Missing invoice");
      }

      const {
        pi_decline_code,
        pi_status,
        pi_secret,
        id: stripeInvoiceId,
      } = res.stripeInvoices[0];

      if (requires3DSCheck(pi_decline_code, pi_status, pi_secret)) {
        if (!stripe) {
          throw new Error("Stripe is not loaded");
        }

        const threeDSResponse = await stripe.confirmCardPayment(pi_secret);
        if (threeDSResponse.error) {
          const error = Error(threeDSResponse.error.message) as PurchaseError;
          error.dontRetry = true;
          throw error;
        }
      }

      //Card declined
      if (pi_status === "requires_payment_method") {
        const invoiceRes = await postInvoiceID(
          "purchase",
          pendingPurchaseId,
          stripeInvoiceId
        );

        const error = Error(
          JSON.parse(invoiceRes.errors).decline_code
        ) as PurchaseError;
        error.dontRetry = true;
        throw error;
      }

      if (res.status === "done") {
        return res;
      } else {
        throw new Error("Not done yet");
      }
    },
    {
      enabled: !!pendingPurchaseId,
      retry: (_, error: PurchaseError) => {
        return !error.dontRetry;
      },
    }
  );

  return {
    setPendingPurchaseId,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
  };
};

export default usePendingPurchase;
