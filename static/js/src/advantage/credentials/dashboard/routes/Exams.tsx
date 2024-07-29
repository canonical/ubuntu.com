import React, { useState, useMemo } from "react";
import { Tabs } from "@canonical/react-components";
import { Outlet, redirect, useLocation, useNavigate } from "react-router-dom";

const Exams = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tabs = useMemo(() => {
    return [
      {
        active: location.pathname === "/exams/upcoming",
        label: "Upcoming Exams",
        onClick: () => {
          navigate("/exams/upcoming");
        },
      },
      {
        active: location.pathname === "/exams/results",
        label: "Exam Results",
        onClick: () => {
          navigate("/exams/results");
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

export default Exams;
