import { useMemo } from "react";
import { Tabs } from "@canonical/react-components";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const Credly = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tabs = useMemo(() => {
    return [
      {
        active: location.pathname === "/credly/issued",
        label: "Certifications Issued",
        onClick: () => {
          navigate("/credly/issued");
        },
      },
      {
        active: location.pathname === "/credly/badge-tracking",
        label: "Badge Tracking & Release",
        onClick: () => {
          navigate("/credly/badge-tracking");
        },
      },
    ];
  }, [location.pathname]);

  return (
    <>
      <Tabs links={tabs} />
      <Outlet />
    </>
  );
};

export default Credly;
