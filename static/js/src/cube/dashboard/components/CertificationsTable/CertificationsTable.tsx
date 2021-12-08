import React from "react";
import { Card, MainTable } from "@canonical/react-components";
import DownloadCSVButton from "../DownloadCSVButton";
import useCertifications from "../../hooks/useCertifications";

const CertificationsTable = () => {
  const { certifications, isLoading } = useCertifications({
    usernames: ["mrgnr", "krenshaw", "LexJoy", "crenguta", "albertkoltester2"],
  });
  const rows = certifications ? certifications : [];

  return (
    <Card title="Certifications">
      <DownloadCSVButton data={rows} />
      <MainTable
        headers={[
          { content: "Course ID", sortKey: "course_id" },
          { content: "Created", sortKey: "created" },
          { content: "Passing", sortKey: "is_passing" },
          { content: "Grade", sortKey: "grade" },
          { content: "Username", sortKey: "username" },
        ]}
        rows={rows.map(
          ({ course_id, created, is_passing, grade, username }) => ({
            columns: [
              { content: course_id },
              { content: created },
              { content: String(is_passing) },
              { content: grade },
              { content: username },
            ],
            sortData: {
              course_id: course_id,
              created: new Date(created),
              is_passing: Boolean(is_passing),
              grade: grade,
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

export default CertificationsTable;
