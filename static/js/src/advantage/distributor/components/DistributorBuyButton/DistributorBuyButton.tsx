import { useContext } from "react";
import { Button } from "@canonical/react-components";
import { FormContext } from "advantage/distributor/utils/FormContext";
import {
  ChannelProduct,
  SubscriptionItem,
  getProductId,
} from "advantage/distributor/utils/utils";

const DistributorBuyButton = () => {
  const { products, subscriptionList, offer } = useContext(FormContext);

  const getProductQauntity = (product: ChannelProduct) => {
    let quantity = 0;
    subscriptionList?.forEach((subscription: SubscriptionItem) => {
      if (subscription && product) {
        const productId = getProductId(
          subscription.type,
          subscription.support,
          subscription.sla,
        );
        if (productId === product?.productID && product?.price !== undefined) {
          quantity = subscription.quantity;
        }
      }
    });
    return quantity;
  };

  const checkoutProducts = products?.map((product: ChannelProduct) => {
    const prod = {
      id: product?.id,
      longId: product?.longId, // product listing id
      marketplace: product?.marketplace,
      name: product?.name,
      price: {
        value: Number(product?.price?.value),
        discount: Number(offer?.discount) ?? 0,
        currency: product?.price?.currency,
      },
      offerId: offer?.id,
    };
    return {
      product: prod,
      quantity: getProductQauntity(product),
    };
  });

  const shopCheckoutData = {
    products: checkoutProducts,
    action: "offer",
  };

  return (
    <p>
      <Button
        appearance="positive"
        className="u-no-margin--bottom distributor-checkout-button"
        onClick={(e) => {
          e.preventDefault();
          localStorage.setItem(
            "shop-checkout-data",
            JSON.stringify(shopCheckoutData),
          );
          location.href = "/account/checkout";
        }}
        disabled={products?.length === 0}
      >
        Proceed to checkout
      </Button>
    </p>
  );
};

export default DistributorBuyButton;
