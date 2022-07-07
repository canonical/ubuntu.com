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

export function logSelectOptionEvent(option, value) {
  if (dataLayer) {
    dataLayer.push({
      event: "selectOption",
      ecommerce: {
        select: {
          option: option,
          value: value,
        },
      },
    });
  }
}

export function logOpenModalEvent() {
  if (dataLayer) {
    dataLayer.push({
      event: "openModal",
    });
  }
}

export function logCloseModalEvent() {
  if (dataLayer) {
    dataLayer.push({
      event: "closeModal",
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
      event: "purchase",
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
