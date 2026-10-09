import type { Stripe, StripeCardElement } from "@stripe/stripe-js";
import { useEffect, useRef, useState } from "react";
import {
  useDeletePaymentMethodMutation,
  useRetryPaymentMutation,
  useSetPaymentMethodMutation,
} from "./hooks";

const cardStyle = {
  base: {
    iconColor: "#e95420",
    color: "#111",
    fontWeight: 300,
    fontFamily:
      '"Ubuntu", -apple-system, "Segoe UI", "Roboto", "Oxygen", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSmoothing: "antialiased",
    fontSize: "16px",
    "::placeholder": { color: "#666" },
    ":-webkit-autofill": { color: "#666" },
  },
};

export type PaymentMethodProps = {
  stripeKey: string;
  accountId: string;
  pendingPurchaseId: string;
  initialHasPaymentMethod: boolean;
  cardBrand: string;
  cardLast4: string;
};

function PaymentMethods({
  stripeKey,
  accountId,
  pendingPurchaseId,
  initialHasPaymentMethod,
  cardBrand,
  cardLast4,
}: PaymentMethodProps): JSX.Element {
  const hasPaymentMethod = initialHasPaymentMethod;
  const [isEditing, setIsEditing] = useState(false);
  const [isCardComplete, setIsCardComplete] = useState(false);
  const [cardError, setCardError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const cardContainer = useRef<HTMLDivElement>(null);
  const card = useRef<StripeCardElement | null>(null);
  const stripe = useRef<Stripe | null>(null);
  const removeDialog = useRef<HTMLElement>(null);
  const removeButton = useRef<HTMLButtonElement>(null);
  const cancelRemoveButton = useRef<HTMLButtonElement>(null);

  const retryMutation = useRetryPaymentMutation();
  const saveMutation = useSetPaymentMethodMutation();
  const removeMutation = useDeletePaymentMethodMutation();
  const isProcessing =
    retryMutation.isPending ||
    saveMutation.isPending ||
    removeMutation.isPending;

  useEffect(() => {
    if (!isEditing || !cardContainer.current) return;

    const stripeInstance = window.Stripe!(stripeKey);
    const elements = stripeInstance.elements({
      fonts: [
        {
          family: "Ubuntu",
          src: `url(${window.location.origin}/static/fonts/ubuntu-variable-latin.woff2)`,
          weight: "100 800",
        },
      ],
    });
    const cardElement = elements.create("card", { style: cardStyle });
    stripe.current = stripeInstance;
    card.current = cardElement;
    cardElement.mount(cardContainer.current);
    cardElement.on("change", (event) => {
      setIsCardComplete(event.complete && !event.error);
      setCardError(event.error?.message ?? "");
      if (event.complete) setError("");
    });

    return () => {
      cardElement.unmount();
      card.current = null;
      stripe.current = null;
    };
  }, [isEditing, stripeKey]);

  useEffect(() => {
    if (!isRemoveModalOpen) return;

    cancelRemoveButton.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsRemoveModalOpen(false);
      } else if (event.key === "Tab") {
        const focusable =
          removeDialog.current?.querySelectorAll<HTMLButtonElement>(
            "button:not(:disabled)",
          );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      removeButton.current?.focus();
    };
  }, [isRemoveModalOpen]);

  const showSuccess = (message: string) => {
    setError("");
    setSuccess(`${message}. Reloading page...`);
    window.setTimeout(() => window.location.reload(), 2000);
  };

  const showPaymentError = () => {
    setSuccess("");
    setError("There was an error with the payment.");
  };

  const retryPayment = () => {
    if (!pendingPurchaseId) return;
    setError("");
    retryMutation.mutate(
      { pendingPurchaseId, stripeKey, stripe: stripe.current },
      {
        onSuccess: () => showSuccess("Payment successful"),
        onError: showPaymentError,
      },
    );
  };

  const savePaymentMethod = () => {
    setError("");
    saveMutation.mutate(
      { accountId, stripe: stripe.current, card: card.current },
      {
        onSuccess: () => {
          if (pendingPurchaseId) {
            retryPayment();
          } else {
            showSuccess("Card updated");
          }
        },
        onError: (mutationError) => {
          setError(
            mutationError.message || "There was an error with your card.",
          );
        },
      },
    );
  };

  const removePaymentMethod = () => {
    removeMutation.mutate(accountId, {
      onSuccess: () => window.location.reload(),
      onError: () => {
        setIsRemoveModalOpen(false);
        setError("There was an error with your card.");
      },
    });
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setIsCardComplete(false);
    setCardError("");
    setError("");
  };

  return (
    <>
      <section className="p-strip--suru-topped p-strip-account-page card-management-section">
        <div className="u-fixed-width">
          {success && (
            <div className="p-notification--positive" role="status">
              <div className="p-notification__content">
                <p className="p-notification__message">{success}</p>
              </div>
            </div>
          )}
          {error && (
            <div className="p-notification--negative" role="alert">
              <div className="p-notification__content">
                <p className="p-notification__message">
                  <strong>{error}</strong> Check the details and try again.
                  Contact{" "}
                  <a href="https://ubuntu.com/contact-us">Canonical sales</a> if
                  the problem persists.
                </p>
              </div>
            </div>
          )}
          {pendingPurchaseId && !success && (
            <div className="p-notification--caution">
              <div className="p-notification__content">
                <p className="p-notification__message">
                  You have one or more pending payments. Use your saved card to{" "}
                  <button
                    className="p-link--soft"
                    disabled={isProcessing}
                    onClick={retryPayment}
                    type="button"
                  >
                    retry payment
                  </button>
                  {isProcessing && (
                    <i className="p-icon--spinner u-animation--spin is-dark" />
                  )}
                </p>
              </div>
            </div>
          )}

          <h1>Payment method</h1>

          {hasPaymentMethod && !isEditing && (
            <div className="row" style={{ marginTop: "2rem" }}>
              <div className="col-4 current-payment-method">
                <CardLogo brand={cardBrand} />
                <p>
                  <span style={{ textTransform: "capitalize" }}>
                    {cardBrand}
                  </span>{" "}
                  ending in {cardLast4}
                </p>
              </div>
              <p className="col-4 u-text--muted">Default payment method</p>
              <div className="col-4 u-align--right">
                <button
                  className="p-button"
                  onClick={() => {
                    setError("");
                    setIsEditing(true);
                  }}
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="p-button--base"
                  onClick={() => setIsRemoveModalOpen(true)}
                  ref={removeButton}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="row" style={{ marginTop: "2rem" }}>
              <div className="col-8">
                <div ref={cardContainer} />
                {cardError && (
                  <span className="p-form-validation__message">
                    {cardError}
                  </span>
                )}
              </div>
              <div className="col-4 u-align--right">
                <button
                  className="p-button"
                  disabled={isProcessing}
                  onClick={cancelEditing}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className={`p-button--positive${isProcessing ? " is-processing" : ""}`}
                  disabled={!isCardComplete || isProcessing}
                  onClick={savePaymentMethod}
                  type="button"
                >
                  {isProcessing ? (
                    <i className="p-icon--spinner u-animation--spin is-light" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          )}

          <hr className={!hasPaymentMethod ? "u-hide" : ""} />

          {!hasPaymentMethod && !isEditing && (
            <div className="p-strip">
              <div className="row">
                <div className="u-align--right col-4">
                  <i className="p-icon--credit-card u-hide--medium u-hide--small" />
                </div>
                <div className="u-align--left col-8 col-medium-4 col-small-3">
                  <p className="p-heading--4" style={{ marginBottom: 0 }}>
                    You have no payment method saved
                  </p>
                  <p>
                    Add a card to resize and automatically renew your
                    subscriptions.
                  </p>
                  <button
                    className="p-button--positive"
                    onClick={() => setIsEditing(true)}
                    type="button"
                  >
                    Add card
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div
        className="p-modal"
        onClick={(event) => {
          if (event.target === event.currentTarget) setIsRemoveModalOpen(false);
        }}
        style={{ display: isRemoveModalOpen ? "flex" : "none" }}
      >
        <section
          className="p-modal__dialog"
          ref={removeDialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-payment-title"
        >
          <header className="p-modal__header">
            <h2 className="p-modal__title" id="remove-payment-title">
              Remove payment method
            </h2>
            <button
              className="p-modal__close"
              aria-label="Close active modal"
              onClick={() => setIsRemoveModalOpen(false)}
              type="button"
            >
              Close
            </button>
          </header>
          <p>
            Your subscriptions will not renew automatically at the next due
            date.
          </p>
          <footer className="p-modal__footer">
            <button
              className="u-no-margin--bottom"
              disabled={isProcessing}
              onClick={() => setIsRemoveModalOpen(false)}
              ref={cancelRemoveButton}
              type="button"
            >
              Cancel
            </button>
            <button
              className="p-button--negative u-no-margin--bottom"
              disabled={isProcessing}
              onClick={removePaymentMethod}
              type="button"
            >
              {isProcessing ? (
                <i className="p-icon--spinner u-animation--spin is-light" />
              ) : (
                "Remove"
              )}
            </button>
          </footer>
        </section>
      </div>
    </>
  );
}

function CardLogo({ brand }: { brand: string }): JSX.Element | null {
  const logos: Record<string, { src: string; width: number }> = {
    visa: {
      src: "https://assets.ubuntu.com/v1/2060e728-VBM_COF.png",
      width: 38,
    },
    mastercard: {
      src: "https://assets.ubuntu.com/v1/f42c6739-mc_symbol.svg",
      width: 36,
    },
    amex: {
      src: "https://assets.ubuntu.com/v1/5f4f3f7b-Amex_logo_color.svg",
      width: 24,
    },
    discover: {
      src: "https://assets.ubuntu.com/v1/f5e8abde-discover_logo.jpg",
      width: 38,
    },
  };
  const logo = logos[brand];
  return logo ? (
    <div className="payment-card-logo">
      <img
        src={logo.src}
        alt=""
        width={logo.width}
        height="24"
        loading="lazy"
      />
    </div>
  ) : null;
}

export default PaymentMethods;
