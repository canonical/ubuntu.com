import React from "react";
import { Card, MainTable } from "@canonical/react-components";
import { useQuery } from "react-query";
import DownloadCSVButton from "../DownloadCSVButton";

type Props = {
  courses: string[];
};

const EnrollmentsTable = ({ courses }: Props) => {
  const params = new URLSearchParams(window.location.search);
  const testBackend = params.get("test_backend") === "true";
  const encodedCoursesParam = courses
    .map((course) => encodeURIComponent(course))
    .join(",");

  const { data: enrollments, isLoading } = useQuery(
    "enrollments",
    async () => {
      const response = await fetch(
        encodeURI(
          `/cube/enrollments.json?course_id=${encodedCoursesParam}` +
            (testBackend ? "&test_backend=true" : "")
        )
      );
      const responseData = await response.json();

      if (responseData.errors) {
        throw new Error(responseData.errors);
      }

      return responseData;
    },
    { enabled: courses && courses.length > 0 }
  );

  const rows = enrollments ? enrollments : [];

  return (
    <Card title="Enrollments">
      <DownloadCSVButton data={rows} />
      <MainTable
        headers={[
          { content: "Course ID", sortKey: "course_id" },
          { content: "Created", sortKey: "created" },
          { content: "Active", sortKey: "is_active" },
        ]}
        rows={rows.map(({ course_id, created, is_active }) => ({
          columns: [
            { content: course_id },
            { content: created },
            { content: is_active ? "Yes" : "No" },
          ],
          sortData: {
            course_id: course_id,
            created: new Date(created),
            is_active: is_active,
          },
        }))}
        sortable
        paginate={20}
        emptyStateMsg={
          isLoading ? (
            <i className="p-icon--spinner u-animation--spin"></i>
          ) : (
            <i>No data could be fetched</i>
          )
        }
      />
    </Card>
  );
};

export default EnrollmentsTable;
