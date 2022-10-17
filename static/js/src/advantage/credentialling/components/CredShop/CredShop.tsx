import React from "react";
import { Link } from "react-router-dom";
const CredShop = () => {
  return (
    <>
      <h1>Shop</h1>
      <Link to={"/cred-manage"}>manage</Link>
    </>
  );
};
export default CredShop;
