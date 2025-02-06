import { useState, useMemo, useEffect } from "react";
import { Pagination, Spinner, Notification } from "@canonical/react-components";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUpcomingExams, getUserPermissions } from "../../api/queryFns";
import {
  AssessmentReservationTA,
  AssessmentReservationMeta,
} from "../../utils/types";
import {
  getUserPermissionsKey,
  getUpcomingExamsKey,
} from "../../api/queryKeys";
import { ModularTable } from "@canonical/react-components";
import { getFormattedDate, upperCaseFirstChar } from "../../utils/common";
import ActionsMenu from "./components/ActionsMenu";

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
  const [notification, setNotification] = useState<
    undefined | "negative" | "positive"
  >(undefined);
  const [notificationError, setNotificationError] = useState<string | null>(
    null,
  );
  const { data: permissions } = useQuery({
    queryKey: getUserPermissionsKey(),
    queryFn: getUserPermissions,
  });

  const onSuccess = (newData: APIResponse, currPage: number) => {
    if (newData && newData.assessment_reservations) {
      setCachedData((prev) => ({
        ...prev,
        [currPage]: newData,
      }));
    }
  };

  const { isLoading, isError, data, isFetching } = useQuery<APIResponse>({
    queryKey: getUpcomingExamsKey(page),
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

  const columns: any = useMemo(() => {
    const COLS: any[] = [
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
        Header: "User",
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
        Header: "User Name",
        accessor: "user.full_name",
        sortType: "basic",
        Cell: (props: any) => {
          return props.row.depth === 0 ? <></> : <small>{props.value}</small>;
        },
      },
      {
        Header: "State",
        accessor: "state",
        sortType: "basic",
        Cell: (props: any) => {
          return props.row.depth === 0 ? <></> : <small>{props.value}</small>;
        },
      },
      {
        Header: "Region",
        accessor: "address.country_code",
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
          const date = getFormattedDate(props.value);
          return props.row.depth === 0 ? <></> : <small>{date}</small>;
        },
      },
    ];
    if (permissions?.is_credentials_admin) {
      COLS.push({
        Header: "Actions",
        accessor: "actions",
        Cell: (props: any) => {
          return props.row.depth === 0 ? (
            <></>
          ) : (
            <>
              {props.value && (
                <ActionsMenu
                  exam={props.row.original}
                  setNotificationState={setNotification}
                  setNotificationError={setNotificationError}
                />
              )}
            </>
          );
        },
      });
    }
    return COLS;
  }, [permissions]);

  const flatData = useMemo(() => {
    const data = cachedData ? Object.values(cachedData).flat() : [];
    return data
      .sort((a, b) => a.meta.current_page - b.meta.current_page)
      .map((page) => page.assessment_reservations)
      .flat();
  }, [cachedData]);

  const uniqueGroupKeys = useMemo(() => {
    if (flatData && flatData?.length) {
      return [
        ...new Set(
          flatData.map((res: AssessmentReservationTA) => res.ability_screen.id),
        ),
      ];
    }
    return [];
  }, [flatData]);

  const getState = (res: AssessmentReservationTA) => {
    const state = res.state;
    return upperCaseFirstChar(state || "N/A");
  };

  const getSubRows = (key: number | string) => {
    let matches: AssessmentReservationTA[] = [];
    matches =
      flatData.filter(
        (res: AssessmentReservationTA) => res.ability_screen.id === key,
      ) || [];
    matches = matches.map((m) => ({
      ...m,
      actions: true,
      state: getState(m),
    }));
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
      return (uniqueGroupKeys as number[]).map((screenId) => {
        const screen = getAbilityScreen(screenId);
        const subRows = getSubRows(screenId);
        return {
          id: screen?.ability_screen?.name,
          subRows,
        };
      });
    }
    return [];
  }, [uniqueGroupKeys, getSubRows, flatData]);

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
      {notification && (
        <Notification
          severity={notification}
          title={
            notificationError
              ? notificationError
              : notification === "positive"
                ? "Exam cancelled"
                : "Failed to cancel exam"
          }
        />
      )}
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
          <ModularTable data={currentRows} columns={columns} sortable />
        </>
      )}
    </>
  );
};

export default UpcomingExams;
