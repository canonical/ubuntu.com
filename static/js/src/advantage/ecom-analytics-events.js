export function addToCartEvent(product) {
  dataLayer.push({
    event: "addToCart",
    ecommerce: {
      add: {
        products: [
          {
            name: product.name,
            id: product.id,
            quantity: product.quantity,
          },
        ],
      },
    },
  });
}

export function removeFromCartEvent(product) {
  dataLayer.push({
    event: "removeFromCart",
    ecommerce: {
      remove: {
        products: [
          {
            name: product.name,
            id: product.id,
            quantity: product.quantity,
          },
        ],
      },
    },
  });
}
