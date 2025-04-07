import * as Sentry from "@sentry/react";
import type { DisplayError, ValidationError } from "./types";

const CARD_DECLINED_CODES = [
  "call_issuer",
  "card_declined",
  "do_not_honor",
  "do_not_try_again",
  "fraudulent",
  "generic_decline",
  "invalid_account",
  "lost_card",
  "merchant_blacklist",
  "new_account_information_available",
  "no_action_taken",
  "not_permitted",
  "pickup_card",
  "restricted_card",
  "revocation_of_all_authorizations",
  "revocation_of_authorization",
  "security_violation",
  "service_not_allowed",
  "stolen_card",
  "stop_payment_order",
  "transaction_not_allowed",
];

const INSUFFICIENT_FUNDS_CODES = [
  "card_velocity_exceeded",
  "insufficient_funds",
  "invalid_amount",
  "withdrawal_count_limit_exceeded",
];

const INCORRECT_CVC_CODES = ["incorrect_cvc", "invalid_cvc", "incomplete_cvc"];

const INCORRECT_EXPIRY_CODES = [
  "incomplete_expiry",
  "invalid_expiry_year",
  "invalid_expiry_year_past",
  "invalid_expiry_month_past",
];

const INCORRECT_NUMBER_CODES = [
  "incorrect_number",
  "invalid_number",
  "incomplete_number",
];

const INCORRECT_ZIP_CODES = ["incorrect_zip", "incomplete_zip"];

/**
 * Returns a user-friendly error message based on the error object,
 * meant to be displayed in a notification.
 */
export function getNotificationMessage(error: Error): DisplayError {
  const { message } = error;
  if (!message) return { description: "" };

  if (
    INSUFFICIENT_FUNDS_CODES.includes(message) ||
    message?.includes("Your card has insufficient funds")
  ) {
    return {
      title: "Insufficient funds",
      description: (
        <>
          <span>
            Your card doesn’t have enough funds to complete this payment.
          </span>
          <ul className="u-no-margin--bottom">
            <li>Check your available funds and limits</li>
            <li>Contact your bank or card issuer for more information</li>
            <li>Try a different payment method</li>
          </ul>
        </>
      ),
    };
  } else if (INCORRECT_NUMBER_CODES.includes(message)) {
    return {
      description:
        "That card number is incorrect. Check the number and try again.",
    };
  } else if (INCORRECT_CVC_CODES.includes(message)) {
    return {
      title: "Incorrect security code",
      description: (
        <>
          <span>The security code (CVC) doesn’t match the card.</span>
          <ul className="u-no-margin--bottom">
            <li>
              Re-enter the CVC number from the back of your card and try again
            </li>
            <li>
              If you continue to have issues, please contact your bank or card
              issuer
            </li>
          </ul>
        </>
      ),
    };
  } else if (INCORRECT_ZIP_CODES.includes(message)) {
    return {
      title: "Postal code doesn’t match",
      description: (
        <>
          <span>
            This postal code doesn’t match the one associated with your card.
          </span>
          <ul className="u-no-margin--bottom">
            <li>Re-enter the billing address postal code and try again</li>
            <li>
              If it’s required for your card, also check the ZIP code next to
              the card details and try again
            </li>
            <li>
              If you continue to have issues, please contact your bank or card
              issuer
            </li>
          </ul>
        </>
      ),
    };
  } else if (INCORRECT_EXPIRY_CODES.includes(message)) {
    return {
      description: (
        <>That expiry date is incorrect. Check the date and try again.</>
      ),
    };
  } else if (message === "tax_id_invalid") {
    return {
      description:
        "That VAT number is invalid. Check the number and try again.",
    };
  } else if (message === "tax_id_cannot_be_validated") {
    return {
      description:
        "VAT number could not be validated at this time, please try again later or contact customer success if the problem persists.",
    };
  } else if (message === "card_not_supported") {
    return {
      description:
        "That card doesn’t allow this kind of payment. Please contact your card issuer, or try a different card.",
    };
  } else if (message === "currency_not_supported") {
    return {
      description:
        "That card doesn’t allow payments in this currency. Please contact your card issuer, or try a different card.",
    };
  } else if (message === "expired_card") {
    return {
      title: "Card expired",
      description: (
        <>
          <span>Your card is expired.</span>
          <ul className="u-no-margin--bottom">
            <li>Check card expiration date</li>
            <li>Try a different payment method</li>
          </ul>
        </>
      ),
    };
  } else if (message === "testmode_decline") {
    return { description: "Test completed." };
  } else if (CARD_DECLINED_CODES.includes(message)) {
    return {
      title: "Payment declined",
      description: (
        <>
          <span>We can’t process your payment with your card.</span>
          <ul className="u-no-margin--bottom">
            <li>Check the card number, expiration date, and CVC number</li>
            <li>
              Contact your bank or card issuer to check for restrictions on your
              account
            </li>
            <li>Try a different payment method</li>
          </ul>
        </>
      ),
    };
  } else {
    Sentry.captureException(error);
    return {
      title: "Payment processing error",
      description: (
        <>
          <span>There was an unexpected error processing your payment.</span>
          <ul className="u-no-margin--bottom">
            <li>Check the payment details and try submitting again</li>
            <li>
              If your payment will not process, please contact the Canonical
              sales team
            </li>
            <li>Try a different payment method</li>
          </ul>
        </>
      ),
    };
  }
}

/**
 * Returns a user-friendly error message based on the error object,
 * meant to be displayed in a card input field.
 */
export function getCardErrorMessage(
  error: ValidationError | null,
): string | undefined {
  if (!error) return;

  const { message, code } = error;
  if (!message) return;

  if (
    INSUFFICIENT_FUNDS_CODES.includes(code) ||
    message?.includes("Your card has insufficient funds")
  ) {
    return "That card doesn’t have enough funds to make this payment. Please contact your card issuer, or try a different card.";
  }
  if (INCORRECT_NUMBER_CODES.includes(code)) {
    return "That card number is incorrect. Check the number and try again.";
  }
  if (INCORRECT_CVC_CODES.includes(code)) {
    return "That CVC number is incorrect. Check the number and try again.";
  }
  if (INCORRECT_ZIP_CODES.includes(code)) {
    return "That ZIP/postal code is incorrect. Check the code and try again.";
  }
  if (INCORRECT_EXPIRY_CODES.includes(code)) {
    return "That expiry date is incorrect. Check the date and try again.";
  }
  if (code === "tax_id_invalid") {
    return "That VAT number is invalid. Check the number and try again.";
  }
  if (code === "tax_id_cannot_be_validated") {
    return "VAT number could not be validated at this time, please try again later or contact customer success if the problem persists.";
  }
  if (code === "card_not_supported") {
    return "That card doesn’t allow this kind of payment. Please contact your card issuer, or try a different card.";
  }
  if (code === "currency_not_supported") {
    return "That card doesn’t allow payments in this currency. Please contact your card issuer, or try a different card.";
  }
  if (code === "expired_card") {
    return "That card has expired. Try a different card.";
  }
  if (code === "testmode_decline") {
    return "Test completed.";
  }
  if (CARD_DECLINED_CODES.includes(code)) {
    return "Your card has been declined. Please contact your card issuer, or try a different card.";
  }

  return;
}
