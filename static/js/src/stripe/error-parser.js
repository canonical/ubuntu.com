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

    return errorObject.message;
  } else if (data.code === "invoice payment failed") {
    // a subsequent attempt to pay with a new payment method failed
    const errorObject = JSON.parse(data.message);

    return errorObject.message;
  } else {
    // there was a problem with the ua-contracts service
    return null;
  }
}
