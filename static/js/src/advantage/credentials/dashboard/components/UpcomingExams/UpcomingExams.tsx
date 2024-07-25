import React from "react";
import { useState, useMemo, useRef } from "react";
import { Pagination, Spinner, Notification } from "@canonical/react-components";
import { useQuery, useInfiniteQuery, useQueryClient } from "react-query";
import { getUpcomingExams } from "../../api/keys";
import {
  AssessmentReservationTA,
  AssessmentReservationMeta,
} from "../../utils/types";
import { ModularTable, Select } from "@canonical/react-components";

interface IProps {
  hidden: boolean;
}

type APIResponse = {
  assessment_reservations: AssessmentReservationTA[];
  meta: AssessmentReservationMeta;
  error?: string;
};

const UpcomingExams = (props: IProps) => {
  const { hidden } = props;
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const fetchedPages = useRef(new Set([1]));
  const [groupKey, setGroupKey] = useState("1");
  const {
    isLoading,
    isError,
    data,
    isFetching,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<APIResponse>("upcomingExams", getUpcomingExams, {
    keepPreviousData: true,
  });

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
    []
  );

  const flatData = useMemo(() => {
    const sortedPages = data?.pages.sort(
      (a, b) => b.meta.current_page - a.meta.current_page
    );
    return (
      sortedPages?.reduce(
        (acc: AssessmentReservationTA[], page: APIResponse) => {
          return [...acc, ...page.assessment_reservations];
        },
        []
      ) ?? []
    );
  }, [data]);

  const uniqueGroupKeys = useMemo(() => {
    if (data && data.pages) {
      if (groupKey === "1") {
        return [
          ...new Set(
            flatData.map(
              (res: AssessmentReservationTA) => res.ability_screen.id
            )
          ),
        ];
      } else if (groupKey === "2") {
        return [
          ...new Set(
            flatData.map(
              (res: AssessmentReservationTA) =>
                res.assessment?.state || res.state
            )
          ),
        ];
      }
      return [];
    }
    return [];
  }, [data, groupKey, flatData]);

  const uppercaseFirstCharacter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getState = (res: AssessmentReservationTA) => {
    const state = res?.assessment?.state || res.state;
    return uppercaseFirstCharacter(state || "N/A");
  };

  const getSubRows = (key: number | string) => {
    let matches: AssessmentReservationTA[] = [];
    if (groupKey === "1") {
      matches =
        flatData.filter(
          (res: AssessmentReservationTA) => res.ability_screen.id === key
        ) || [];
      matches = matches.map((m) => ({
        ...m,
        state: getState(m),
      }));
    } else if (groupKey === "2") {
      matches =
        flatData.filter(
          (res: AssessmentReservationTA) =>
            res?.assessment?.state === key || res.state === key
        ) || [];
      matches = matches.map((m) => ({
        ...m,
        state: getState(m),
      }));
    }
    return matches;
  };

  const getAbilityScreen = (
    screenId: number
  ): AssessmentReservationTA | null => {
    return (
      flatData.find(
        (res: AssessmentReservationTA) => res.ability_screen.id === screenId
      ) || null
    );
  };

  const currentRows = useMemo(() => {
    if (data && data?.pages) {
      if (groupKey === "1") {
        return (uniqueGroupKeys as number[]).map((screenId) => {
          const badge = getAbilityScreen(screenId);
          const subRows = getSubRows(screenId);
          return {
            id: badge?.ability_screen?.name,
            subRows,
          };
        });
      } else if (groupKey === "2") {
        return (uniqueGroupKeys as string[]).map((state) => {
          const subRows = getSubRows(state);
          return {
            id: uppercaseFirstCharacter(state),
            subRows,
          };
        });
      }
      return [];
    }
    return [];
  }, [uniqueGroupKeys, getSubRows, groupKey]);

  const paginationMeta = useMemo(() => {
    if (data && data?.pages && data.pages.length) {
      const { pages } = data;
      const meta = pages[0].meta;
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
  }, [data]);

  const handleLoadPage = (pageNumber: number) => {
    if (isFetching || isFetchingNextPage) {
      return;
    }
    setCurrentPage(pageNumber);
    if (fetchedPages.current.has(pageNumber)) {
      return;
    }
    fetchedPages.current.add(pageNumber);
    if (isFetching) {
      return;
    }
    fetchNextPage({ pageParam: pageNumber });
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
        {(isFetching || isFetchingNextPage) && <Spinner text="Loading..." />}
        {paginationMeta && (
          <Pagination
            currentPage={currentPage}
            itemsPerPage={50}
            paginate={handleLoadPage}
            totalItems={paginationMeta.totalItems}
            disabled={isFetchingNextPage}
          />
        )}
        {/* <Select 
          defaultValue="1"
          id="groupBy"
          label="Group By"
          name="groupBy"
          options={[
            {
              label: 'Exam',
              value: '1'
            },
            {
              label: 'State',
              value: '2'
            },
          ]}
          // onChange={(e) => setGroupKey(e.target.value)}
          // value={groupKey}
        /> */}
        <ModularTable data={currentRows} columns={columns} sortable />
        {/* <MainTable
          sortFunction={sortFunction}
          // sortable
          headers={[
            { content: "ID", sortKey: "id" },
            { content: "User", sortKey: "user" },
            { content: "Exam State", sortKey: "state" },
            { content: "Starting Time", sortKey: "startsAt" },
          ]}
          paginate={50}
          rows={currentRows}
        /> */}
      </>
    );
  }

  return <></>;
};

export default UpcomingExams;
