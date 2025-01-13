import { useQuery } from "@tanstack/react-query";
import { getTestTakerStats } from "../../api/queryFns";
import { useMemo } from "react";
import {
  Spinner,
  Notification,
  ModularTable,
} from "@canonical/react-components";
import { Address } from "../../utils/types";
import { countries } from "advantage/countries-and-states";

const TestTakers = () => {
  const { data, isLoading, isError } = useQuery<Address[]>({
    queryKey: ["testTakerStats"],
    queryFn: getTestTakerStats,
  });

  const columns: any = useMemo(
    () => [
      {
        Header: "Country Name",
        accessor: "countryName",
        sortType: "basic",
      },
      {
        Header: "Count",
        accessor: "count",
        sortType: "basic",
      },
    ],
    [],
  );

  const currentRows = useMemo(() => {
    if (data) {
      const grouped = data.reduce(
        (acc: { [x: string]: number }, row: Address) => {
          const countryCode = row?.country_code ?? "N/A";
          const country = countries.find((c) => c.value === countryCode);
          const countryName = country ? country.label : "Unknown";
          if (acc[countryName]) {
            acc[countryName]++;
          } else {
            acc[countryName] = 1;
          }
          return acc;
        },
        {},
      );

      const counts = Object.entries(grouped).map(([countryName, count]) => ({
        countryName,
        count,
      }));

      return counts.sort((a, b) => b.count - a.count);
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

  return (
    <>
      <h1>Test Takers Geolocation</h1>
      <ModularTable sortable columns={columns} data={currentRows} />
    </>
  );
};

export default TestTakers;
