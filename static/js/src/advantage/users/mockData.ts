import { User, AccountUsersData } from "./types";

export const mockUser: User = {
  id: "1",
  email: "philip.p@ecorp.com",
  role: "Admin",
  createdAt: "2020-01-10T12:00:00Z",
  lastLoginAt: "2021-06-10T09:05:00Z",
};

const organisationName = "ECorp";

export const mockData: AccountUsersData = {
  organisationName,
  users: [mockUser, { ...mockUser, id: "2" }],
};
