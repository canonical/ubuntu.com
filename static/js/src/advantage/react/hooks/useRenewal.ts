import { useMutation } from "@tanstack/react-query";
import { postRenewalIDToProcessPayment } from "../../api/contracts";

const useRenewal = (renewalID: string | null) => {
  const mutation = useMutation({
    mutationFn: async () => {
      if (!renewalID) {
        throw new Error("Renewal ID is required");
      }
      const response = await postRenewalIDToProcessPayment(renewalID);

      if (response.errors) {
        throw new Error(response.errors);
      }
      return response;
    },
  });

  return mutation;
};

export default useRenewal;
