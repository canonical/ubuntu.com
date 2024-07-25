import React, { useState, useMemo } from "react";
import { Tabs } from "@canonical/react-components";
import UpcomingExams from "../components/UpcomingExams/UpcomingExams";
import ExamResults from "../components/ExamResults/ExamResults";

const Exams = () => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = useMemo(() => {
    return [
      {
        active: activeTab === 0,
        label: "Upcoming Exams",
        onClick: () => setActiveTab(0),
      },
      {
        active: activeTab === 1,
        label: "Exam Results",
        onClick: () => setActiveTab(1),
      },
    ];
  }, [activeTab]);
  return (
    <>
      <Tabs links={tabs} />
      <UpcomingExams hidden={activeTab !== 0} />
      <ExamResults hidden={activeTab !== 1} />
    </>
  );
};

export default Exams;
