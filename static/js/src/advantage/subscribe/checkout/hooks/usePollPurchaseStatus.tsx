import { useState } from "react";
import { useQuery } from "react-query";
import { useStripe } from "@stripe/react-stripe-js";
import { getPurchase } from "advantage/api/contracts";

const usePollPurchaseStatus = () => {
  const [pendingPurchaseID, setPendingPurchaseID] = useState("");
  const stripe = useStripe();

  const { isLoading, isError, isSuccess, data, error } = useQuery(
    ["pendingPurchase", pendingPurchaseID],
    async () => {
      const purchase = await getPurchase(pendingPurchaseID);

      if (purchase.status === "done") {
        return purchase;
      }

      if (!purchase.invoice) {
        throw new Error("Missing invoice");
      }

      const {
        paymentStatus: { status, piClientSecret, lastPaymentError },
      } = purchase.invoice;

      if (status === "need_3ds_authorization") {
        if (!stripe) {
          throw new Error("Stripe not initialized");
        }

        const threeDSResponse = await stripe.confirmCardPayment(piClientSecret);

        if (threeDSResponse.error) {
          const error = {
            message: threeDSResponse.error.message,
            code: threeDSResponse.error.code,
            dontRetry: true,
          };

          throw error;
        }
      }

      if (status === "need_another_payment_method") {
        const error = {
          message: "Payment failed",
          code: lastPaymentError,
          dontRetry: true,
        };

        throw error;
      }

      if (purchase.status !== "done") {
        throw new Error("Keep looping");
      }
    },
    {
      enabled: !!pendingPurchaseID,
      retry: (
        _failureCount,
        error: { message: string; code: string; dontRetry: boolean }
      ) => {
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

export default usePollPurchaseStatus;
