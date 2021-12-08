import React from "react";
import { Card, MainTable } from "@canonical/react-components";
import { useQuery } from "react-query";
import DownloadCSVButton from "../DownloadCSVButton";

type Props = {
  courses: string[];
};

const GradesTable = ({ courses }: Props) => {
  const params = new URLSearchParams(window.location.search);
  const testBackend = params.get("test_backend") === "true";
  const encodedCoursesParam = courses
    .map((course) => encodeURIComponent(course))
    .join(",");

  //const encodedCoursesParam = encodeURIComponent(courses[0]);
  //const encodedCoursesParam = encodeURIComponent("course-v1:CUBE+sysarch+2020");

  const { data: grades, isLoading } = useQuery(
    "grades",
    async () => {
      const response = await fetch(
        encodeURI(
          `/cube/grades.json?course_id=${encodedCoursesParam}` +
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

  if (grades) {
    console.log("!!! grades: ", grades);
  }

  const rows = grades ? grades : [];

  return (
    <Card title="Grades">
      <DownloadCSVButton data={rows} />
      <MainTable
        headers={[
          { content: "Course ID", sortKey: "course_id" },
          { content: "Passed", sortKey: "passed" },
          { content: "Percent", sortKey: "percent" },
          { content: "Letter grade", sortKey: "letter_grade" },
          { content: "Username", sortKey: "username" },
        ]}
        rows={rows.map(
          ({ course_id, passed, percent, letter_grade, username }) => ({
            columns: [
              { content: course_id },
              { content: passed ? "Yes" : "No" },
              { content: percent },
              { content: letter_grade },
              { content: username },
            ],
            sortData: {
              course_id: course_id,
              passed: passed,
              percent: percent,
              letter_grade: letter_grade,
              username: username,
            },
          })
        )}
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

export default GradesTable;
