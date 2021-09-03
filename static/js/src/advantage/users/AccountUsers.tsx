import React from "react";

import Organisation from "./components/Organisation";

const AccountUsers = ({ organisationName }: { organisationName: string }) => {
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
      </section>
    </div>
  );
};

export default AccountUsers;
