import React from "react";
import { useState, useMemo } from "react";
import { Tabs } from "@canonical/react-components";
import CertificationIssued from "../CertificationsIssued/CertificationIssued";

const Credly = () => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = useMemo(() => {
    return [
      {
        active: activeTab === 0,
        label: "Certifications Issued",
        onClick: () => setActiveTab(0),
      },
      {
        active: activeTab === 1,
        label: "Badge Tracking & Release",
        onClick: () => setActiveTab(1),
      },
    ];
  }, [activeTab]);

  return (
    <>
      <Tabs links={tabs} />
      {activeTab === 0 && <CertificationIssued />}
    </>
  );
};

export default Credly;
