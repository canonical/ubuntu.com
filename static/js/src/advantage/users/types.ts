export type UserRole = "admin" | "technical" | "billing";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLoginAt: string;
};

export type Users = User[];

export type OrganisationName = string;

export type AccountUsersData = {
  organisationName: OrganisationName;
  users: Users;
};

export type HandleNewUserSubmit = (string: string) => Promise<any>;
