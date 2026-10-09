import { useCallback, useContext } from "react";
import { Button } from "@canonical/react-components";
import { FormContext } from "../../utils/FormContext";
import { ProductTypes, ProductUsers, PublicClouds } from "../../utils/utils";
import {
  getLocalStorageItem,
  PRO_SELECTOR_KEYS,
} from "advantage/distributor/utils/utils";
import { useCreatePurchaseSession } from "../../hooks/useCreatePurchaseSession";

export default function PaymentButton({ ...props }) {
  const {
    quantity,
    product,
    productUser,
    productType,
    version,
    support,
    sla,
    feature,
    iotDevice,
  } = useContext(FormContext);
  let params = new URLSearchParams(document.location.search);
  let referral_id = params.get("referral_id") || "";
  const { mutate: createPurchaseSession } = useCreatePurchaseSession();

  const contracts_enabled =
    window?.appConfig?.featureFlags?.contracts_enabled === `true`;
  const shopCheckoutData = {
    products: [
      {
        product: product,
        quantity: Number(quantity) ?? 0,
      },
    ],
    action: "purchase",
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      if (contracts_enabled) {
        // Add any additional logic for when contracts are enabled
        const publicCloud = getLocalStorageItem(
          PRO_SELECTOR_KEYS.PUBLIC_CLOUD,
          PublicClouds.aws,
        );
        const purchaseSessionData = {
          orderInformation: {
            productUser,
            productType,
            iotDevice:
              productType === ProductTypes.iotDevice ? iotDevice : undefined,
            publicClouds: publicCloud,
            LTSVersions: version,
            support,
            SLA: sla,
            features: feature,
            quantity: Number(quantity) || 0,
          },
        };

        createPurchaseSession(purchaseSessionData);
        return;
      }
      e.preventDefault();
      localStorage.setItem(
        "shop-checkout-data",
        JSON.stringify(shopCheckoutData),
      );
      localStorage.setItem("referral_id", referral_id);
      location.href = "/account/checkout";
    },
    [shopCheckoutData, referral_id],
  );

  return (
    <>
      {productUser === ProductUsers.myself ? (
        <Button
          appearance="positive"
          onClick={(e) => {
            e.preventDefault();
            location.href = "/pro/dashboard";
          }}
          {...props}
        >
          Register
        </Button>
      ) : (
        <Button appearance="positive" onClick={handleSubmit} {...props}>
          Continue to checkout
        </Button>
      )}
    </>
  );
}
