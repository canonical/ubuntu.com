import { useQuery } from "react-query";

const useGetOffersList = () => {
  const { isLoading, isError, isSuccess, data, error } = useQuery(
    ["Offers"],
    async () => {
      const response = await fetch(
        `/advantage/offers.json${window.location.search}`,
        {
          cache: "no-store",
        }
      );
      const res = await response.json();

      if (res.errors) {
        throw new Error(res.errors);
      }
      return res;
    }
  );

  return {
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    data: data,
    error: error,
  };
};

export default useGetOffersList;
