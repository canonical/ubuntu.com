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

const PAYMENT_ERRORS = [
  "invoice payment failed",
  "payment method error",
  "invalid customer information",
];

function customErrorResponse(errorData) {
  const code = errorData.code;
  let error = {
    message: errorData.message,
    type: "notification",
  };

  if (
    INSUFFICIENT_FUNDS_CODES.includes(code) ||
    error.message.includes("Your card has insufficient funds")
  ) {
    error.message =
      "That card doesn’t have enough funds to make this payment. Please contact your card issuer, or try a different card.";
  } else if (INCORRECT_NUMBER_CODES.includes(code)) {
    error.message =
      "That card number is incorrect. Check the number and try again.";
    error.type = "card";
  } else if (INCORRECT_CVC_CODES.includes(code)) {
    error.message =
      "That CVC number is incorrect. Check the number and try again.";
    error.type = "card";
  } else if (INCORRECT_ZIP_CODES.includes(code)) {
    error.message =
      "That ZIP/postal code is incorrect. Check the code and try again.";
    error.type = "card";
  } else if (INCORRECT_EXPIRY_CODES.includes(code)) {
    error.message =
      "That expiry date is incorrect. Check the date and try again.";
    error.type = "card";
  } else if (code === "tax_id_invalid") {
    error.message =
      "That VAT number is invalid. Check the number and try again.";
    error.type = "vat";
  } else if (code === "card_not_supported") {
    error.message =
      "That card doesn’t allow this kind of payment. Please contact your card issuer, or try a different card.";
    error.type = "notification";
  } else if (code === "currency_not_supported") {
    error.message =
      "That card doesn’t allow payments in this currency. Please contact your card issuer, or try a different card.";
    error.type = "notification";
  } else if (code === "expired_card") {
    error.message = "That card has expired. Try a different card.";
    error.type = "notification";
  } else if (code === "testmode_decline") {
    error.message = "Test completed.";
    error.type = "dialog";
  } else if (CARD_DECLINED_CODES.includes(code)) {
    error.message =
      "Your card has been declined. Please contact your card issuer, or try a different card.";
    error.type = "notification";
  }

  return error;
}

function errorString(message) {
  const unexpectedErrorStrings = [
    "unexpected error setting customer payment method: ",
    "unexpected error updating customer information: ",
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

export function parseForErrorObject(data) {
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
  let errorObject;

  if (isProcessing || invoicePaid || requiresAuthentication) {
    return false;
  } else if (data.code === "internal server error" && knownError) {
    // Stripe returned an error to the ua-contracts service,
    // find out what it is
    const jsonString = data.message.replace(knownError, "");
    const errorJson = JSON.parse(jsonString);

    errorObject = customErrorResponse(errorJson);
  } else if (PAYMENT_ERRORS.includes(data.code)) {
    // an attempt to create or use a payment method failed
    const errorJson = JSON.parse(data.message);

    errorObject = customErrorResponse(errorJson);
  } else if (data.type === "validation_error") {
    errorObject = customErrorResponse(data);
  } else if (data.code === "renewal is blocked") {
    errorObject = {
      message:
        "Our Sales team will be in touch shortly to finalise this renewal. Your card has not been charged.",
      type: "dialog",
    };
  } else if (
    data.code === "unauthorized" &&
    data.message.includes("please login")
  ) {
    errorObject = {
      message: `An Ubuntu Pro account with this email address exists. Please <a href='/login'>sign in</a> or <a href='/login'>register</a> with your Ubuntu One account.`,
      type: "notification",
    };
  } else {
    // there was a problem with the ua-contracts service
    errorObject = null;
  }

  return errorObject;
}

export function getErrorMessage(error) {
  if (!error) {
    return undefined;
  }

  const { message, code } = error;

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
}
