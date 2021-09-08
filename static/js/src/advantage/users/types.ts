export type User = {
  email: string;
  role: "Admin" | "Technical" | "Billing";
  createdAt: string;
  lastLoginAt: string;
};

export type Users = User[];

export type OrganisationName = string;

export type AccountUsersData = {
  organisationName: OrganisationName;
  users: Users;
};
