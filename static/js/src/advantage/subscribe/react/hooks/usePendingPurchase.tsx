import { useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useQuery } from "react-query";
import { getPurchase, postInvoiceID } from "../../../api/contracts";

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
  const [pendingPurchaseID, setPendingPurchaseID] = useState("");

  const stripe = useStripe();

  if (!stripe) throw new Error("Stripe not initialized");

  const { isLoading, isError, isSuccess, data, error } = useQuery(
    ["pendingPurchase", pendingPurchaseID],
    async () => {
      const res = await getPurchase(pendingPurchaseID);

      if (!res.stripeInvoices) {
        throw new Error("Missing invoice");
      }

      const {
        pi_decline_code,
        pi_status,
        pi_secret,
        id: stripeInvoiceId,
      } = res.stripeInvoices[0];

      if (requires3DSCheck(pi_decline_code, pi_status, pi_secret)) {
        const threeDSResponse = await stripe.confirmCardPayment(pi_secret);
        if (threeDSResponse.error) {
          const error = {
            ...Error(threeDSResponse.error.message),
            dontRetry: false,
          };
          error.dontRetry = true;
          throw error;
        }
      }

      //Card declined
      if (pi_status === "requires_payment_method") {
        const invoiceRes = await postInvoiceID(
          "purchase",
          pendingPurchaseID,
          stripeInvoiceId
        );

        if (
          JSON.parse(invoiceRes.errors).message !== "Invoice is already paid"
        ) {
          const error = {
            ...Error(JSON.parse(invoiceRes.errors).decline_code),
            dontRetry: false,
          };
          error.dontRetry = true;
          throw error;
        }
      }

      if (res.status === "done") {
        return res;
      } else {
        throw new Error("Not done yet");
      }
    },
    {
      enabled: !!pendingPurchaseID,
      retry: (_failureCount, error: Error & { dontRetry: boolean }) => {
        return !error.dontRetry;
      },
    }
  );

  return {
    setPendingPurchaseID: setPendingPurchaseID,
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    data: data,
    error: error,
  };
};

export default usePendingPurchase;
