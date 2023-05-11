import React from "react";
import { Link } from "react-router-dom";
import ExamSummary from "./ExamSummary/ExamSummary";
const CredShop = () => {
  return (
    <>
      <h1>Shop</h1>
      <Link to={"/manage"}>manage</Link>
      <ExamSummary />
    </>
  );
};
export default CredShop;
