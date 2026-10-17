import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import EditBillingDetailsModal from "./EditBillingDetailsModal";
import { useInvoicesQuery, useListOrganizationInvoices, useListSubscriptions } from "./hooks";
import { NewEditBillingDetails } from "./NewEditBillingDetails";

export type InvoiceRow = {
  service: string;
  period: string | null;
  date: string;
  invoiceStatus: string | null;
  purchaseStatus: string;
  total: string | null;
  receiptUrl: string | null;
};

export type InvoicesData = {
  accountId: string;
  invoices: InvoiceRow[];
  marketplace: string;
  currentPage: number;
  totalPages: number;
};

function Invoices(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: canconSubscriptions, isLoading: loadingListSubscriptions } =
    useListSubscriptions();
  console.log(location.search);
  const invoicesQuery = useInvoicesQuery(location.search);
  const {
    accountId = "",
    invoices = [],
    currentPage = 1,
    totalPages = 1,
  } = invoicesQuery.data ?? {};
  const marketplace =
    new URLSearchParams(location.search).get("marketplace") ?? "";
  const [isModalOpen, setIsModalOpen] = useState(false);

  const organizationInvoicesQuery = useListOrganizationInvoices();

  const changeMarketplace = (value: string) => {
    const search = new URLSearchParams(location.search);
    if (value) search.set("marketplace", value);
    else search.delete("marketplace");
    search.delete("page");
    const query = search.toString();
    navigate(`${location.pathname}${query ? `?${query}` : ""}`);
  };

  const pageHref = (page: number) => {
    const search = new URLSearchParams(location.search);
    search.set("page", String(page));
    return `${location.pathname}?${search.toString()}`;
  };

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
              disabled={!accountId || invoicesQuery.isPending}
              onClick={() => setIsModalOpen(true)}
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
            {invoicesQuery.isPending ? (
              <p role="status">Loading invoices...</p>
            ) : invoicesQuery.isError ? (
              <div className="p-notification--negative" role="alert">
                <div className="p-notification__content">
                  <p className="p-notification__message">
                    Unable to load invoices. Please try again later.
                  </p>
                  <button type="button" onClick={() => invoicesQuery.refetch()}>
                    Retry
                  </button>
                </div>
              </div>
            ) : invoices.length ? (
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
      {isModalOpen && loadingListSubscriptions && (
        <div className="loading-indicator">Loading subscriptions...</div>
      )}
      {isModalOpen && (
        <>
          {(canconSubscriptions?.paginationMetadata?.totalRecords || 0) ===
          0 ? (
            <EditBillingDetailsModal
              accountId={accountId}
              onClose={() => setIsModalOpen(false)}
            />
          ) : (
            <NewEditBillingDetails
              accountId={accountId}
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </>
      )}
    </>
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
