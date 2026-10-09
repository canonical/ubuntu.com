import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getCustomerInfo,
  postCustomerInfoToStripeAccount,
} from "../api/contracts";
import { countries, vatCountries } from "../countries-and-states";

export type InvoiceRow = {
  service: string;
  period: string | null;
  date: string;
  invoiceStatus: string | null;
  purchaseStatus: string;
  total: string | null;
  receiptUrl: string | null;
};

type Props = {
  accountId: string;
  invoices: InvoiceRow[];
  marketplace: string;
  currentPage: number;
  totalPages: number;
};

type BillingFields = {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  vat: string;
};

type BillingErrors = Partial<Record<keyof BillingFields, string>>;

const emptyFields: BillingFields = {
  name: "",
  address: "",
  city: "",
  postalCode: "",
  vat: "",
};

function Invoices({
  accountId,
  invoices,
  marketplace,
  currentPage,
  totalPages,
}: Props): JSX.Element {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [countryCode, setCountryCode] = useState("");
  const [fields, setFields] = useState(emptyFields);
  const [fieldErrors, setFieldErrors] = useState<BillingErrors>({});
  const [hasGeneralError, setHasGeneralError] = useState(false);

  const customerInfoQuery = useQuery({
    queryKey: ["invoice-customer-info", accountId],
    queryFn: async () => {
      const response = await getCustomerInfo(accountId);
      if (response.errors) throw new Error("Unable to load billing details");
      return response.data.customerInfo;
    },
    enabled: isModalOpen && Boolean(accountId),
    staleTime: 0,
  });

  const saveBillingMutation = useMutation({
    mutationFn: postCustomerInfoToStripeAccount,
  });

  useEffect(() => {
    const customerInfo = customerInfoQuery.data;
    if (!customerInfo) return;

    setCountryCode(customerInfo.address?.country ?? "");
    setFields({
      name: customerInfo.name ?? "",
      address: customerInfo.address?.line1 ?? "",
      city: customerInfo.address?.city ?? "",
      postalCode: customerInfo.address?.postal_code ?? "",
      vat: customerInfo.taxID?.value ?? "",
    });
  }, [customerInfoQuery.data]);

  const closeModal = () => {
    if (saveBillingMutation.isPending) return;
    setIsModalOpen(false);
    setFieldErrors({});
    setHasGeneralError(false);
  };

  const updateField = (field: keyof BillingFields, value: string) => {
    setFields((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const saveBillingDetails = () => {
    const nextErrors: BillingErrors = {};
    (["name", "address", "city", "postalCode"] as const).forEach((field) => {
      if (!fields[field].trim()) nextErrors[field] = "This field is required.";
    });
    setFieldErrors(nextErrors);
    setHasGeneralError(false);
    if (Object.keys(nextErrors).length) return;

    const country = countries.find(({ value }) => value === countryCode);
    saveBillingMutation.mutate(
      {
        paymentMethodID: null,
        accountID: accountId,
        address: {
          line1: fields.address,
          city: fields.city,
          postal_code: fields.postalCode,
          country: country?.value ?? "",
        },
        name: fields.name,
        taxID: {
          value: fields.vat,
          type: countryCode === "ZA" ? "za_vat" : "eu_vat",
        },
      },
      {
        onSuccess: (response) => {
          if (response.errors?.includes("tax_id_invalid")) {
            setFieldErrors({ vat: "The VAT number entered is invalid." });
            return;
          }
          if (response.errors) {
            setHasGeneralError(true);
            return;
          }
          setIsModalOpen(false);
        },
        onError: () => setHasGeneralError(true),
      },
    );
  };

  const changeMarketplace = (value: string) => {
    const search = new URLSearchParams(location.search);
    if (value) search.set("marketplace", value);
    else search.delete("marketplace");
    search.delete("page");
    const query = search.toString();
    window.location.assign(`${location.pathname}${query ? `?${query}` : ""}`);
  };

  const pageHref = (page: number) => {
    const search = new URLSearchParams(location.search);
    search.set("page", String(page));
    return `${location.pathname}?${search.toString()}`;
  };

  const countryName = countries.find(
    ({ value }) => value === countryCode,
  )?.label;
  const isVatRequired = vatCountries.includes(countryCode);
  const pageStart = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const pages = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => pageStart + index,
  );

  return (
    <>
      <section className="p-strip--suru-topped p-strip-account-page">
        <div className="u-fixed-width">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <h1>Billing</h1>
            <button
              className="p-button"
              onClick={() => {
                setHasGeneralError(false);
                setFieldErrors({});
                setIsModalOpen(true);
              }}
              type="button"
            >
              Edit billing details
            </button>
          </div>
        </div>
        <div className="row">
          <div className="col-3" style={{ padding: "0.75rem 0" }}>
            <select
              name="marketplace"
              id="marketplace-dropdown"
              value={marketplace}
              onChange={(event) => changeMarketplace(event.target.value)}
            >
              <option value="">All invoices</option>
              <option value="blender">Blender Support</option>
              <option value="canonical-ua">Ubuntu Pro</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            {invoices.length ? (
              <>
                <table className="p-table--mobile-card">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Date</th>
                      <th style={{ width: "10%" }}>Status</th>
                      <th
                        className="u-align--right"
                        style={{ paddingRight: "5%" }}
                      >
                        Total
                      </th>
                      <th>Invoice and receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice, index) => (
                      <tr key={`${invoice.date}-${invoice.service}-${index}`}>
                        <td aria-label="Service">
                          {invoice.service}
                          {invoice.period ? ` (${invoice.period})` : ""}
                        </td>
                        <td aria-label="Date">{invoice.date}</td>
                        <td aria-label="Status">
                          <InvoiceStatus invoice={invoice} />
                        </td>
                        <td
                          className="u-align--right"
                          aria-label="Total"
                          style={{ paddingRight: "5%" }}
                        >
                          {formatTotal(invoice.total)}
                        </td>
                        <td aria-label="Download PDF">
                          {invoice.receiptUrl ? (
                            <a
                              target="_blank"
                              rel="noreferrer"
                              href={invoice.receiptUrl}
                            >
                              View
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <section className="p-strip is-shallow">
                    <nav aria-label="Invoice pages">
                      <ol className="p-pagination u-align--center">
                        <li className="p-pagination__item">
                          {currentPage > 1 ? (
                            <Link
                              to={pageHref(currentPage - 1)}
                              reloadDocument
                              className="p-pagination__link--previous"
                              aria-label="Previous page"
                            >
                              <i className="p-icon--chevron-down">
                                Previous page
                              </i>
                            </Link>
                          ) : (
                            <span className="p-pagination__link--previous is-disabled">
                              <i className="p-icon--chevron-down">
                                Previous page
                              </i>
                            </span>
                          )}
                        </li>
                        {pages.map((page) => (
                          <li className="p-pagination__item" key={page}>
                            <Link
                              to={pageHref(page)}
                              reloadDocument
                              className={`p-pagination__link${page === currentPage ? " is-active" : ""}`}
                              aria-current={
                                page === currentPage ? "page" : undefined
                              }
                            >
                              {page}
                            </Link>
                          </li>
                        ))}
                        <li className="p-pagination__item">
                          {currentPage < totalPages ? (
                            <Link
                              to={pageHref(currentPage + 1)}
                              reloadDocument
                              className="p-pagination__link--next"
                              aria-label="Next page"
                            >
                              <i className="p-icon--chevron-down">Next page</i>
                            </Link>
                          ) : (
                            <span className="p-pagination__link--next is-disabled">
                              <i className="p-icon--chevron-down">Next page</i>
                            </span>
                          )}
                        </li>
                      </ol>
                    </nav>
                  </section>
                )}
              </>
            ) : (
              <p>No invoices available.</p>
            )}
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div
          className="p-modal"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeModal();
          }}
          style={{ display: "flex" }}
        >
          <section
            className="p-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-billing-title"
          >
            <header className="p-modal__header">
              <h2 className="p-modal__title" id="edit-billing-title">
                Edit billing details
              </h2>
              <button
                className="p-modal__close"
                aria-label="Close active modal"
                onClick={closeModal}
                type="button"
              >
                Close
              </button>
            </header>
            {customerInfoQuery.isLoading ? (
              <p role="status">Loading billing details...</p>
            ) : customerInfoQuery.isError ? (
              <p className="p-notification__message" role="alert">
                Unable to load billing details. Please try again later.
              </p>
            ) : (
              <form
                className="p-form p-form--stacked"
                onSubmit={(event) => {
                  event.preventDefault();
                  saveBillingDetails();
                }}
              >
                <div className="p-form__group row u-no-padding--left u-no-padding--right">
                  <div className="col-4">
                    <label className="p-form__label" htmlFor="billing-country">
                      Country/Region
                    </label>
                  </div>
                  <div className="col-8">
                    <div className="p-form__control">
                      <strong id="billing-country">{countryName}</strong>
                    </div>
                  </div>
                </div>
                {isVatRequired && (
                  <BillingField
                    field="vat"
                    label="VAT number"
                    value={fields.vat}
                    error={fieldErrors.vat}
                    onChange={updateField}
                  />
                )}
                <hr className="p-rule" />
                <BillingField
                  field="name"
                  label="Name"
                  value={fields.name}
                  error={fieldErrors.name}
                  onChange={updateField}
                />
                <BillingField
                  field="address"
                  label="Address"
                  value={fields.address}
                  error={fieldErrors.address}
                  onChange={updateField}
                />
                <BillingField
                  field="city"
                  label="City"
                  value={fields.city}
                  error={fieldErrors.city}
                  onChange={updateField}
                />
                <BillingField
                  field="postalCode"
                  label="Postal code"
                  value={fields.postalCode}
                  error={fieldErrors.postalCode}
                  onChange={updateField}
                />
                {hasGeneralError && (
                  <div className="p-notification--negative" role="alert">
                    <div className="p-notification__content">
                      <h5 className="p-notification__title">
                        Error saving your details
                      </h5>
                      <p className="p-notification__message">
                        Please try again later. If the issue persists, contact
                        Canonical sales.
                      </p>
                    </div>
                  </div>
                )}
                <footer className="p-modal__footer">
                  <button
                    className="u-no-margin--bottom"
                    disabled={saveBillingMutation.isPending}
                    onClick={closeModal}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="p-button--positive u-no-margin--bottom"
                    disabled={saveBillingMutation.isPending}
                    type="submit"
                  >
                    {saveBillingMutation.isPending ? "Saving..." : "Save"}
                  </button>
                </footer>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}

function BillingField({
  field,
  label,
  value,
  error,
  onChange,
}: {
  field: keyof BillingFields;
  label: string;
  value: string;
  error?: string;
  onChange: (field: keyof BillingFields, value: string) => void;
}): JSX.Element {
  const id = `billing-${field}`;
  return (
    <div
      className={`p-form__group row u-no-padding--left u-no-padding--right${error ? " is-error" : ""}`}
    >
      <div className="col-4">
        <label className="p-form__label" htmlFor={id}>
          {label}
        </label>
      </div>
      <div className="col-8">
        <div className="p-form__control">
          <input
            className="p-form-validation__input"
            type="text"
            id={id}
            name={field}
            value={value}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            onChange={(event) => onChange(field, event.target.value)}
          />
          {error && (
            <p className="p-form-validation__message" id={`${id}-error`}>
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function InvoiceStatus({ invoice }: { invoice: InvoiceRow }): JSX.Element {
  if (invoice.invoiceStatus === "paid") {
    return <div className="p-chip--positive is-readonly">Paid</div>;
  }
  if (invoice.invoiceStatus === "open") {
    return <div className="p-chip is-readonly">Pending</div>;
  }
  if (invoice.invoiceStatus) {
    return <div className="p-chip--negative is-readonly">Failed</div>;
  }
  if (invoice.purchaseStatus === "done") {
    return <div className="p-chip is-readonly">Not available</div>;
  }
  return <div className="p-chip is-readonly">Pending</div>;
}

function formatTotal(total: string | null): string {
  if (!total) return "-";
  const [amount, currency] = total.split(" ");
  if (!currency) return total;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(Number(amount));
}

export default Invoices;
