import React from "react";
import { format } from "date-fns";
import MainTable from "@canonical/react-components/dist/components/MainTable";
import Button from "@canonical/react-components/dist/components/Button";

import { Users } from "../app";

const DATE_FORMAT = "dd/MM/yyyy";

const TableView: React.FC<{ users: Users }> = ({ users }) => {
  return (
    <MainTable
      responsive
      headers={[
        {
          content: "email",
        },
        {
          content: "role",
        },
        {
          content: "date added",
        },
        {
          content: "last sign in",
        },
        {
          content: "actions",
        },
      ]}
      rows={users.map((user, index) => ({
        key: index,
        columns: [
          {
            content: user.email,
            role: "rowheader",
          },
          {
            content: user.role,
          },
          {
            content: format(new Date(user.createdAt), DATE_FORMAT),
          },
          {
            content: format(new Date(user.lastLoginAt), DATE_FORMAT),
          },
          {
            content: (
              <Button small dense>
                Edit
              </Button>
            ),
          },
        ],
      }))}
    />
  );
};

export default TableView;
