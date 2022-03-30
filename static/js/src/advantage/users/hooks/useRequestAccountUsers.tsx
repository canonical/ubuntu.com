import { useQuery } from "react-query";
import { requestAccountUsers } from "../api";

const useRequestAccountUsers = () => {
  const { isLoading, isError, isSuccess, data, error } = useQuery(
    "accountUsers",
    async () => {
      try {
        const res = await requestAccountUsers();

        return res;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("cannot find purchase account")
        ) {
          return undefined;
        } else {
          throw error;
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
