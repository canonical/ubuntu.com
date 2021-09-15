import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import AccountUsers from "./AccountUsers";
import { requestAccountUsers } from "./api";

const oneHour = 1000 * 60 * 60;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: oneHour,
      retryOnMount: false,
    },
  },
});

const AccountUsersWithQuery = () => {
  const { status, data } = useQuery("accountUsers", async () => {
    const res = await requestAccountUsers();
    return res;
  });
  return (
    <div>
      <div className="p-strip">
        <div className="row">
          <div className="col-12">
            <h1>Account users</h1>
          </div>
        </div>
      </div>
      {status === "success" && data ? (
        <AccountUsers
          organisationName={data.organisationName}
          users={data.users}
          accountId={data.accountId}
        />
      ) : null}
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AccountUsersWithQuery />
    </QueryClientProvider>
  );
}

ReactDOM.render(
  <App />,
  document.getElementById("advantage-account-users-app")
);
