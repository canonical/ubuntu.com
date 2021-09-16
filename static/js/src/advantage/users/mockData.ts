import { User, AccountUsersData } from "./types";

export const mockUser: User = {
  id: "1",
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
      id: "2",
      name: "Karen",
      email: "karen@ecorp.com",
      role: "billing",
    },
    {
      ...mockUser,
      id: "3",
      name: "Angela",
      email: "angela@ecorp.com",
      role: "technical",
    },
  ],
};
