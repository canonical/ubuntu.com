import { useState, useMemo, useEffect } from "react";
import {
  Pagination,
  Spinner,
  Notification,
  ModularTable,
} from "@canonical/react-components";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getExamResults, getIssuedBadgesBulkCredly } from "../../api/queryFns";
import { ExamResultsMeta, ExamResultsTA, CredlyBadge } from "../../utils/types";
import BadgeIssueMenu from "./components/BadgeIssueMenu";
import { getBulkBadgesCredly } from "../../api/queryKeys";

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
  const [badgeIssuingNotification, setBadgeIssuingNotification] = useState<
    undefined | "negative" | "positive"
  >(undefined);

  useEffect(() => {
    let timeout = null;
    if (badgeIssuingNotification) {
      timeout = setTimeout(() => {
        setBadgeIssuingNotification(undefined);
      }, 5000);
    }

    return () => {
      timeout && clearTimeout(timeout);
    };
  }, [badgeIssuingNotification]);

  const onSuccess = (newData: APIResponse) => {
    if (newData && newData.results) {
      setCachedData((prev) => ({
        ...prev,
        [page]: newData,
      }));
    }
  };

  const { isLoading, isError, data, isFetching } = useQuery({
    queryKey: ["examResults", page, "finalized"],
    queryFn: () => getExamResults(page, "finalized", onSuccess),
  });

  const {
    isLoading: isLoadingBadges,
    isError: isErrorBadges,
    data: dataBadges,
  } = useQuery<{
    data: CredlyBadge[];
  }>({
    queryKey: getBulkBadgesCredly(),
    queryFn: () => getIssuedBadgesBulkCredly(),
    staleTime: Infinity,
    gcTime: Infinity,
  });

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

  const columns: any = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
        sortType: "basic",
        Cell: (props: any) =>
          props.row.depth === 0 ? (
            <strong>{props.value}</strong>
          ) : (
            <small style={{ paddingLeft: "8px" }}>
              <a
                href={props.row.original.result_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {props.value}
              </a>
            </small>
          ),
      },
      {
        Header: "First Name",
        accessor: "user.first_name",
        sortType: "basic",
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
        Header: "Score (%)",
        accessor: "score",
        sortType: "basic",
        Cell: (props: any) =>
          props.row.depth === 0 ? (
            <strong>{(props.value * 100).toFixed(1)}</strong>
          ) : (
            <small>{(props.value * 100).toFixed(1)}</small>
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
        Header: "Completed At",
        accessor: "completed_at",
        sortType: "basic",
        Cell: (props: any) => {
          if (!props.value && props.row.depth !== 0) {
            return <small>N/A</small>;
          }
          const completedAt = new Date(props.value).toLocaleString(
            navigator.language,
            {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            },
          );
          return props.row.depth === 0 ? <></> : <small>{completedAt}</small>;
        },
      },
      {
        Header: "Issue Badge",
        accessor: "issue_badge",
        Cell: (props: any) => {
          return props.row.depth === 0 ? (
            <></>
          ) : (
            <>
              {props.value && (
                <BadgeIssueMenu
                  exam={props.row.original}
                  setNotificationState={setBadgeIssuingNotification}
                />
              )}
            </>
          );
        },
      },
    ],
    [],
  );

  const flatData = useMemo(() => {
    const data = cachedData ? Object.values(cachedData).flat() : [];
    const mappedData = data
      .sort((a, b) => b.meta.current_page - a.meta.current_page)
      .map((page) => page.results)
      .flat();
    return mappedData.map((result) => ({
      ...result,
      issue_badge: true,
    }));
  }, [cachedData, dataBadges]);

  const uniqueGroupKeys = useMemo(() => {
    if (flatData && flatData?.length) {
      return [
        ...new Set(flatData.map((res: ExamResultsTA) => res.ability_screen.id)),
      ];
    }
    return [];
  }, [data, flatData]);

  const getSubRows = (key: number | string, cutOff: number) => {
    const matches: ExamResultsTA[] =
      flatData.filter((res: ExamResultsTA) => res.ability_screen.id === key) ||
      [];
    return matches.map((m) => ({ ...m, cutOff }));
  };

  const getExam = (screenId: number): ExamResultsTA | null => {
    return (
      flatData.find(
        (res: ExamResultsTA) => res.ability_screen.id === screenId,
      ) || null
    );
  };

  const currentRows = useMemo(() => {
    if (flatData && flatData?.length) {
      return (uniqueGroupKeys as number[]).map((screenId) => {
        const exam = getExam(screenId);
        const subRows = getSubRows(
          screenId,
          exam?.ability_screen.cutoff_score || 0,
        );
        return {
          id: exam?.ability_screen?.name || "N/A",
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
    return undefined;
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

  if (isError || data?.error || isErrorBadges) {
    return (
      <Notification severity="negative" title="Error">
        {data?.error || "An error occurred while fetching exam results."}
      </Notification>
    );
  }

  return (
    <>
      {(isLoading || isFetching || isLoadingBadges) && (
        <Spinner text="Loading..." />
      )}
      {badgeIssuingNotification && (
        <Notification
          severity={badgeIssuingNotification}
          title={
            badgeIssuingNotification === "positive"
              ? "Badge Issued"
              : "Failed to issue badge"
          }
        />
      )}
      {paginationMeta && (
        <Pagination
          currentPage={paginationMeta?.currentPage ?? 1}
          itemsPerPage={50}
          paginate={handleLoadPage}
          totalItems={paginationMeta.totalItems}
          disabled={isFetching}
        />
      )}
      {flatData && flatData?.length > 0 && (
        <>
          <ModularTable
            initialSortColumn="completed_at"
            initialSortDirection="descending"
            data={currentRows}
            columns={columns}
            sortable
            getRowProps={(row: any) => {
              const passed =
                row.depth !== 0 && row.original.score > row.original.cutOff;
              return {
                style: {
                  background: passed ? "rgba(14, 132, 32)" : "",
                  color: passed ? "#fff" : "",
                },
              };
            }}
          />
        </>
      )}
    </>
  );
};

export default ExamResults;
