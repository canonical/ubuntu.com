import { AccountUsersApiResponse, AccountUsersData, UserRole } from "./types";

const parseAccountsResponse = (
  response: AccountUsersApiResponse
): AccountUsersData => ({
  accountId: response.account_id,
  organisationName: response.name,
  users: response.users.map((user) => ({
    name: user.name,
    email: user.email,
    role: user.user_role_on_account,
    lastLoginAt: user.last_login_at,
  })),
});

const requestAccountUsers = (): Promise<AccountUsersData> =>
  fetchJSON(`/pro/account-users${window.location.search}`, {
    cache: "no-store",
  }).then((response) =>
    parseAccountsResponse(response as AccountUsersApiResponse)
  );

const accountUserRequestInit: RequestInit = {
  cache: "no-store",
  credentials: "include",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

const getAccountUserRequestUrl = (accountId: string, urlParams: string) =>
  `/pro/accounts/${accountId}/user${urlParams}`;

export interface FetchError extends Error {
  response?: Response;
}

const handleResponse = async (response: Response): Promise<unknown> => {
  const responseJson = await response.json();

  if (!response.ok) {
    const error: FetchError = new Error(
      responseJson.error || responseJson.errors || response.statusText
    );
    error.response = response;
    throw error;
  }
  return responseJson;
};

const fetchJSON = (input: RequestInfo, init?: RequestInit) =>
  fetch(input, init)
    .catch(() => {
      throw new Error("network failure");
    })
    .then(handleResponse);

const requestAddUser = ({
  accountId,
  email,
  name,
  role,
}: {
  accountId: string;
  email: string;
  name: string;
  role: UserRole;
}) =>
  fetchJSON(getAccountUserRequestUrl(accountId, window.location.search), {
    ...accountUserRequestInit,
    method: "POST",
    body: JSON.stringify({ email, name, role }),
  });

const requestUpdateUser = ({
  accountId,
  email,
  role,
}: {
  accountId: string;
  email: string;
  role: UserRole;
}) =>
  fetchJSON(getAccountUserRequestUrl(accountId, window.location.search), {
    ...accountUserRequestInit,
    method: "PUT",
    body: JSON.stringify({ email, role }),
  });

const requestDeleteUser = async ({
  accountId,
  email,
}: {
  accountId: string;
  email: string;
}) =>
  fetchJSON(getAccountUserRequestUrl(accountId, window.location.search), {
    ...accountUserRequestInit,
    method: "DELETE",
    body: JSON.stringify({ email }),
  });

export {
  requestAccountUsers,
  requestAddUser,
  requestUpdateUser,
  requestDeleteUser,
};
