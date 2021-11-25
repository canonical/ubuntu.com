import React from "react";
import { Card, MainTable } from "@canonical/react-components";
import { useQuery } from "react-query";

type Props = {
  courses: string[];
};

const ExamAttemptsTable = ({ courses }: Props) => {
  const params = new URLSearchParams(window.location.search);
  const testBackend = params.get("test_backend") === "true";

  const { data: attempts } = useQuery(
    "attempts",
    async () => {
      const response = await fetch(
        `/cube/exam-attempts.json?course_id=${courses.join(",")}` +
          (testBackend ? "&test_backend=true" : "")
      );
      const responseData = await response.json();

      if (responseData.errors) {
        throw new Error(responseData.errors);
      }

      return responseData;
    },
    { enabled: courses && courses.length > 0 }
  );

  console.log("!!! attempts: ", attempts);

  return (
    <Card title="Exam attempts">
      {attempts && (
        <MainTable
          headers={[
            { content: "Course ID", sortKey: "course_id" },
            { content: "Start", sortKey: "started_at" },
            { content: "End", sortKey: "completed_at" },
            { content: "Status", sortKey: "status" },
          ]}
          rows={attempts.map(
            ({ course_id, started_at, completed_at, status }) => ({
              columns: [
                { content: course_id },
                { content: started_at },
                { content: completed_at },
                { content: status },
              ],
              sortData: {
                course_id: course_id,
                started_at: new Date(started_at),
                completed_at: new Date(completed_at),
                status: status,
              },
            })
          )}
          sortable
          paginate={20}
        />
      )}
    </Card>
  );
};

export default ExamAttemptsTable;
