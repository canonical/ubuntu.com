import { useQuery } from "react-query";

type TaxResponse = {
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
};

const useGetTaxAmount = () => {
  const { data } = useQuery<TaxResponse | null>(
    "taxCalulations",
    async () => {
      return null;
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
