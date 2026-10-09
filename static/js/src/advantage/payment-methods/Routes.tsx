import { BrowserRouter, Route, Routes as RouterRoutes } from "react-router-dom";
import Invoices, { type InvoiceRow } from "./Invoices";
import PaymentMethods, { type PaymentMethodProps } from "./PaymentMethods";
import { NewPaymentMethods } from "./NewPaymentMethods";
import { useListSubscriptions } from "./hooks";
import { useMemo } from "react";
import { Spinner } from "@canonical/react-components";

type Props = {
  paymentMethodProps: PaymentMethodProps;
  invoiceProps: {
    accountId: string;
    invoices: InvoiceRow[];
    marketplace: string;
    currentPage: number;
    totalPages: number;
  };
};

function AccountRoutes({
  paymentMethodProps,
  invoiceProps,
}: Props): JSX.Element {
  const { data: canconSubscriptions, isLoading: loadingListSubscriptions } =
    useListSubscriptions();
  const paymentMethodElement = useMemo(() => {
    if (loadingListSubscriptions) return <Spinner />;
    if (canconSubscriptions?.length > 0) return <NewPaymentMethods />;
    return <PaymentMethods {...paymentMethodProps} />;
  }, [paymentMethodProps, canconSubscriptions, loadingListSubscriptions]);
  return (
    <BrowserRouter>
      <RouterRoutes>
        <Route path="/account/payment-methods" element={paymentMethodElement} />
        <Route
          path="/account/invoices"
          element={<Invoices {...invoiceProps} />}
        />
        <Route
          path="/pro/distributor/invoice"
          element={<Invoices {...invoiceProps} />}
        />
      </RouterRoutes>
    </BrowserRouter>
  );
}

export default AccountRoutes;
