import { useState, useMemo, useEffect } from "react";
import { Pagination, Spinner, Notification } from "@canonical/react-components";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getIssuedBadgesCredly } from "../../api/queryFns";
import { CredlyMetadata, CredlyBadge } from "../../utils/types";
import { ModularTable } from "@canonical/react-components";

type APIResponse = {
  data: CredlyBadge[];
  metadata: CredlyMetadata;
  message?: string;
};

const CertificationIssued = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState<number>(0);
  const [fetchedPages] = useState(new Set([1]));
  const [cachedData, setCachedData] = useState<Record<number, APIResponse>>({});
  const filter = "state::accepted";

  const onSuccess = (newData: APIResponse) => {
    if (newData && newData.data) {
      setCachedData((prev) => ({
        ...prev,
        [page]: newData,
      }));
    }
  };

  const { isLoading, isError, data, isFetching } = useQuery<APIResponse>({
    queryKey: ["issuedBadges", filter, null, page],
    queryFn: () => getIssuedBadgesCredly(filter, null, page, onSuccess),
  });

  useEffect(() => {
    const queryData = queryClient.getQueryData<APIResponse>([
      "issuedBadges",
      filter,
      null,
      page,
    ]);

    if (queryData) {
      setCachedData((prev) => ({
        ...prev,
        [page]: queryData,
      }));
    }
  }, [filter, page]);

  const columns: any = useMemo(
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
    [],
  );

  const flatData = useMemo(() => {
    const data = cachedData ? Object.values(cachedData).flat() : [];
    return data
      .sort((a, b) => b.metadata.current_page - a.metadata.current_page)
      .map((page) => page.data)
      .flat();
  }, [cachedData]);

  const uniqueBadgeTemplates = useMemo(() => {
    if (flatData && flatData?.length) {
      return [
        ...new Set(
          flatData.map((badge: CredlyBadge) => badge.badge_template.id),
        ),
      ];
    }
    return [];
  }, [flatData]);

  const getBadgeTemplateSubrows = (templateId: string) => {
    const matches =
      flatData.filter(
        (badge: CredlyBadge) => badge.badge_template.id === templateId,
      ) || [];
    return matches.map((badge: CredlyBadge) => ({
      issued_to: badge.issued_to,
      recipient_email: badge.recipient_email,
    }));
  };

  const getBadgeTemplate = (templateId: string): CredlyBadge | undefined => {
    return (
      flatData.find(
        (badge: CredlyBadge) => badge.badge_template.id === templateId,
      ) || undefined
    );
  };

  const currentRows = useMemo(() => {
    if (flatData && flatData?.length) {
      return (uniqueBadgeTemplates as string[]).map((templateId: string) => {
        const badge = getBadgeTemplate(templateId);
        const subRows = getBadgeTemplateSubrows(templateId);
        return {
          issued_to: badge?.badge_template.name || "Unknown",
          recipient_email: `${subRows.length} recipient${
            subRows.length > 1 ? "s" : ""
          }`,
          subRows,
        };
      });
    }
    return [];
  }, [uniqueBadgeTemplates, getBadgeTemplateSubrows, flatData]);

  const paginationMeta: CredlyMetadata | undefined = useMemo(() => {
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

  if (isError) {
    return (
      <Notification severity="negative" title="Error">
        Something went wrong. Please try again later.
      </Notification>
    );
  }

  return (
    <>
      {(isFetching || isLoading) && <Spinner text="Loading..." />}
      {paginationMeta && (
        <Pagination
          currentPage={paginationMeta.current_page}
          itemsPerPage={paginationMeta.per}
          paginate={handleLoadPage}
          totalItems={paginationMeta.total_count}
          disabled={isFetching}
        />
      )}
      {flatData && flatData?.length > 0 && (
        <ModularTable columns={columns} data={currentRows} sortable />
      )}
    </>
  );
};

export default CertificationIssued;
