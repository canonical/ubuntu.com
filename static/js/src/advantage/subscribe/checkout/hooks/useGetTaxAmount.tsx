import { useQuery } from "react-query";
import { TaxInfo } from "../utils/types";

const useGetTaxAmount = () => {
  const { data } = useQuery<TaxInfo | undefined>(
    "taxCalulations",
    async () => {
      return undefined;
    },
    {
      retry: false,
    }
  );

  return {
    data: data,
  };
};

export default useGetTaxAmount;
