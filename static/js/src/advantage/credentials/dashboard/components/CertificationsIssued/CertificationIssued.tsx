import React from "react";
import { useState, useMemo } from "react";
import { Pagination, Spinner, Notification } from "@canonical/react-components";
import { useQuery } from "react-query";
import { getIssuedBadgesCredly } from "../../api/keys";
import { CredlyMetadata } from "../../utils/types";
import { CredlyBadge } from "../../utils/types";
import { ModularTable } from "@canonical/react-components";

const CertificationIssued = () => {
  const [page, setPage] = useState<number | null>(null);
  const filter = "state::accepted";
  // const [sort, setSort] = useState(null);
  const sort = null;

  const columns = useMemo(
    () => [
      {
        Header: "Name",
        accessor: "issued_to",
        sortType: "basic",
        Cell: (props: any) =>
          props.row.depth === 0 ? (
            <strong>{props.value}</strong>
          ) : (
            <small style={{ paddingLeft: "8px" }}>{props.value}</small>
          ),
      },
      {
        Header: "Email",
        accessor: "recipient_email",
        sortType: "basic",
        Cell: (props: any) =>
          props.row.depth === 0 ? (
            <strong>{props.value}</strong>
          ) : (
            <small>{props.value}</small>
          ),
      },
    ],
    []
  );

  const { isLoading, isError, data, isFetching } = useQuery(
    ["issuedBadges", filter, sort, page],
    () => getIssuedBadgesCredly(filter, sort, page),
    { keepPreviousData: true }
  );

  const uniqueBadgeTemplates = useMemo(() => {
    if (data && data?.data) {
      const { data: badges } = data;
      return [
        ...new Set(badges.map((badge: CredlyBadge) => badge.badge_template.id)),
      ];
    }
    return [];
  }, [data]);

  const getBadgeTemplateSubrows = (templateId: string) => {
    const matches =
      data?.data.filter(
        (badge: CredlyBadge) => badge.badge_template.id === templateId
      ) || [];
    return matches.map((badge: CredlyBadge) => ({
      issued_to: badge.issued_to,
      recipient_email: badge.recipient_email,
    }));
  };

  const getBadgeTemplate = (templateId: string): CredlyBadge => {
    return (
      data?.data.find(
        (badge: CredlyBadge) => badge.badge_template.id === templateId
      ) || {}
    );
  };

  const currentRows = useMemo(() => {
    if (data && data?.data) {
      return (uniqueBadgeTemplates as string[]).map((templateId: string) => {
        const badge = getBadgeTemplate(templateId);
        const subRows = getBadgeTemplateSubrows(templateId);
        return {
          issued_to: badge.badge_template.name,
          recipient_email: `${subRows.length} recipient${
            subRows.length > 1 ? "s" : ""
          }`,
          subRows,
        };
      });
    }
    return [];
  }, [uniqueBadgeTemplates, getBadgeTemplateSubrows]);

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
      <ModularTable columns={columns} data={currentRows} sortable />
      {/* <MainTable
        sortable
        onUpdateSort={(sortKey) => console.log(sortKey)}
        headers={[
          { content: "Badge Name", sortKey: "badgeName" },
          { content: "Name", sortKey: "name" },
          { content: "Email", sortKey: "email" },
        ]}
        paginate={10}
        rows={currentRows}
      /> */}
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
