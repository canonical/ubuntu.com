import React from "react";
import { MainTable } from "@canonical/react-components";

const Table = () => {
  return (
    <MainTable
      headers={[
        { content: "Header 1", sortKey: "header1" },
        { content: "Header 2", sortKey: "header2" },
        { content: "Header 3", sortKey: "header3" },
      ]}
      rows={[
        {
          key: "row1",
          columns: [
            { content: "Cell 1" },
            { content: "Cell 2" },
            { content: "Cell 3" },
          ],
        },
        {
          key: "row2",
          columns: [
            { content: "Cell 4" },
            { content: "Cell 5" },
            { content: "Cell 6" },
          ],
        },
      ]}
    ></MainTable>
  );
};

export default Table;
