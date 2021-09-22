import React from "react";
import { Button, MainTable, Icon, ICONS } from "@canonical/react-components";
const TableView = () => {
  return (
    <MainTable
      responsive
      className="p-table--cube--grid"
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
          className: "p-table__cell--icon-placeholder",
        },
        {
          content: "Action",
          className: "u-align--right",
        },
      ]}
      rows={[
        {
          key: 1,
          columns: [
            {
              content: "1",
              className: "u-text--muted",
            },
            {
              content: (
                <img src="https://assets.ubuntu.com/v1/9ef4a092-Architecture.svg" />
              ),
              className: "p-table--cube--grid__module-logo",
            },
            {
              content: "Ubuntu System Architecture",
              "aria-label": "Module",
            },
            {
              content: "Review and record relevant system information",
              "aria-label": "Topics",
            },
            {
              content: (
                <>
                  <Icon name={ICONS.success} />
                  Passed
                </>
              ),
              className: "p-table__cell--icon-placeholder",
              "aria-label": "status",
            },
            {
              content: <Button appearance={"positive"}>Purchase</Button>,
              className: "u-align--right",
            },
          ],
        },
        {
          key: 2,
          columns: [
            {
              content: "2",
              className: "u-text--muted",
            },
            {
              content: (
                <img src="https://assets.ubuntu.com/v1/c19e9931-Packages.svg" />
              ),
              className: "p-table--cube--grid__module-logo",
            },
            {
              content: "Ubuntu System Architecture",
              "aria-label": "Module",
            },
            {
              content: "Review and record relevant system information",
              "aria-label": "Topics",
            },
            {
              content: "Not Enrolled",
              className: "p-table__cell--icon-placeholder",
              "aria-label": "status",
            },
            {
              content: <Button appearance={"positive"}>Purchase</Button>,
              className: "u-align--right",
            },
          ],
        },
      ]}
    />
  );
};

export default TableView;
