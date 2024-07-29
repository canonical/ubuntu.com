import React from "react";
import { useState, useMemo, useEffect } from "react";
import {
  Pagination,
  Spinner,
  Notification,
  ModularTable,
  Button,
} from "@canonical/react-components";
import { useQuery, useQueryClient } from "react-query";
import { getExamResults } from "../../api/keys";
import { ExamResultsMeta, ExamResultsTA } from "../../utils/types";

type APIResponse = {
  results: ExamResultsTA[];
  meta: ExamResultsMeta;
  error?: string;
};

const ExamResults = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [fetchedPages] = useState(new Set([1]));
  const [cachedData, setCachedData] = useState<Record<number, APIResponse>>({});
  const { isLoading, isError, data, isFetching } = useQuery(
    ["examResults", page, "finalized"],
    () => getExamResults(page, "finalized"),
    {
      keepPreviousData: true,
      onSuccess: (newData) => {
        if (newData && newData.results) {
          setCachedData((prev) => ({
            ...prev,
            [page]: newData,
          }));
        }
      },
    }
  );

  useEffect(() => {
    const queryData = queryClient.getQueryData<APIResponse>([
      "examResults",
      page,
      "finalized",
    ]);

    if (queryData) {
      setCachedData((prev) => ({
        ...prev,
        [page]: queryData,
      }));
    }
  }, [page]);

  const handleIssueBadge = async (examId: number) => {};

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
        sortType: "basic",
        Cell: (props: any) =>
          props.row.depth === 0 ? (
            <strong>{props.value}</strong>
          ) : (
            <small style={{ paddingLeft: "8px" }}>{props.value}</small>
          ),
      },
      {
        Header: "User Email",
        accessor: "user_email",
        sortType: "basic",
        Cell: (props: any) =>
          props.row.depth === 0 ? (
            <strong>{props.value}</strong>
          ) : (
            <small>{props.value}</small>
          ),
      },
      {
        Header: "Score",
        accessor: "score",
        sortType: "basic",
        Cell: (props: any) =>
          props.row.depth === 0 ? (
            <strong>{props.value.toFixed(2)}</strong>
          ) : (
            <small>{props.value.toFixed(2)}</small>
          ),
      },
      {
        Header: "Time spent (minutes)",
        accessor: "duration_in_minutes",
        sortType: "basic",
        Cell: (props: any) => {
          return props.row.depth === 0 ? <></> : <small>{props.value}</small>;
        },
      },
      {
        Header: "",
        accessor: "action",
        Cell: (props: any) => {
          return props.row.depth === 0 ? (
            <></>
          ) : (
            <Button disabled dense>
              Issue Badge
            </Button>
          );
        },
      },
    ],
    []
  );

  const flatData = useMemo(() => {
    const data = cachedData ? Object.values(cachedData).flat() : [];
    return data
      .sort((a, b) => b.meta.current_page - a.meta.current_page)
      .map((page) => page.results)
      .flat();
  }, [cachedData]);

  const uniqueGroupKeys = useMemo(() => {
    if (data && data?.results) {
      return [
        ...new Set(flatData.map((res: ExamResultsTA) => res.ability_screen.id)),
      ];
    }
    return [];
  }, [data, flatData]);

  const getSubRows = (key: number | string) => {
    const matches: ExamResultsTA[] =
      flatData.filter((res: ExamResultsTA) => res.ability_screen.id === key) ||
      [];
    return matches;
  };

  const getExam = (screenId: number): ExamResultsTA | null => {
    return (
      flatData.find(
        (res: ExamResultsTA) => res.ability_screen.id === screenId
      ) || null
    );
  };

  const currentRows = useMemo(() => {
    if (data && data?.results) {
      return (uniqueGroupKeys as number[]).map((screenId) => {
        const exam = getExam(screenId);
        const subRows = getSubRows(screenId);
        return {
          id: exam?.ability_screen?.display_name || "N/A",
          score: exam?.ability_screen.cutoff_score || 0,
          subRows,
        };
      });
    }
    return [];
  }, [uniqueGroupKeys, getSubRows]);

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
    if (fetchedPages.has(pageNumber)) {
      return;
    }
    fetchedPages.add(pageNumber);
    if (isFetching) {
      return;
    }
  };

  if (isLoading) {
    return <Spinner text="Loading..." />;
  }

  if (isError || data?.error) {
    return (
      <Notification severity="negative" title="Error">
        {data?.error || "An error occurred while fetching exam results."}
      </Notification>
    );
  }

  if (data && !data?.error) {
    return (
      <>
        {isFetching && <Spinner text="Loading..." />}
        {paginationMeta && (
          <Pagination
            currentPage={paginationMeta?.currentPage ?? 1}
            itemsPerPage={50}
            paginate={handleLoadPage}
            totalItems={paginationMeta.totalItems}
            disabled={isFetching}
          />
        )}
        <ModularTable data={currentRows} columns={columns} sortable />
      </>
    );
  }

  return <></>;
};

export default ExamResults;
