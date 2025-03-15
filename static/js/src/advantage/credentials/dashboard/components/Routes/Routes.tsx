import { Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import UpcomingExams from "../UpcomingExams/UpcomingExams";
import ExamResults from "../ExamResults/ExamResults";
import KeysList from "../KeysList/KeysList";
import TestTakers from "../TestTakers/TestTakers";
import CertificationIssued from "../CertificationsIssued/CertificationIssued";
import BadgeTracking from "../BadgeTracking/BadgeTracking";
import Exams from "../../routes/Exams";
import Credly from "../../routes/Credly";
import Keys from "../../routes/Keys";
import UserBans from "../UserBans/UserBans";
import UserBanForm from "../UserBanForm/UserBanForm";
import { getUserPermissions } from "../../api/queryFns";
import { getUserPermissionsKey } from "../../api/queryKeys";
import { useQuery } from "@tanstack/react-query";

const Routes = () => {
  const { data: permissions } = useQuery({
    queryKey: getUserPermissionsKey(),
    queryFn: getUserPermissions,
  });

  return (
    <RouterRoutes>
      <Route path="/" element={<Navigate to="/exams/upcoming" />} />
      <Route path="/exams" element={<Exams />}>
        <Route path="/exams/upcoming" element={<UpcomingExams />} />
        {permissions?.is_credentials_admin && (
          <Route path="/exams/results" element={<ExamResults />} />
        )}
      </Route>
      {permissions?.is_credentials_admin && (
        <>
          <Route path="/users/user-bans" element={<UserBans />} />
          <Route path="/users/ensure-ban" element={<UserBanForm />} />
        </>
      )}
      <Route path="/keys" element={<Keys />}>
        <Route path="/keys/list" element={<KeysList />} />
      </Route>
      <Route path="/credly" element={<Credly />}>
        <Route path="/credly/issued" element={<CertificationIssued />} />
        <Route path="/credly/badge-tracking" element={<BadgeTracking />} />
      </Route>
      <Route path="/test-taker-stats" element={<TestTakers />} />
    </RouterRoutes>
  );
};

export default Routes;
