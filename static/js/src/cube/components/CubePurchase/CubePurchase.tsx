import React, { useState } from "react";
import { ActionButton, Button, Modal } from "@canonical/react-components";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import PurchaseModal from "../../../PurchaseModal";

const CubePurchase = () => {
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

  const termsLabel = (
    <>
      I agree to the{" "}
      <a
        href="/legal/terms-and-policies/cube-terms"
        target="_blank"
        rel="noopener noreferrer"
      >
        CUBE service terms
      </a>
    </>
  );

  // TODO: replace these
  const summary = () => (
    <div>
      <h3>Summary</h3>
      <p>CUBE</p>
    </div>
  );
  const buyButton = () => <ActionButton>Buy</ActionButton>;
  const product = "CUBE";
  const quantity = 1;

  return (
    <div>
      <Button appearance={"positive"} onClick={() => setModalOpen(true)}>
        Purchase
      </Button>
      {modalOpen ? (
        <QueryClientProvider client={queryClient}>
          <Elements stripe={stripePromise}>
            <Modal
              className="p-modal--ua-payment"
              style={{ textAlign: "initial" }}
              close={closeHandler}
            >
              <PurchaseModal
                modalTitle="Complete purchase"
                marketplace="canonical-cube"
                termsLabel={termsLabel}
                isFreeTrialApplicable={false}
                product={product}
                quantity={quantity}
                closeModal={closeHandler}
                Summary={summary}
                BuyButton={buyButton}
              />
            </Modal>
          </Elements>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      ) : null}
    </div>
  );
};

export default CubePurchase;
