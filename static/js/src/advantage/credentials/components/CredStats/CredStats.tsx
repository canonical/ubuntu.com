import React, { ChangeEvent, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { ResponsiveContainer, PieChart, Pie } from "recharts";
import { listAllResults } from "advantage/credentials/api/trueability";

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
  const filterDates = ()=>{
    if(!startDate || !endDate){
      return;
    }
    setFilteredData(data.filter((result:any)=>{return (result["started_at"]>=startDate && result["started_at"]<=endDate)}));
  }
  const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>)=>{setStartDate(event.target.value)}
  const handleEndDateChange = (event: ChangeEvent<HTMLInputElement>)=>{setEndDate(event.target.value)}

  useEffect(()=>{
    filterDates();
  },[startDate,endDate])
  useEffect(()=>{
    console.log(data);
    setFilteredData(data);
  },[data])
  return (
    <div>
      <ResponsiveContainer>
        <PieChart>
          <Pie dataKey="duration_in_minutes" data={filteredData} fill="#8884d8" label />
        </PieChart>
      </ResponsiveContainer>
      <input type="date" onChange={handleStartDateChange}/>
      <input type="date" onChange={handleEndDateChange}/>
      <table>
        <tbody>
          {filteredData && filteredData.map((result:any)=>{
            return (<tr>
              <td>{result.id}</td>
              <td>{result.user_email}</td>
              <td>{result.user_full_name}</td>
              <td>{result.started_at}</td>
            </tr>)
          })}
        </tbody>
      </table>
    </div>   
  );
};
export default CredStats;
