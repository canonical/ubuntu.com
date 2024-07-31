import { useState, useMemo, useEffect } from "react";
import {
  Pagination,
  Spinner,
  Notification,
  ModularTable,
  Button,
} from "@canonical/react-components";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getExamResults, getIssuedBadgesBulkCredly } from "../../api/keys";
import { ExamResultsMeta, ExamResultsTA, CredlyBadge } from "../../utils/types";

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
    queryKey: ["credlyIssuedBadgesBulk"],
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

  // const handleIssueBadge = async (examId: number) => {};

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
        accessor: "badge",
        Cell: (props: any) => {
          return props.row.depth === 0 ? (
            <></>
          ) : (
            <>
              {props.value && (
                <Button appearance="positive" dense>
                  Badge Issued
                </Button>
              )}
              {!props.value && <Button dense>Issue a Badge</Button>}
            </>
          );
        },
      },
    ],
    []
  );

  const flatData = useMemo(() => {
    const data = cachedData ? Object.values(cachedData).flat() : [];
    const mappedData = data
      .sort((a, b) => b.meta.current_page - a.meta.current_page)
      .map((page) => page.results)
      .flat();
    if (dataBadges?.data) {
      const mappedDataWithBadgeInfo = mappedData.map((result) => {
        const badge = dataBadges.data.find(
          (badge) =>
            badge.recipient_email === result.user_email ||
            badge.issuer_earner_id === result.uuid
        );
        return {
          ...result,
          badge,
        };
      });
      return mappedDataWithBadgeInfo;
    }
    return mappedData;
  }, [cachedData, dataBadges]);

  const uniqueGroupKeys = useMemo(() => {
    if (flatData && flatData?.length) {
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
    if (flatData && flatData?.length) {
      return (uniqueGroupKeys as number[]).map((screenId) => {
        const exam = getExam(screenId);
        const subRows = getSubRows(screenId);
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
          <ModularTable data={currentRows} columns={columns} sortable />
        </>
      )}
    </>
  );
};

export default ExamResults;
