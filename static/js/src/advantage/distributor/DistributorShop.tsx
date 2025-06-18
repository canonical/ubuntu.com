import { useContext } from "react";
import DistributorShopForm from "./components/DistributorShopForm/DistributorShopForm";
import DistributorShopSummary from "./components/DistributorShopForm/DistributorShopSummary/DistributorShopSummary";
import { Strip } from "@canonical/react-components";
import { FormContext } from "./utils/FormContext";

const DistributorShop = () => {
  const { offer } = useContext(FormContext);

  if (!offer) {
    return (
      <Strip className="p-section">
        <h1>Something is wrong.</h1>
        <p>
          Initiate order again at <a href="/pro/distributor">this page</a>.
        </p>
      </Strip>
    );
  }

  return (
    <>
      <DistributorShopForm />
      <DistributorShopSummary />
    </>
  );
};

export default DistributorShop;
