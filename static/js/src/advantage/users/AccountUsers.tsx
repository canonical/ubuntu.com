import React from "react";

import { Users, OrganisationName } from "./types";
import Organisation from "./components/Organisation";
import AddNewUser from "./components/AddNewUser/AddNewUser";
import TableView from "./components/TableView/TableView";

const AccountUsers: React.FC<{
  organisationName: OrganisationName;
  users: Users;
}> = ({ organisationName, users }) => {
  return (
    <div>
      <div className="p-strip">
        <div className="row">
          <div className="col-12">
            <h1>Account users</h1>
          </div>
        </div>
      </div>
      <section className="p-strip u-no-padding--top">
        <div className="row">
          <div className="col-6">
            <Organisation name={organisationName} />
          </div>
        </div>
        <div className="row">
          <div className="col-6">
            <AddNewUser />
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <TableView users={users} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccountUsers;
