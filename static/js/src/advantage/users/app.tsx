import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { Integrations } from "@sentry/tracing";

import AccountUsers from "./AccountUsers";
import { FetchError, requestAccountUsers } from "./api";
import { errorMessages, getErrorMessage } from "./utils";

const oneHour = 1000 * 60 * 60;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      staleTime: oneHour,
      retryOnMount: false,
      retry: (failureCount, error) => {
        if (
          (error as FetchError)?.response?.status === 404 ||
          failureCount >= 3
        ) {
          return false;
        }
        return true;
      },
    },
  },
});

Sentry.init({
  dsn: "https://0293bb7fc3104e56bafd2422e155790c@sentry.is.canonical.com//13",
  integrations: [
    new Integrations.BrowserTracing({
      tracingOrigins: ["ubuntu.com"],
    }),
  ],
  allowUrls: ["ubuntu.com"],
});

const AccountUsersWithQuery = () => {
  const [errorMessage, setErrorMessage] = React.useState("");
  const { status, data } = useQuery(
    "accountUsers",
    async () => {
      const res = await requestAccountUsers();
      return res;
    },
    {
      onError: (error: FetchError) => {
        const errorMessage = getErrorMessage(error);
        if (errorMessage === errorMessages.unknown) {
          Sentry.captureException(error);
        }
        setErrorMessage(errorMessage);
      },
    }
  );

  return (
    <div>
      <div className="p-strip">
        <div className="row">
          <div className="col-12">
            <h1>Account users</h1>
          </div>
        </div>
      </div>
      <section className="p-strip u-no-padding--top">
        <div className="row">
          <div className="col-12">
            {status === "error" ? (
              <div className="row">
                <div className="col-6">
                  <div className={`p-notification--negative`}>
                    <div className="p-notification__content">
                      <h5 className="p-notification__title">Error</h5>
                      <p className="p-notification__message" role="alert">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            {status === "loading" ? (
              <div className="u-no-margin--bottom p-card">
                <div className="p-card__content">
                  <span className="p-text--default">
                    <i className="p-icon--spinner u-animation--spin"></i>
                  </span>{" "}
                  Loading…
                </div>
              </div>
            ) : null}
            {status === "success" && data ? (
              <AccountUsers
                organisationName={data.organisationName}
                users={data.users}
                accountId={data.accountId}
              />
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
};

function App() {
  return (
    <Sentry.ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AccountUsersWithQuery />
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  );
}

ReactDOM.render(
  <App />,
  document.getElementById("advantage-account-users-app")
);
