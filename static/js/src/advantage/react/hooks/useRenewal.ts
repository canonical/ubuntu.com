import { useMutation } from "@tanstack/react-query";
import { postRenewalIDToProcessPayment } from "../../api/contracts";

const useRenewal = (renewalID: string | null) => {
  const mutation = useMutation({
    mutationFn: async () => {
      if (!renewalID) {
        throw new Error("Renewal ID is required");
      }
      const res = await postRenewalIDToProcessPayment(renewalID);

      if (res.errors) {
        throw new Error(res.errors);
      }
      return res.id;
    },
  });

  return mutation;
};

export default useRenewal;
