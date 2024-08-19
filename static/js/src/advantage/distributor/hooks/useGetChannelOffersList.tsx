import { useQuery } from "@tanstack/react-query";

const useGetChannelOffersList = () => {
  const { isLoading, isError, isSuccess, data, error } = useQuery({
    queryKey: ["channelOffers"],
    queryFn: async () => {
      const response = await fetch(
        `/pro/channel-offers.json${window.location.search}`,
        {
          cache: "no-store",
        },
      );
      const res = await response.json();
      if (res.error) {
        if (res.error === "User has no purchase account") {
          return [];
        }
        throw new Error(res.error);
      }
      return res;
    },
  });
  return {
    isLoading: isLoading,
    isError: isError,
    isSuccess: isSuccess,
    data: data,
    error: error,
  };
};

export default useGetChannelOffersList;
