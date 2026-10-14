import { BrowserRouter, Route, Routes as RouterRoutes } from "react-router-dom";
import Invoices from "./Invoices";
import PaymentMethods, { type PaymentMethodProps } from "./PaymentMethods";
import { NewPaymentMethods } from "./NewPaymentMethods";
import { useListSubscriptions } from "./hooks";
import { useMemo } from "react";
import { Spinner } from "@canonical/react-components";

type Props = {
  paymentMethodProps: PaymentMethodProps;
};

function AccountRoutes({ paymentMethodProps }: Props): JSX.Element {
  const { data: canconSubscriptions, isLoading: loadingListSubscriptions } =
    useListSubscriptions();
  const paymentMethodElement = useMemo(() => {
    if (loadingListSubscriptions) return <Spinner />;
    if ((canconSubscriptions?.paginationMetadata?.totalRecords || 0) > 0)
      return <NewPaymentMethods />;
    return <PaymentMethods {...paymentMethodProps} />;
  }, [paymentMethodProps, canconSubscriptions, loadingListSubscriptions]);
  return (
    <BrowserRouter>
      <RouterRoutes>
        <Route path="/account/payment-methods" element={paymentMethodElement} />
        <Route path="/account/invoices" element={<Invoices />} />
        <Route path="/pro/distributor/invoice" element={<Invoices />} />
      </RouterRoutes>
    </BrowserRouter>
  );
}

export default AccountRoutes;
