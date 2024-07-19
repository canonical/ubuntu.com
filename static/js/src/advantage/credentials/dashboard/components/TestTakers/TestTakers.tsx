import React from "react";
import { useQuery } from "react-query";
import { getTestTakerStats } from "../../api/keys";
import { useMemo } from "react";
import { MainTable, Spinner, Notification } from "@canonical/react-components";
import { Assessment } from "../../utils/types";
import { countries } from "advantage/countries-and-states";
import { sortFunction } from "../../utils";

const TestTakers = () => {
  const { data, isLoading, isError } = useQuery<Assessment[]>(
    "testTakerStats",
    getTestTakerStats
  );

  const getSortData = (data: { countryName: string; count: number }) => {
    return {
      countryName: data.countryName,
      count: data.count,
    };
  };

  const currentRows = useMemo(() => {
    if (data) {
      const grouped = data.reduce(
        (acc: { [x: string]: number }, row: Assessment) => {
          const countryCode = row.address?.country_code ?? "NA";
          const country = countries.find((c) => c.value === countryCode);
          const countryName = country ? country.label : "Unknown";
          if (acc[countryName]) {
            acc[countryName]++;
          } else {
            acc[countryName] = 1;
          }
          return acc;
        },
        {}
      );

      const counts = Object.entries(grouped).map(([countryName, count]) => ({
        countryName,
        count,
      }));

      return counts
        .sort((a, b) => b.count - a.count)
        .map((row) => ({
          key: row.countryName,
          columns: [
            { content: row.countryName, sortData: getSortData(row) },
            { content: row.count, sortData: getSortData(row) },
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

  return (
    <>
      <h1>Test Takers Geolocation</h1>
      <MainTable
        sortable
        sortFunction={sortFunction}
        headers={[
          { content: "Country Code", sortKey: "countryCode" },
          { content: "Count", sortKey: "count" },
        ]}
        rows={currentRows}
      />
    </>
  );
};

export default TestTakers;
