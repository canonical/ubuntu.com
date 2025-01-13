import { useMemo } from "react";
import { MainTable, Spinner, Notification } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { listAllKeys } from "advantage/credentials/api/keys";
import { sortFunction } from "../../utils";

const Keys = () => {
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
      </>
    );
  }

  return <></>;
};

export default Keys;
