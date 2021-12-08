import React from "react";
import { Col, Row } from "@canonical/react-components";
import CertificationsTable from "../CertificationsTable";
import EnrollmentsChart from "../EnrollmentsChart";
import EnrollmentsTable from "../EnrollmentsTable";
import ExamAttemptsTable from "../ExamAttemptsTable";
import GradesTable from "../GradesTable";
import useCourses from "../../hooks/useCourses";

const Dashboard = () => {
  const { courses } = useCourses();

  return (
    <section className="p-strip">
      <Row>
        <Col size={12}>
          <>
            <h1>CUBE Dashboard</h1>
            <EnrollmentsChart courses={courses} />
            <EnrollmentsTable courses={courses} />
            <ExamAttemptsTable courses={courses} />
            <GradesTable courses={courses} />
            <CertificationsTable />
          </>
        </Col>
      </Row>
    </section>
  );
};

export default Dashboard;
