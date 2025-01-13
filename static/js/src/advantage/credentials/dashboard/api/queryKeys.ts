export const getBulkBadgesCredly = () => ["credlyIssuedBadgesBulk"];
export const postIssueCredlyBadge = () => ["credlyIssueBadge"];
export const getUserPermissionsKey = () => ["userPermissions"];
export const cancelScheduledExamKey = (reservationId: string) => [
  "cancelScheduledExamKey",
  reservationId,
];
export const getUpcomingExamsKey = (page: number) => ["upcomingExams", page];
