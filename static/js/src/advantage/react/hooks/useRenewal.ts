import { useMutation } from "react-query";
import { postRenewalIDToProcessPayment } from "../../api/contracts";

const useRenewal = () => {
  const mutation = useMutation(async (renewalID: string | null) => {
    if (!renewalID) {
      throw new Error("RenewalID is missing");
    }

    const res = await postRenewalIDToProcessPayment(renewalID);

    if (res.errors) {
      throw new Error(res.errors);
    }

    return res.id;
  });

  return mutation;
};

export default useRenewal;
