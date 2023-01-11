export async function getPurchase(purchaseID) {
  const queryString = window.location.search; // Pass arguments to the flask backend

  let response = await fetch(`/account/purchases/${purchaseID}${queryString}`, {
    cache: "no-store",
  });

  let data = await response.json();
  return data;
}

export async function ensurePurchaseAccount({
  email,
  accountName,
  captchaValue,
  marketplace,
}) {
  const queryString = window.location.search; // Pass arguments to the flask backend

  let response = await fetch(`/account/purchase-account${queryString}`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      account_name: accountName,
      captcha_value: captchaValue,
      marketplace: marketplace,
    }),
  });

  const data = await response.json();
  return data;
}

export async function getRenewal(renewalID) {
  const queryString = window.location.search; // Pass arguments to the flask backend

  let response = await fetch(`/pro/renewals/${renewalID}${queryString}`, {
    cache: "no-store",
  });

  let data = await response.json();
  return data;
}

export async function getCustomerInfo(accountId) {
  const queryString = window.location.search; // Pass arguments to the flask backend

  let response = await fetch(
    `/account/customer-info/${accountId}${queryString}`,
    {
      cache: "no-store",
    }
  );

  let data = await response.json();
  return data;
}

export async function getUserInfo() {
  const queryString = window.location.search; // Pass arguments to the flask backend
  const response = await fetch(`/pro/user-info${queryString}`, {
    cache: "no-store",
  });
  return await response.json();
}

export async function getUserSubscriptions() {
  const queryString = window.location.search; // Pass arguments to the flask backend
  const response = await fetch(`/pro/user-subscriptions${queryString}`, {
    cache: "no-store",
  });
  return await response.json();
}

export async function getContractToken(contractId) {
  const queryString = window.location.search; // Pass arguments to the flask backend
  const response = await fetch(
    `/pro/contracts/${contractId}/token${queryString}`,
    {
      cache: "no-store",
    }
  );
  return await response.json();
}

export async function putContractEntitlements(contractId, entitlements) {
  const queryString = window.location.search; // Pass arguments to the flask backend
  const response = await fetch(
    `/pro/contracts/${contractId}/entitlements${queryString}`,
    {
      cache: "no-store",
      credentials: "include",
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        entitlements,
      }),
    }
  );

  return await response.json();
}

export async function getLastPurchaseIds(accountId) {
  const queryString = window.location.search; // Pass arguments to the flask backend
  const response = await fetch(
    `/account/last-purchase-ids/${accountId}${queryString}`,
    {
      cache: "no-store",
    }
  );
  return await response.json();
}

export async function postInvoiceID(transactionType, transactionID, invoiceID) {
  const queryString = window.location.search; // Pass arguments to the flask backend

  let response = await fetch(
    `/account/${transactionType}/${transactionID}/invoices/${invoiceID}${queryString}`,
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
  const queryString = window.location.search; // Pass arguments to the flask backend

  let response = await fetch(
    `/pro/renewals/${renewalID}/process-payment${queryString}`,
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
  previousPurchaseId,
  marketplace
) {
  const queryString = window.location.search; // Pass arguments to the flask backend

  const purchaseData = {
    account_id: accountID,
    products: products,
    previous_purchase_id: previousPurchaseId,
    period: products[0].period,
  };

  if (marketplace) {
    purchaseData.marketplace = marketplace;
  }

  let response = await fetch(`/pro/subscribe${queryString}`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(purchaseData),
  });

  let data = await response.json();
  return data;
}

export async function cancelContract(
  accountId,
  previousPurchaseId,
  productId,
  marketplace
) {
  const queryString = window.location.search; // Pass arguments to the flask backend

  let response = await fetch(`/pro/subscribe${queryString}`, {
    method: "DELETE",
    cache: "no-store",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      account_id: accountId,
      previous_purchase_id: previousPurchaseId,
      product_listing_id: productId,
      marketplace: marketplace,
    }),
  });

  let data = await response.json();
  return data;
}

export async function resizeContract(
  accountId,
  previousPurchaseId,
  productId,
  quantity,
  period,
  marketplace
) {
  const queryString = window.location.search; // Pass arguments to the flask backend
  let response = await fetch(`/pro/subscribe${queryString}`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      account_id: accountId,
      previous_purchase_id: previousPurchaseId,
      period: period,
      products: [
        {
          product_listing_id: productId,
          quantity: quantity,
        },
      ],
      resizing: true,
      marketplace: marketplace,
    }),
  });

  let data = await response.json();
  return data;
}
export async function previewResizeContract(
  accountId,
  previousPurchaseId,
  productId,
  quantity,
  period,
  marketplace
) {
  const queryString = window.location.search; // Pass arguments to the flask backend
  let response = await fetch(`/pro/subscribe/preview${queryString}`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      account_id: accountId,
      previous_purchase_id: previousPurchaseId,
      period: period,
      products: [
        {
          product_listing_id: productId,
          quantity: quantity,
        },
      ],
      resizing: true,
      marketplace: marketplace,
    }),
  });

  let data = await response.json();
  return data;
}

export async function postPurchasePreviewData(
  accountID,
  products,
  previousPurchaseId,
  marketplace
) {
  const queryString = window.location.search; // Pass arguments to the flask backend

  const previewData = {
    account_id: accountID,
    products: products,
    previous_purchase_id: previousPurchaseId,
    period: products[0].period,
  };

  if (marketplace) {
    previewData.marketplace = marketplace;
  }

  let response = await fetch(`/pro/subscribe/preview${queryString}`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(previewData),
  });

  let data = await response.json();
  return data;
}

export async function postCustomerInfoToStripeAccount({
  paymentMethodID,
  accountID,
  address,
  name,
  taxID,
}) {
  const queryString = window.location.search; // Pass arguments to the flask backend

  let response = await fetch(`/account/customer-info${queryString}`, {
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
  name,
  address,
  taxID
) {
  const queryString = window.location.search; // Pass arguments to the flask backend

  let response = await fetch(`/account/customer-info-anon${queryString}`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      account_id: accountID,
      name: name,
      address: address,
      tax_id: taxID,
    }),
  });

  let data = await response.json();
  return data;
}

export async function setPaymentMethod(accountID, paymentMethodId) {
  const queryString = window.location.search; // Pass arguments to the flask backend

  let response = await fetch(`/account/payment-methods${queryString}`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      account_id: accountID,
      payment_method_id: paymentMethodId,
    }),
  });

  let data = await response.json();
  return data;
}

export async function setAutoRenewal(value) {
  const queryString = window.location.search; // Pass arguments to the flask backend

  let subscriptions = [];
  Object.entries(value).forEach(([subscription_id, should_auto_renew]) =>
    subscriptions.push({ subscription_id, should_auto_renew })
  );
  let response = await fetch(`/pro/set-auto-renewal${queryString}`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subscriptions }),
  });

  let data = await response.json();
  return data;
}

export async function postFreeTrial({
  accountID,
  products,
  previousPurchaseId,
}) {
  const queryString = window.location.search; // Pass arguments to the flask backend

  let response = await fetch(`/pro/subscribe${queryString}`, {
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
      period: products[0].period,
      trialling: true,
    }),
  });

  let data = await response.json();
  return data;
}

export async function endTrial(accountID) {
  const queryString = window.location.search; // Pass arguments to the flask backend

  let response = await fetch(`/pro/trial/${accountID}${queryString}`, {
    method: "DELETE",
    cache: "no-store",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  let data = await response.json();
  return data;
}