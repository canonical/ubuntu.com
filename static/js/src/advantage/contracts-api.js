export async function getPurchase(purchaseID) {
  const queryString = window.location.search;

  let response = await fetch(
    `/advantage/purchases/${purchaseID}${queryString}`,
    {
      cache: "no-store",
    }
  );

  let data = await response.json();
  return data;
}

export async function ensurePurchaseAccount(
  email,
  accountName,
  paymentMethodID
) {
  const queryString = window.location.search;

  let response = await fetch(`/advantage/purchase-account${queryString}`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      accountName: accountName,
      payment_method_id: paymentMethodID,
    }),
  });

  let data = await response.json();
  return data;
}

export async function getRenewal(renewalID) {
  const queryString = window.location.search;

  let response = await fetch(`/advantage/renewals/${renewalID}${queryString}`, {
    cache: "no-store",
  });

  let data = await response.json();
  return data;
}

export async function getCustomerInfo(accountId) {
  const queryString = window.location.search;

  let response = await fetch(
    `/advantage/customer-info/${accountId}${queryString}`,
    {
      cache: "no-store",
    }
  );

  let data = await response.json();
  return data;
}

export async function postInvoiceID(transactionType, transactionID, invoiceID) {
  const queryString = window.location.search;

  let response = await fetch(
    `/advantage/${transactionType}/${transactionID}/invoices/${invoiceID}${queryString}`,
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
  const queryString = window.location.search;

  let response = await fetch(
    `/advantage/renewals/${renewalID}/process-payment${queryString}`,
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
  const queryString = window.location.search;

  let response = await fetch(`/advantage/subscribe${queryString}`, {
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

export async function postRenewalPreviewData(renewalID) {
  const queryString = window.location.search;

  let response = await fetch(
    `/advantage/renewals/${renewalID}/preview${queryString}`,
    {
      method: "POST",
      cache: "no-store",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  let data = await response.json();
  return data;
}

export async function postPurchasePreviewData(
  accountID,
  products,
  previousPurchaseId
) {
  const queryString = window.location.search;

  let response = await fetch(`/advantage/subscribe/preview${queryString}`, {
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
  const queryString = window.location.search;

  let response = await fetch(`/advantage/customer-info${queryString}`, {
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
  const queryString = window.location.search;

  let response = await fetch(`/advantage/customer-info-anon${queryString}`, {
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
