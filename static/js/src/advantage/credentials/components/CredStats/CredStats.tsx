import React, { ChangeEvent, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { listAllResults } from "advantage/credentials/api/trueability";
import { MainTable } from "@canonical/react-components";

type Result = {
  id: string;
  provisioned_at: Date;
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
          result["provisioned_at"] >= startDate && result["provisioned_at"] <= endDate
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
          { content: "Provisioned At", sortKey: "provisioned_at" },
        ]}
        rows={
          filteredData &&
          filteredData.map((result: any) => {
            return {
              columns: [
                {
                  content: result.id,
                },
                { content: result["user"]["email"] },
                { content: result["user"]["full_name"] },
                { content: result.provisioned_at }
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
