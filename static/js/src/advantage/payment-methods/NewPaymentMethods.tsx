import React from "react";
import { useListOrganizationPaymentMethods } from "./hooks";

export const NewPaymentMethods = (): React.JSX.Element => {
  const { data: paymentMethods } = useListOrganizationPaymentMethods();
  return (
    <>
      {paymentMethods?.map((method: any) => (
        <div key={method.id}>
          <p>
            {method.card.brand} ending in {method.card.last4}
          </p>
        </div>
      ))}
    </>
  );
};
