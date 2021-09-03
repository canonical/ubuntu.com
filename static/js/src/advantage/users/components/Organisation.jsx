import React from "react";
import PropTypes from "prop-types";

const Organisation = ({ name }) => (
  <>
    <p className="p-text--x-small-capitalised">organisation</p>
    <p className="p-heading--3 u-no-padding--top">{name}</p>
  </>
);

Organisation.propTypes = {
  name: PropTypes.string.isRequired,
};

export default Organisation;
