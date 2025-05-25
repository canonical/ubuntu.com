import { useFetchCVEData } from "../utils/fetchCVEData";

const CVETable = () => {

  const {data:nobleData, error, isLoading} = useFetchCVEData("focal");
  
  return (
    <table className="cve-table">
      <thead>
        <tr>
          <th>CVE</th>
          <th>Description</th>
          <th>Severity</th>
          <th>Published</th>
          <th>Updated</th>
        </tr>
      </thead>
      <tbody>
        {isLoading && <tr><td colSpan={5}>Loading...</td></tr>}
        {error && <tr><td colSpan={5}>Error loading data</td></tr>}
        {nobleData && nobleData.map((cve:any) => (
          <tr key={cve.id}>
            <td>{cve.id}</td>
            <td>{cve.description}</td>
            <td>{cve.severity}</td>
            <td>{new Date(cve.published).toLocaleDateString()}</td>
            <td>{new Date(cve.updated).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
export default CVETable;
