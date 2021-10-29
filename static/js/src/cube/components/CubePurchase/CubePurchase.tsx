import React, { useState } from "react";
import { Button } from "@canonical/react-components";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CubePurchaseModal from "../CubePurchaseModal";

type Props = {
  productName: string;
  productListingId: string;
};

const CubePurchase = ({ productName, productListingId }: Props) => {
  const [modalOpen, setModalOpen] = useState(false);
  const closeHandler = () => setModalOpen(false);

  const stripePromise = loadStripe(window.stripePublishableKey ?? "");
  const oneHour = 1000 * 60 * 60;
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        staleTime: oneHour,
        retryOnMount: false,
      },
    },
  });

  return (
    <div>
      <Button appearance={"positive"} onClick={() => setModalOpen(true)}>
        Purchase
      </Button>
      {modalOpen ? (
        <QueryClientProvider client={queryClient}>
          <Elements stripe={stripePromise}>
            <CubePurchaseModal
              productName={productName}
              productListingId={productListingId}
              closeHandler={closeHandler}
            />
          </Elements>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      ) : null}
    </div>
  );
};

export default CubePurchase;
