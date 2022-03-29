import { useQuery } from "react-query";
import { requestAccountUsers } from "../api";

const useRequestAccountUsers = () => {
  const { isLoading, isError, isSuccess, data, error } = useQuery(
    "accountUsers",
    async () => {
      try {
        await requestAccountUsers();
      } catch (error) {
        if (error?.response?.status === 404) {
          return ([]);
        } else {
          throw(error);
        }
      }
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

export default useRequestAccountUsers;
