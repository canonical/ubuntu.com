import React from "react";
import { useState, useMemo } from "react";
import {
  MainTable,
  Pagination,
  Spinner,
  Notification,
} from "@canonical/react-components";
import { useQuery } from "react-query";
import { getIssuedBadgesCredly } from "../../api/keys";
import { sortFunction } from "../../utils";
import { CredlyMetadata } from "../../utils/types";
import { Tabs } from "@canonical/react-components";

const Credly = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState(null);
  const [sort, setSort] = useState(null);

  const [activeTab, setActiveTab] = useState(0);
  const tabs = useMemo(() => {
    return [
      {
        active: activeTab === 0,
        label: "Certifications Issued",
        onClick: () => setActiveTab(0),
      },
      {
        active: activeTab === 1,
        label: "Badge Tracking & Release",
        onClick: () => setActiveTab(1),
      },
    ];
  }, [activeTab]);

  const { isLoading, isError, data, isFetching } = useQuery(
    ["issuedBadges", filter, sort, page],
    () => getIssuedBadgesCredly(filter, sort, page),
    { keepPreviousData: true }
  );

  const uppercaseFirstCharacter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const currentRows = useMemo(() => {
    if (data && !!data?.data) {
      const { data: badges } = data;
      return badges.map((badge: any) => ({
        key: badge.id,
        columns: [
          { content: badge.badge_template.name },
          { content: badge.issued_to },
          { content: badge.recipient_email },
          { content: badge.state },
        ],
      }));
    }
    return [];
  }, [data]);

  const paginationMeta: CredlyMetadata | null = useMemo(() => {
    if (data && !data?.message) {
      const { metadata } = data;
      return {
        count: metadata.count,
        current_page: metadata.current_page,
        total_count: metadata.total_count,
        total_pages: metadata.total_pages,
        per: metadata.per,
        previous_page_url: metadata.previous_page_url,
        next_page_url: metadata.next_page_url,
      };
    }
    return null;
  }, [data, page]);

  const handleLoadPage = (pageNumber: number) => {
    if (isFetching) {
      return;
    }
    setPage(pageNumber);
  };

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
        <Tabs links={tabs} />
        <MainTable
          sortFunction={sortFunction}
          // sortable
          headers={[
            { content: "Badge Name" },
            { content: "Name" },
            { content: "Email" },
            { content: "Badge State" },
          ]}
          paginate={10}
          rows={currentRows}
        />
        {paginationMeta && (
          <Pagination
            currentPage={paginationMeta.current_page}
            itemsPerPage={paginationMeta.per}
            paginate={handleLoadPage}
            totalItems={paginationMeta.total_count}
            disabled={isFetching}
          />
        )}
      </>
    );
  }

  return <></>;
};

export default Credly;
