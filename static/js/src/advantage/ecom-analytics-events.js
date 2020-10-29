export function addToCartEvent(product) {
  if (dataLayer) {
    dataLayer.push({
      event: "addToCart",
      ecommerce: {
        add: {
          products: [product],
        },
      },
    });
  }
}

export function removeFromCartEvent(product) {
  if (dataLayer) {
    dataLayer.push({
      event: "removeFromCart",
      ecommerce: {
        remove: {
          products: [product],
        },
      },
    });
  }
}

/**
 *
 * @param {Array} cartItems
 * @param {String} step
 *
 * There are three steps to the checkout:
 * proceededToCheckout, addedPaymentDetails and
 * confirmedPurchase
 */
export function checkoutEvent(products, step) {
  if (dataLayer) {
    dataLayer.push({
      event: "checkout",
      ecommerce: {
        checkout: {
          actionField: { step: step },
          products: products,
        },
      },
    });
  }
}

export function purchaseEvent(purchaseInfo, products) {
  if (dataLayer) {
    dataLayer.push({
      ecommerce: {
        purchase: {
          actionField: {
            id: purchaseInfo.id, // Transaction ID. Required for purchases and refunds.
            affiliation: purchaseInfo.origin,
            revenue: purchaseInfo.total, // Total transaction value (incl. tax and shipping)
            tax: purchaseInfo.tax,
          },
          products: products,
        },
      },
    });
  }
}
