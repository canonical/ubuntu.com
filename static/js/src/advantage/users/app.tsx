import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import AccountUsers from "./AccountUsers";
import { Users } from "./types";

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

type AccountUsersReponse = {
  account_id: string;
  users: {
    id: string;
    name: string;
    email: string;
    user_role_on_account: "admin" | "technical" | "billing";
    last_login_at: string;
  }[];
};

type ParsedAccountUsersResponse = {
  accountId: string;
  users: Users;
};

const parseAccountsResponse = (
  response: AccountUsersReponse
): ParsedAccountUsersResponse => ({
  accountId: response.account_id,
  users: response.users.map((user) => ({
    id: user.email,
    name: user.name,
    email: user.email,
    role: user.user_role_on_account,
    lastLoginAt: user.last_login_at,
  })),
});

const requestAccountUsers = async (): Promise<ParsedAccountUsersResponse> => {
  const response = await fetch(
    `/advantage/account-users${window.location.search}`,
    {
      cache: "no-store",
    }
  );

  return response.json().then(parseAccountsResponse);
};

// const requestAddUser = () => {};
// const requestUpdateUser = () => {};
// const requestDeleteUser = () => {};

const AccountUsersWithQuery = () => {
  const { isSuccess, data } = useQuery("accountUsers", async () => {
    const res = await requestAccountUsers();
    return res;
  });
  return isSuccess && data ? (
    <AccountUsers organisationName={data.accountId} users={data.users} />
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
