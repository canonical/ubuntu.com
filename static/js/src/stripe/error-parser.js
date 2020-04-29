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

const INCORRECT_EXPIRY_CODES = ["incomplete_expiry", "invalid_expiry_year"];

const INCORRECT_NUMBER_CODES = [
  "incorrect_number",
  "invalid_number",
  "incomplete_number",
];

const INCORRECT_ZIP_CODES = ["incorrect_zip", "incomplete_zip"];

function customErrorMessage(errorData) {
  const code = errorData.code;
  let errorMessage = errorData.message;

  if (
    INSUFFICIENT_FUNDS_CODES.includes(code) ||
    errorMessage.includes("Your card has insufficient funds")
  ) {
    errorMessage =
      "That card doesn’t have enough funds to make this payment. Please contact your card issuer, or try a different card.";
  } else if (INCORRECT_NUMBER_CODES.includes(code)) {
    errorMessage =
      "That card number is incorrect. Check the number and try again.";
  } else if (INCORRECT_CVC_CODES.includes(code)) {
    errorMessage =
      "That CVC number is incorrect. Check the number and try again.";
  } else if (INCORRECT_ZIP_CODES.includes(code)) {
    errorMessage =
      "That ZIP/postal code is incorrect. Check the code and try again.";
  } else if (INCORRECT_EXPIRY_CODES.includes(code)) {
    errorMessage =
      "That expiry date is incorrect. Check the date and try again.";
  } else if (code === "card_not_supported") {
    errorMessage =
      "That card doesn’t allow this kind of payment. Please contact your card issuer, or try a different card.";
  } else if (code === "currency_not_supported") {
    errorMessage =
      "That card doesn’t allow payments in this currency. Please contact your card issuer, or try a different card.";
  } else if (code === "expired_card") {
    errorMessage = "That card has expired. Try a different card.";
  } else if (code === "testmode_decline") {
    errorMessage = "Test completed.";
  } else if (CARD_DECLINED_CODES.includes(code)) {
    errorMessage =
      "Your card has been declined. Please contact your card issuer, or try a different card.";
  }

  return errorMessage;
}

function errorString(message) {
  const unexpectedErrorStrings = [
    "unexpected error setting customer payment method: ",
    "unexpected error creating customer: ",
  ];
  let error = false;

  unexpectedErrorStrings.forEach((string) => {
    if (message.includes(string)) {
      error = string;
    }
  });

  return error;
}

export function parseStripeError(data) {
  const isProcessing =
    data.code === "renewal is blocked" &&
    data.message.includes("already accepted: processing");
  const invoicePaid =
    data.code === "invoice payment failed" &&
    data.message.includes("Invoice is already paid");
  const requiresAuthentication =
    data.code === "invoice payment failed" &&
    data.message.includes("This payment requires additional user action");
  const knownError = errorString(data.message);

  if (isProcessing || invoicePaid || requiresAuthentication) {
    return false;
  } else if (data.code === "internal server error" && knownError) {
    // Stripe returned an error to the ua-contracts service,
    // find out what it is
    const jsonString = data.message.replace(knownError, "");
    const errorObject = JSON.parse(jsonString);

    return customErrorMessage(errorObject);
  } else if (data.code === "invoice payment failed") {
    // a subsequent attempt to pay with a new payment method failed
    const errorObject = JSON.parse(data.message);

    return customErrorMessage(errorObject);
  } else if (data.type === "validation_error") {
    return customErrorMessage(data);
  } else {
    // there was a problem with the ua-contracts service
    return null;
  }
}
