export enum Status {
  Enrolled = "enrolled",
  NotEnrolled = "not-enrolled",
  Passed = "passed",
  Failed = "failed",
  InProgress = "in-progress",
}

export type Module = {
  name: string;
  badgeURL: string;
  topics: string[];
  studyLabURL: string;
  takeURL: string;
  status: Status;
  productListingId: string;
};
