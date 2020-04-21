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
  let json_string;
  let error_object;

  if (
    data.code === "renewal is blocked" &&
    data.message.includes("already accepted: processing")
  ) {
    // the renewal is processing, we can carry on
    return false;
  } else if (
    data.code === "invoice payment failed" &&
    data.message.includes("Invoice is already paid")
  ) {
    // the invoice was successfully paid on a reattempt
    return false;
  } else if (
    data.code === "internal server error" &&
    errorString(data.message)
  ) {
    // Stripe returned an error to the ua-contracts service,
    // find out what it is
    json_string = data.message.replace(errorString(data.message), "");
    error_object = JSON.parse(json_string);

    return error_object.message;
  } else if (data.code === "invoice payment failed") {
    // a subsequent attempt to pay with a new payment method failed
    json_string = data.message;
    error_object = JSON.parse(json_string);

    return error_object.message;
  } else {
    // there was a problem with the ua-contracts service
    return null;
  }
}
