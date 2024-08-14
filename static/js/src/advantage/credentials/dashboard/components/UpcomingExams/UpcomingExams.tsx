import { useState, useMemo, useEffect } from "react";
import { Pagination, Spinner, Notification } from "@canonical/react-components";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUpcomingExams } from "../../api/queryFns";
import {
  AssessmentReservationTA,
  AssessmentReservationMeta,
} from "../../utils/types";
import { ModularTable, Select } from "@canonical/react-components";
import { upperCaseFirstChar } from "../../utils/common";

type APIResponse = {
  assessment_reservations: AssessmentReservationTA[];
  meta: AssessmentReservationMeta;
  error?: string;
};

const UpcomingExams = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [fetchedPages] = useState(new Set([1]));
  const [cachedData, setCachedData] = useState<Record<number, APIResponse>>({});
  const [groupKey, setGroupKey] = useState("1");

  const onSuccess = (newData: APIResponse) => {
    if (newData && newData.assessment_reservations) {
      setCachedData((prev) => ({
        ...prev,
        [page]: newData,
      }));
    }
  };

  const { isLoading, isError, data, isFetching } = useQuery<APIResponse>({
    queryKey: ["upcomingExams", page],
    queryFn: () => getUpcomingExams(page, onSuccess),
  });

  useEffect(() => {
    const queryData = queryClient.getQueryData<APIResponse>([
      "upcomingExams",
      page,
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
            <small style={{ paddingLeft: "8px" }}>{props.value}</small>
          ),
      },
      {
        Header: "User Email",
        accessor: "user.email",
        sortType: "basic",
        Cell: (props: any) =>
          props.row.depth === 0 ? (
            <strong>{props.value}</strong>
          ) : (
            <small>{props.value}</small>
          ),
      },
      {
        Header: "Exam State",
        accessor: "state",
        sortType: "basic",
        Cell: (props: any) => {
          return props.row.depth === 0 ? <></> : <small>{props.value}</small>;
        },
      },
      {
        Header: "Starting Time",
        accessor: "starts_at",
        sortType: "basic",
        Cell: (props: any) => {
          const date = new Date(props.value).toLocaleString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          });
          return props.row.depth === 0 ? <></> : <small>{date}</small>;
        },
      },
    ],
    [],
  );

  const flatData = useMemo(() => {
    const data = cachedData ? Object.values(cachedData).flat() : [];
    return data
      .sort((a, b) => b.meta.current_page - a.meta.current_page)
      .map((page) => page.assessment_reservations)
      .flat();
  }, [cachedData]);

  const uniqueGroupKeys = useMemo(() => {
    if (flatData && flatData?.length) {
      if (groupKey === "1") {
        return [
          ...new Set(
            flatData.map(
              (res: AssessmentReservationTA) => res.ability_screen.id,
            ),
          ),
        ];
      } else if (groupKey === "2") {
        return [
          ...new Set(
            flatData.map(
              (res: AssessmentReservationTA) =>
                res.assessment?.state || res.state,
            ),
          ),
        ];
      }
      return [];
    }
    return [];
  }, [groupKey, flatData]);

  const getState = (res: AssessmentReservationTA) => {
    const state = res?.assessment?.state || res.state;
    return upperCaseFirstChar(state || "N/A");
  };

  const getSubRows = (key: number | string) => {
    let matches: AssessmentReservationTA[] = [];
    if (groupKey === "1") {
      matches =
        flatData.filter(
          (res: AssessmentReservationTA) => res.ability_screen.id === key,
        ) || [];
      matches = matches.map((m) => ({
        ...m,
        state: getState(m),
      }));
    } else if (groupKey === "2") {
      matches =
        flatData.filter(
          (res: AssessmentReservationTA) =>
            res?.assessment?.state === key || res.state === key,
        ) || [];
      matches = matches.map((m) => ({
        ...m,
        state: getState(m),
      }));
    }
    return matches;
  };

  const getAbilityScreen = (
    screenId: number,
  ): AssessmentReservationTA | null => {
    return (
      flatData.find(
        (res: AssessmentReservationTA) => res.ability_screen.id === screenId,
      ) || null
    );
  };

  const currentRows = useMemo(() => {
    if (flatData && flatData?.length) {
      if (groupKey === "1") {
        return (uniqueGroupKeys as number[]).map((screenId) => {
          const screen = getAbilityScreen(screenId);
          const subRows = getSubRows(screenId);
          return {
            id: screen?.ability_screen?.name,
            subRows,
          };
        });
      } else if (groupKey === "2") {
        return (uniqueGroupKeys as string[]).map((state) => {
          const subRows = getSubRows(state);
          return {
            id: upperCaseFirstChar(state),
            subRows,
          };
        });
      }
      return [];
    }
    return [];
  }, [uniqueGroupKeys, getSubRows, groupKey, flatData]);

  const paginationMeta = useMemo(() => {
    if (data && data?.meta) {
      const { meta } = data;
      const totalPages = meta.total_pages;
      const page = totalPages - meta.current_page + 1;
      return {
        totalPages,
        page,
        nextPage: page < totalPages ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
        totalItems: meta.total_count,
      };
    }
    return undefined;
  }, [data]);

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

  if (isError) {
    return (
      <Notification severity="negative" title="Error">
        Something went wrong. Please try again later.
      </Notification>
    );
  }

  return (
    <>
      {(isLoading || isFetching) && <Spinner text="Loading..." />}
      {paginationMeta && (
        <Pagination
          currentPage={page}
          itemsPerPage={50}
          paginate={handleLoadPage}
          totalItems={paginationMeta.totalItems || 0}
          disabled={isFetching}
        />
      )}
      {flatData && flatData?.length > 0 && (
        <>
          <Select
            defaultValue="1"
            id="groupBy"
            label="Group By"
            name="groupBy"
            options={[
              {
                label: "Exam",
                value: "1",
              },
              {
                label: "State",
                value: "2",
              },
            ]}
            onChange={(e) => setGroupKey(e.target.value)}
            value={groupKey}
          />
          <ModularTable data={currentRows} columns={columns} sortable />
        </>
      )}
    </>
  );
};

export default UpcomingExams;
