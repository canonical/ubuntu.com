import { BrowserRouter, Route, Routes as RouterRoutes } from "react-router-dom";
import Invoices, { type InvoiceRow } from "./Invoices";
import PaymentMethods, { type PaymentMethodProps } from "./PaymentMethods";

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
  return (
    <BrowserRouter>
      <RouterRoutes>
        <Route
          path="/account/payment-methods"
          element={<PaymentMethods {...paymentMethodProps} />}
        />
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
