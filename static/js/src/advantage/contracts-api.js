export async function getPurchase(purchaseID) {
  let response = await fetch(`/advantage/purchases/${purchaseID}`, {
    cache: "no-store",
  });

  let data = await response.json();
  return data;
}

export async function getRenewal(renewalID) {
  let response = await fetch(`/advantage/renewals/${renewalID}`, {
    cache: "no-store",
  });

  let data = await response.json();
  return data;
}

export async function postInvoiceID(transactionType, transactionID, invoiceID) {
  let response = await fetch(
    `/advantage/${transactionType}/${transactionID}/invoices/${invoiceID}`,
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

export async function postPurchaseData(
  accountID,
  products,
  previousPurchaseId
) {
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
      previous_purchase_id: previousPurchaseId,
    }),
  });

  let data = await response.json();
  return data;
}

export async function postPurchasePreviewData(
  accountID,
  products,
  previousPurchaseId
) {
  let response = await fetch(`/advantage/subscribe/preview`, {
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
      previous_purchase_id: previousPurchaseId,
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

export async function postCustomerInfoForPurchasePreview(
  accountID,
  address,
  taxID
) {
  let response = await fetch("/advantage/customer-info-anon", {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      account_id: accountID,
      address: address,
      tax_id: taxID,
    }),
  });

  let data = await response.json();
  return data;
}
