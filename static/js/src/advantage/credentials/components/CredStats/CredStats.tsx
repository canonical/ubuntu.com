import React, { ChangeEvent, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { listAllResults } from "advantage/credentials/api/trueability";
import { MainTable } from "@canonical/react-components";

type Result = {
  id: string;
  started_at: Date;
  user_email: string;
  user_full_name: string;
};

const CredStats = () => {
  const { isLoading, data } = useQuery(["Results"], async () => {
    return listAllResults();
  });
  const [filteredData, setFilteredData] = useState<Result[]>(data);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const filterDates = () => {
    if (!startDate || !endDate) {
      return;
    }
    setFilteredData(
      data.filter((result: any) => {
        return (
          result["started_at"] >= startDate && result["started_at"] <= endDate
        );
      })
    );
  };
  const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
  };
  const handleEndDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  useEffect(() => {
    filterDates();
  }, [startDate, endDate]);
  useEffect(() => {
    console.log(data);
    setFilteredData(data);
  }, [data]);
  return (
    <div className="u-fixed-width">
      <div className="row">
        <input type="date" className="col-6" onChange={handleStartDateChange} />
        <input type="date" className="col-6" onChange={handleEndDateChange} />
      </div>
      <p>Total entries: {filteredData ? filteredData.length : 0}</p>
      <MainTable
        headers={[
          { content: "ID", sortKey: "id" },
          { content: "Email", sortKey: "email" },
          { content: "Name", sortKey: "name" },
          { content: "Started At", sortKey: "started_at" },
        ]}
        rows={
          filteredData &&
          filteredData.map((result: any) => {
            return {
              columns: [
                {
                  content: result.id,
                },
                { content: result.user_email },
                { content: result.user_full_name },
                { content: result.started_at }
              ],
              sortData: {
                ...result
              }
            };
          })
        }
        sortable
        paginate={10}
      />
    </div>
  );
};
export default CredStats;
