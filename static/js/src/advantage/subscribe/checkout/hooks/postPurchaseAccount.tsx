import { useMutation } from "react-query";
import { ensurePurchaseAccount } from "advantage/api/contracts";
import { FormValues } from "../utils/types";

type AccountData = {
  accountId: string;
};

type Props = {
  formData: FormValues;
};

const postPurchaseAccount = () => {
  const mutation = useMutation<AccountData, Error, Props>(
    async ({ formData }: Props): Promise<AccountData> => {
      const {
        name,
        email,
        buyingFor,
        organisationName,
        captchaValue,
        marketplace,
      } = formData;

      const accountRes = await ensurePurchaseAccount({
        email: email,
        accountName: buyingFor === "myself" ? name : organisationName,
        captchaValue,
        marketplace,
      });

      if (accountRes.errors) {
        const errors = JSON.parse(accountRes.errors);

        throw new Error(errors?.decline_code ?? errors.code);
      }

      return { accountId: accountRes.id };
    }
  );

  return mutation;
};

export default postPurchaseAccount;
