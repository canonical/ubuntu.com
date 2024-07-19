import React from "react";
import { useState, useMemo } from "react";
import {
  MainTable,
  Pagination,
  Spinner,
  Notification,
} from "@canonical/react-components";
import { useQuery } from "react-query";
import { getExamResults } from "../../api/keys";
import { sortFunction } from "../../utils";

interface IProps {
  hidden: boolean;
}

const ExamResults = (props: IProps) => {
  const { hidden } = props;
  const [page, setPage] = useState(1);
  const { isLoading, isError, data, isFetching } = useQuery(
    ["examResults", page, "finalized"],
    () => getExamResults(page, "finalized"),
    { keepPreviousData: true }
  );

  const currentRows = useMemo(() => {
    if (data && !data?.error) {
      return data.results.map((exam: any) => ({
        key: exam.id,
        columns: [
          { content: exam.id },
          { content: exam.user_email },
          { content: exam.score },
          { content: exam.duration_in_minutes },
        ],
      }));
    }
    return [];
  }, [data]);

  const paginationMeta = useMemo(() => {
    if (data && !data?.error) {
      const { meta } = data;
      const totalPages = meta.total_pages;
      const currentPage = totalPages - meta.current_page + 1;
      return {
        totalPages,
        currentPage,
        nextPage: currentPage < totalPages ? currentPage + 1 : null,
        previousPage: currentPage > 1 ? currentPage - 1 : null,
        totalItems: meta.total_count,
      };
    }
    return {};
  }, [data, page]);

  const handleLoadPage = (pageNumber: number) => {
    if (isFetching) {
      return;
    }
    setPage(pageNumber);
  };

  if (hidden) {
    return null;
  }

  if (isLoading) {
    return <Spinner text="Loading..." />;
  }

  if (isError) {
    return (
      <Notification severity="negative" title="Error">
        {data?.error || "An error occurred while fetching exam results."}
      </Notification>
    );
  }

  if (data) {
    return (
      <>
        <MainTable
          sortFunction={sortFunction}
          headers={[
            { content: "ID", sortKey: "id" },
            { content: "User", sortKey: "user_email" },
            { content: "Score", sortKey: "score" },
            { content: "Time Spent", sortKey: "duration_in_minutes" },
          ]}
          paginate={10}
          rows={currentRows}
        />
        {paginationMeta && (
          <Pagination
            currentPage={paginationMeta?.currentPage ?? 1}
            itemsPerPage={10}
            paginate={handleLoadPage}
            totalItems={paginationMeta.totalItems}
            disabled={isFetching}
          />
        )}
      </>
    );
  }

  return <></>;
};

export default ExamResults;
