export type UserRole = "admin" | "technical" | "billing";

export type User = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  lastLoginAt: string | null;
};

export type Users = User[];

export type OrganisationName = string;

export type AccountUsersData = {
  organisationName: OrganisationName;
  users: Users;
};

export interface NewUserValues {
  email: string;
  role: UserRole;
  name: string;
}

export type HandleNewUserSubmit = (values: NewUserValues) => Promise<any>;
