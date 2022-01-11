import React from "react";
import CubeHeader from "../CubeHeader";
import MicrocertificationsTable from "../MicrocertificationsTable";
import MicrocertsFooter from "../MicrocertsFooter";
import useMicrocertsData from "../../hooks/useMicrocertsData";

const MicrocertsContainer = () => {
  const {
    edxUser,
    edxRegisterUrl,
    modules,
    studyLabs,
    certifiedBadge,
    hasEnrollments,
    isLoading,
    isError,
  } = useMicrocertsData();

  return (
    <>
      <CubeHeader
        modules={modules}
        certifiedBadge={certifiedBadge}
        hasEnrollments={hasEnrollments}
        isLoading={isLoading}
      />
      <MicrocertificationsTable
        modules={modules}
        studyLabs={studyLabs}
        certifiedBadge={certifiedBadge}
        isLoading={isLoading}
        isError={isError}
      />
      <MicrocertsFooter
        edxUser={edxUser}
        edxRegisterUrl={edxRegisterUrl}
        hasEnrollments={hasEnrollments}
        isLoading={isLoading}
      />
    </>
  );
};

export default MicrocertsContainer;
