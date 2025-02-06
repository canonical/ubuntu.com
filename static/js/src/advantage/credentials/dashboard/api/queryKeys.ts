export const getBulkBadgesCredly = () => ["credlyIssuedBadgesBulk"];
export const postIssueCredlyBadge = () => ["credlyIssueBadge"];
export const getUserPermissionsKey = () => ["userPermissions"];
export const getUserBansKey = () => ["userBans"];
export const ensureUserBanKey = (email: string) => ["userBans", email];
export const cancelScheduledExamKey = (reservationId: string) => [
  "cancelScheduledExamKey",
  reservationId,
];
export const getUpcomingExamsKey = (page: number) => ["upcomingExams", page];
