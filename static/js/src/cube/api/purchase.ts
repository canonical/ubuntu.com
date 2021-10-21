export const postPurchaseData = async (
  accountID: string,
  productListingId: string,
  preview: boolean
) => {
  // Pass arguments to the flask backend eg. "test_backend=true"
  const queryString = window.location.search;

  const response = await fetch(`/cube/microcerts/purchase.json${queryString}`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      account_id: accountID,
      product_listing_id: productListingId,
      ...(preview && { preview: "true" }),
    }),
  });

  const data = await response.json();
  return data;
};
