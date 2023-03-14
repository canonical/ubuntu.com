import React, { useEffect } from "react";
import { useQuery } from "react-query";
import { ResponsiveContainer, PieChart, Pie } from "recharts";
import { listAllResults } from "advantage/credentials/api/trueability";

const CredStats = () => {
  const { isLoading, data } = useQuery(["Results"], async () => {
    return listAllResults();
  });
  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie dataKey="duration_in_minutes" data={data} fill="#8884d8" label />
        </PieChart>
      </ResponsiveContainer>
      {isLoading ? null : <p>{data.length}</p>}
    </div>
  );
};
export default CredStats;
