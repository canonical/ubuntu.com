export type UserRole = "admin" | "technical" | "billing";

export type User = {
  name: string | null;
  email: string;
  role: UserRole;
  lastLoginAt: string | null;
};

export type Users = User[];

export type OrganisationName = string;

export type AccountUsersApiResponse = {
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

export type AccountUsersData = {
  accountId: string;
  organisationName: OrganisationName;
  users: Users;
};

export interface NewUserValues {
  email: string;
  role: UserRole;
  name: string;
}

export type HandleNewUserSubmit = (values: NewUserValues) => Promise<any>;
