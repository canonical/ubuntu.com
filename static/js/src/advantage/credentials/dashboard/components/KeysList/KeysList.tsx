import { useMemo } from "react";
import {
  MainTable,
  // Pagination,
  Spinner,
  Notification,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { listAllKeys } from "advantage/credentials/api/keys";
import { sortFunction } from "../../utils";

const Keys = () => {
  // const [page, setPage] = useState(1);
  const { isLoading, isError, data } = useQuery({
    queryKey: ["listAllKeys"],
    queryFn: () => listAllKeys(),
  });
  const currentRows = useMemo(() => {
    if (data) {
      return data.map((key: any) => ({
        key: key.key,
        columns: [
          { content: key.key },
          { content: key.activatedBy },
          { content: key.productID },
          { content: key.expirationDate.toString() },
        ],
      }));
    }
    return [];
  }, [data]);

  // const paginationMeta = useMemo(() => {
  //   if (data) {
  //     return [];
  //     const { meta } = data;
  //     const totalPages = meta.total_pages;
  //     const currentPage = totalPages - meta.current_page + 1;
  //     return {
  //       totalPages,
  //       currentPage,
  //       nextPage: currentPage < totalPages ? currentPage + 1 : null,
  //       previousPage: currentPage > 1 ? currentPage - 1 : null,
  //       totalItems: meta.total_count,
  //     };
  //   }
  //   return {};
  // }, [data, page]);

  // const handleLoadPage = (pageNumber: number) => {
  //   if (isFetching) {
  //     return;
  //   }
  //   setPage(pageNumber);
  // };

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
        <MainTable
          sortable
          sortFunction={sortFunction}
          headers={[
            {
              content: "Exam Key Id",
            },
            {
              content: "Assignee",
              sortKey: "activatedBy",
            },
            {
              content: "Exam",
              sortKey: "productID",
            },
            {
              content: "Expiration Date",
              sortKey: "expirationDate",
            },
          ]}
          paginate={10}
          rows={currentRows}
          emptyStateMsg="No keys found"
        />
        {/* {paginationMeta && (
          <Pagination
            currentPage={paginationMeta?.currentPage ?? 1}
            itemsPerPage={10}
            paginate={handleLoadPage}
            totalItems={paginationMeta.totalItems}
            disabled={isFetching}
          />
        )} */}
      </>
    );
  }

  return <></>;
};

export default Keys;
