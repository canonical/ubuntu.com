export const stripeErrorObjects = {
  cardNumberIncomplete: {
    code: "incomplete_number",
    type: "validation_error",
    message: "Your card number is incomplete.",
  },
  cardNumberInvalid: {
    code: "invalid_number",
    type: "validation_error",
    message: "Your card number is invalid.",
  },
  cvcIncomplete: {
    code: "incomplete_cvc",
    type: "validation_error",
    message: "Your card's security code is incomplete.",
  },
  expiryPast: {
    code: "invalid_expiry_year_past",
    type: "validation_error",
    message: "Your card's expiration year is in the past.",
  },
  expiryIncomplete: {
    code: "incomplete_expiry",
    type: "validation_error",
    message: "Your card's expiration date is incomplete.",
  },
  zipIncomplete: {
    code: "incomplete_zip",
    type: "validation_error",
    message: "Your postal code is incomplete.",
  },
};

export const contractsErrorObjects = {
  cardDeclined: {
    code: "internal server error",
    message:
      'unexpected error updating customer information: {"code":"card_declined","doc_url":"https://stripe.com/docs/error-codes/card-declined","status":402,"message":"Your card was declined.","request_id":"req_U3IuQsO1D0kM8U","type":"card_error"}',
    traceId: "23945fe9-8dfa-46c1-8980-c83fad798d82",
  },
  cardExpired: {
    code: "internal server error",
    message:
      'unexpected error updating customer information: {"code":"expired_card","doc_url":"https://stripe.com/docs/error-codes/expired-card","status":402,"message":"Your card has expired.","param":"exp_month","request_id":"req_7XZLOD3l39DNzs","type":"card_error"}',
    traceId: "cd5d9216-e582-4f4e-a263-f133d5dc9283",
  },
  expiredPaymentMethod: {
    code: "payment method error",
    message:
      '{"code":"expired_card","doc_url":"https://stripe.com/docs/error-codes/expired-card","status":402,"message":"Your card has expired.","request_id":"req_mQc1F6zkIAvCoh","type":"card_error"}',
    traceId: "c53e5308-4c1b-4f66-b588-467e124539f6",
  },
  cvcIncorrect: {
    code: "internal server error",
    message:
      'unexpected error updating customer information: {"code":"incorrect_cvc","doc_url":"https://stripe.com/docs/error-codes/incorrect-cvc","status":402,"message":"Your card\'s security code is incorrect.","param":"cvc","request_id":"req_FEcntMD08StvZ2","type":"card_error"}',
    traceId: "183164f3-bb5a-46ee-afb4-889fb1b93256",
  },
  insufficientFunds: {
    code: "internal server error",
    message:
      'unexpected error updating customer information: {"code":"card_declined","doc_url":"https://stripe.com/docs/error-codes/card-declined","status":402,"message":"Your card has insufficient funds.","request_id":"req_SYTeIg5nO6lWt1","type":"card_error"}',
    traceId: "8ebe2d2d-35ad-434a-bd24-d5aa14a7b390",
  },
  invalidVat: {
    code: "invalid customer information",
    message:
      '{"code":"tax_id_invalid","doc_url":"https://stripe.com/docs/error-codes/tax-id-invalid","status":400,"message":"Invalid value for eu_vat.","request_id":"req_7pf3OCHAAwYnLj","type":"invalid_request_error"}',
    traceId: "296e07f4-bc89-4e17-9915-4642c407ca69",
  },
  priceMismatch: {
    code: "renewal is blocked",
    message:
      'cannot accept renewal "rALFy6Z1he9ViqVLCReAuxI9iDuxxCIkZZ6_lOt6NwU0" because its price is not as expected: renewal says 125 USD but Stripe says 12500 USD',
    traceId: "e1da8271-6c29-45a2-8981-5f43b7e61727",
  },
};
