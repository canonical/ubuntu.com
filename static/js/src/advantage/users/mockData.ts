import { User, AccountUsersData } from "./types";

export const mockUser: User = {
  email: "philip.p@ecorp.com",
  name: "Philip",
  role: "admin",
  lastLoginAt: "2021-06-10T09:05:00Z",
};

const organisationName = "ECorp";

export const mockData: AccountUsersData = {
  organisationName,
  users: [
    mockUser,
    {
      ...mockUser,
      name: "Karen",
      email: "karen@ecorp.com",
      role: "billing",
    },
    {
      ...mockUser,
      name: "Angela",
      email: "angela@ecorp.com",
      role: "technical",
    },
  ],
};
