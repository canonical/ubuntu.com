import { UserRole, Users } from "./types";

type AccountUsersReponse = {
  account_id: string;
  name: string;
  users: {
    id: string;
    name: string | null;
    email: string;
    user_role_on_account: "admin" | "technical" | "billing";
    last_login_at: string | null;
  }[];
};

type ParsedAccountUsersResponse = {
  accountId: string;
  organisationName: string;
  users: Users;
};

const parseAccountsResponse = (
  response: AccountUsersReponse
): ParsedAccountUsersResponse => ({
  accountId: response.account_id,
  organisationName: response.name,
  users: response.users.map((user) => ({
    id: user.email,
    name: user.name,
    email: user.email,
    role: user.user_role_on_account,
    lastLoginAt: user.last_login_at,
  })),
});

const requestAccountUsers = (): Promise<ParsedAccountUsersResponse> =>
  fetchJSON(`/advantage/account-users${window.location.search}`, {
    cache: "no-store",
  }).then((response) => parseAccountsResponse(response as AccountUsersReponse));

const accountUserRequestInit: RequestInit = {
  cache: "no-store",
  credentials: "include",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

const getAccountUserRequestUrl = (accountId: string, urlParams: string) =>
  `/advantage/accounts/${accountId}/user${urlParams}`;

const handleResponse = async (response: Response): Promise<unknown> => {
  const responseJson = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.error || responseJson.errors);
  }
  return responseJson;
};

const fetchJSON = async (input: RequestInfo, init?: RequestInit) =>
  fetch(input, init).then(handleResponse);

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
