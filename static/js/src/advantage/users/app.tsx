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
  const { isSuccess, data } = useQuery("accountUsers", async () => {
    const res = await requestAccountUsers();
    return res;
  });
  return isSuccess && data ? (
    <AccountUsers
      organisationName={data.accountId}
      users={data.users}
      accountId={data.accountId}
    />
  ) : null;
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
