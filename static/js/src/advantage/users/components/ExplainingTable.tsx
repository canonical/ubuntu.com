import React from "react";
import { MainTable, Icon, ICONS } from "@canonical/react-components";

const ExplainingTable = () => (
  <>
    <h2 className="p-heading--3">Role permissions</h2>
    <MainTable
      headers={[
        {
          content: null,
        },
        {
          content: "Manage users",
          className: "u-align--center",
        },
        {
          content: "Access tokens",
          className: "u-align--center",
        },
        {
          content: "Buy subscriptions",
          className: "u-align--center",
        },
        {
          content: "Payment & Invoices",
          className: "u-align--center",
        },
      ]}
      rows={[
        {
          columns: [
            {
              content: "Admin",
              role: "rowheader",
            },
            {
              content: <Icon name={ICONS.success} />,
              className: "u-align--center",
            },
            {
              content: <Icon name={ICONS.success} />,
              className: "u-align--center",
            },
            {
              content: <Icon name={ICONS.success} />,
              className: "u-align--center",
            },
            {
              content: <Icon name={ICONS.success} />,
              className: "u-align--center",
            },
          ],
        },
        {
          columns: [
            {
              content: "Technical",
              role: "rowheader",
            },
            {
              content: <Icon name={ICONS.error} />,
              className: "u-align--center",
            },
            {
              content: <Icon name={ICONS.success} />,
              className: "u-align--center",
            },
            {
              content: <Icon name={ICONS.error} />,
              className: "u-align--center",
            },
            {
              content: <Icon name={ICONS.error} />,
              className: "u-align--center",
            },
          ],
        },
        {
          columns: [
            {
              content: "Billing",
              role: "rowheader",
            },
            {
              content: <Icon name={ICONS.error} />,
              className: "u-align--center",
            },
            {
              content: <Icon name={ICONS.error} />,
              className: "u-align--center",
            },
            {
              content: <Icon name={ICONS.error} />,
              className: "u-align--center",
            },
            {
              content: <Icon name={ICONS.success} />,
              className: "u-align--center",
            },
          ],
        },
      ]}
      responsive
    />
  </>
);

export default ExplainingTable;
