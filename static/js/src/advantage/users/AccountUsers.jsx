import React from "react";
import PropTypes from "prop-types";

import Organisation from "./components/Organisation";

const AccountUsers = ({ organisationName }) => {
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

AccountUsers.propTypes = {
  organisationName: PropTypes.string.isRequired,
};

export default AccountUsers;
