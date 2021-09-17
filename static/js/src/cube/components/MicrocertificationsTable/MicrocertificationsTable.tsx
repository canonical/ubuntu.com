import React from "react";
import MainTable from "@canonical/react-components/dist/components/MainTable";
import Button from "@canonical/react-components/dist/components/Button";

const TableView = () => {
  return (
    <MainTable
      responsive
      headers={[
        {
          content: "#",
        },
        {
          content: "",
        },
        {
          content: "Module",
        },
        {
          content: "Topics",
        },
        {
          content: "Status",
        },
        {
          content: "Action",
        },
      ]}
      rows={[
        {
          key: 1,
          columns: [
            {
              content: "1",
              role: "rowheader",
            },
            {
              content: <img src="http://placekitten.com/45/45" />,
            },
            {
              content: "Ubuntu System Architecture",
            },
            {
              content: "Review and record relevant system information",
            },
            {
              content: "Not Enrolled",
            },
            {
              content: <Button appearance={"positive"}>Purchase</Button>,
            },
          ],
        },
        {
          key: 2,
          columns: [
            {
              content: "2",
              role: "rowheader",
            },
            {
              content: <img src="http://placekitten.com/44/46" />,
            },
            {
              content: "Ubuntu System Architecture",
            },
            {
              content: "Review and record relevant system information",
            },
            {
              content: "Not Enrolled",
            },
            {
              content: <Button appearance={"positive"}>Purchase</Button>,
            },
          ],
        },
      ]}
    />
  );
};

export default TableView;
