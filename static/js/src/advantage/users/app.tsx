import React from "react";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Integrations } from "@sentry/tracing";
import { ReactQueryDevtools } from "react-query/devtools";

import AccountUsers from "./AccountUsers";
import { FetchError } from "./api";
import { errorMessages, getErrorMessage } from "./utils";
import useRequestAccountUsers from "./hooks/useRequestAccountUsers";

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
          (error as FetchError)?.response?.status === 401 ||
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
  const {
    isLoading: isLoadingAccountUsers,
    isError: isAccountUsersError,
    isSuccess: isAccountUsersSuccess,
    data: accountUsers,
    error: accountUsersError,
  } = useRequestAccountUsers();

  if (isAccountUsersError) {
    const errorMessage = getErrorMessage(accountUsersError);
    if (errorMessage === errorMessages.unknown) {
      Sentry.captureException(accountUsersError);
    }
    setErrorMessage(errorMessage);
  }

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
            {isAccountUsersError ? (
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
            {isLoadingAccountUsers ? (
              <div className="u-no-margin--bottom p-card">
                <div className="p-card__content">
                  <span className="p-text--default">
                    <i className="p-icon--spinner u-animation--spin"></i>
                  </span>{" "}
                  Loading…
                </div>
              </div>
            ) : null}
            {isAccountUsersSuccess && accountUsers ? (
              <AccountUsers
                organisationName={accountUsers.organisationName}
                users={accountUsers.users}
                accountId={accountUsers.accountId}
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
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  );
}

ReactDOM.render(
  <App />,
  document.getElementById("advantage-account-users-app")
);
