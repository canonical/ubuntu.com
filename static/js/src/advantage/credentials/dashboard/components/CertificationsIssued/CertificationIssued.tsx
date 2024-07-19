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
import { CredlyMetadata } from "../../utils/types";

const CertificationIssued = () => {
  const [page, setPage] = useState<number | null>(null);
  const filter = "state::accepted";
  const [sort, setSort] = useState(null);

  const { isLoading, isError, data, isFetching } = useQuery(
    ["issuedBadges", filter, sort, page],
    () => getIssuedBadgesCredly(filter, sort, page),
    { keepPreviousData: true }
  );

  const getSortDataForRow = (row: any) => {
    return {
      badgeName: row.badge_template.name,
      name: row.issued_to,
      email: row.recipient_email,
    };
  }

  const currentRows = useMemo(() => {
    if (data && !!data?.data) {
      const { data: badges } = data;
      return badges.map((badge: any) => ({
        key: badge.id,
        columns: [
          { content: badge.badge_template.name, sortData: getSortDataForRow(badge) },
          { content: badge.issued_to, sortData: getSortDataForRow(badge) },
          { content: badge.recipient_email, sortData: getSortDataForRow(badge) },
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

  return (
    <>
      <MainTable
        sortable
        onUpdateSort={(sortKey) => console.log(sortKey)}
        headers={[
          { content: "Badge Name", sortKey: 'badgeName' },
          { content: "Name", sortKey: 'name' },
          { content: "Email", sortKey: 'email' },
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
};

export default CertificationIssued;