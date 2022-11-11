import { useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useQuery } from "react-query";

const usePollPurchaseStatus = () => {
  const [pendingPurchaseID, setPendingPurchaseID] = useState("");
  const queryString = window.location.search;

  const stripe = useStripe();

  if (!stripe) throw new Error("Stripe not initialized");

  const { isLoading, isError, isSuccess, data, error } = useQuery(
    ["pendingPurchase", pendingPurchaseID],
    async () => {
      const response = await fetch(
        `/account/purchases_v2/${pendingPurchaseID}${queryString}`,
        {
          cache: "no-store",
        }
      );

      const res = await response.json();

      if (res.status === "done") {
        return res;
      }

      if (!res.invoice) {
        throw new Error("Missing invoice");
      }

      const {
        payment_status: { status, pi_client_secret },
        id: { IDs },
      } = res.invoice;
      if (status === "need_3ds_authorization") {
        const threeDSResponse = await stripe.confirmCardPayment(
          pi_client_secret
        );
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
        const response = await fetch(
          `/account/purchase/${pendingPurchaseID}/invoices/${IDs[0]}${queryString}`,
          {
            cache: "no-store",
            credentials: "include",
            method: "POST",
          }
        );

        const invoiceRes = await response.json();

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

export default usePollPurchaseStatus;
