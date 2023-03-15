import { useState } from "react";
import { useQuery } from "react-query";
import { useStripe } from "@stripe/react-stripe-js";
import { getPurchase, retryPurchase } from "../../../api/contracts";

const usePendingPurchase = () => {
  const [pendingPurchaseID, setPendingPurchaseID] = useState("");

  const stripe = useStripe();

  if (!stripe) throw new Error("Stripe not initialized");

  const { isLoading, isError, isSuccess, data, error } = useQuery(
    ["pendingPurchase", pendingPurchaseID],
    async () => {
      const res = await getPurchase(pendingPurchaseID);

      if (res.noPaymentRequired && res.status === "done") {
        return res;
      }

      if (!res.invoice) {
        throw new Error("Missing invoice");
      }

      const {
        paymentStatus: { status, piClientSecret },
      } = res.invoice;

      if (status === "need_3ds_authorization") {
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

      //Card declined
      if (status === "need_another_payment_method") {
        const invoiceRes = await retryPurchase(pendingPurchaseID);
        const error = {
          message: JSON.parse(invoiceRes.errors).decline_code,
          code: JSON.parse(invoiceRes.errors).decline_code,
          dontRetry: true,
        };
        throw error;
      }

      if (res.status === "done") {
        return res;
      } else {
        throw new Error("Not done yet");
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

export default usePendingPurchase;
