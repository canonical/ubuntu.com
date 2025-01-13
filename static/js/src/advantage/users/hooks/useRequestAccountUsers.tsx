import { useQuery } from "@tanstack/react-query";
import { requestAccountUsers } from "../api";

const useRequestAccountUsers = () => {
  const { isLoading, isError, isSuccess, data, error } = useQuery({
    queryKey: ["accountUsers"],
    queryFn: async () => {
      const res = await requestAccountUsers();
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

export default useRequestAccountUsers;
