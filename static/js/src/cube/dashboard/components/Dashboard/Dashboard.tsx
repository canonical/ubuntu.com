import React from "react";
import { Col, Row } from "@canonical/react-components";
import { useQuery } from "react-query";
import EnrollmentsChart from "../EnrollmentsChart";
import ExamAttemptsChart from "../ExamAttemptsChart";

const Dashboard = () => {
  const { data } = useQuery("courses", async () => {
    const response = await fetch("/cube/courses.json");
    const responseData = await response.json();

    if (responseData.errors) {
      throw new Error(responseData.errors);
    }

    return responseData;
  });

  const courses = data ? data.map((course) => course["id"]) : [];

  return (
    <section className="p-strip">
      <Row>
        <Col size={12}>
          <>
            <h1>CUBE Dashboard</h1>
            <EnrollmentsChart courses={courses} />
            <ExamAttemptsChart courses={courses} />
          </>
        </Col>
      </Row>
    </section>
  );
};

export default Dashboard;
