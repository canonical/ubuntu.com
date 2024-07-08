import React from "react";
import { useState, useMemo } from "react";
import {
  MainTable,
  Pagination,
  Spinner,
  Notification,
} from "@canonical/react-components";
import { useQuery } from "react-query";
import { getUpcomingExams } from "../../api/keys";
import { sortFunction } from "../../utils";

interface IProps {
  hidden: boolean;
}

const UpcomingExams = (props: IProps) => {
  const { hidden } = props;
  const [page, setPage] = useState(1);
  const { isLoading, isError, data, isFetching } = useQuery(
    ["upcomingExams", page],
    () => getUpcomingExams(page),
    { keepPreviousData: true }
  );

  const uppercaseFirstCharacter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const currentRows = useMemo(() => {
    if (data && !data?.error) {
      return data.assessment_reservations.map((exam: any) => ({
        key: exam.id,
        columns: [
          { content: exam.id },
          { content: exam.user.email },
          { content: uppercaseFirstCharacter(exam.state) },
          {
            content: new Date(exam.starts_at).toLocaleString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            }),
          },
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
        Something went wrong. Please try again later.
      </Notification>
    );
  }

  if (data) {
    return (
      <>
        <MainTable
          sortFunction={sortFunction}
          // sortable
          headers={[
            { content: "ID", sortKey: "id" },
            { content: "User", sortKey: "user" },
            { content: "Exam State", sortKey: "state" },
            { content: "Starting Time", sortKey: "startsAt" },
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

export default UpcomingExams;
