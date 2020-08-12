export async function getRenewal(renewalID) {
  let response = await fetch(`/advantage/renewals/${renewalID}`, {
    cache: "no-store",
  });

  let data = await response.json();
  return data;
}

export async function postInvoiceIDToRenewal(renewalID, invoiceID) {
  let response = await fetch(
    `/advantage/renewals/${renewalID}/invoices/${invoiceID}`,
    {
      cache: "no-store",
      credentials: "include",
      method: "POST",
    }
  );

  let data = await response.json();
  return data;
}

export async function postRenewalIDToProcessPayment(renewalID) {
  let response = await fetch(
    `/advantage/renewals/${renewalID}/process-payment`,
    {
      cache: "no-store",
      credentials: "include",
      method: "POST",
    }
  );

  let data = await response.json();
  return data;
}

export async function postPurchaseData(accountID, products) {
  let response = await fetch(`/advantage/subscribe`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      account_id: accountID,
      products: products,
    }),
  });

  let data = await response.json();
  return data;
}

export async function postCustomerInfoToStripeAccount(
  paymentMethodID,
  accountID,
  address,
  name,
  taxID
) {
  let response = await fetch("/advantage/customer-info", {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      payment_method_id: paymentMethodID,
      account_id: accountID,
      address: address,
      name: name,
      tax_id: taxID,
    }),
  });

  let data = await response.json();
  return data;
}
