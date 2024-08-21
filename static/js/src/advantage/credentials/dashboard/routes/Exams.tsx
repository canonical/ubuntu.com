import { useMemo } from "react";
import { Tabs } from "@canonical/react-components";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserPermissions } from "../api/queryFns";
import { getUserPermissionsKey } from "../api/queryKeys";

const Exams = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: permissions } = useQuery({
    queryKey: getUserPermissionsKey(),
    queryFn: getUserPermissions,
  });
  const tabs = useMemo(() => {
    const is_credentials_admin = permissions?.is_credentials_admin;
    const currTabs = [
      {
        active: location.pathname === "/exams/upcoming",
        label: "Upcoming Exams",
        onClick: () => {
          navigate("/exams/upcoming");
        },
      },
    ];

    if (is_credentials_admin) {
      currTabs.push({
        active: location.pathname === "/exams/results",
        label: "Exam Results",
        onClick: () => {
          navigate("/exams/results");
        },
      });
    }
    return currTabs;
  }, [location.pathname, permissions]);

  return (
    <>
      <Tabs links={tabs} />
      <Outlet />
    </>
  );
};

export default Exams;
