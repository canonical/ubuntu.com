export async function getRenewal(renewalID) {
  let response = await fetch(`/advantage/renewals/${renewalID}`);

  let data = await response.json();
  console.log(data);
  return data;
}

export async function postInvoiceIDToRenewal(renewalID, invoiceID) {
  let response = await fetch(
    `/advantage/renewals/${renewalID}/invoices/${invoiceID}`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  let data = await response.json();
  console.log(data);
  return data;
}

export async function postRenewalIDToProcessPayment(renewalID) {
  let response = await fetch(
    `/advantage/renewals/${renewalID}/process-payment`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  let data = await response.json();
  console.log(data);
  return data;
}

export async function postPaymentMethodToStripeAccount(
  paymentMethodID,
  accountID
) {
  let response = await fetch("/advantage/payment-method", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payment_method_id: paymentMethodID,
      account_id: accountID,
    }),
  });

  let data = await response.json();
  console.log(data);
  return data;
}
