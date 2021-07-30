import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useMutation } from "react-query";
import {
  ensurePurchaseAccount,
  postCustomerInfoToStripeAccount,
} from "../../../api/contracts";

const registerPaymentMethod = () => {
  const stripe = useStripe();
  const elements = useElements();

  const mutation = useMutation(async (formData) => {
    const {
      name,
      buyingFor,
      organisationName,
      email,
      address,
      city,
      country,
      postalCode,
      usState,
      caProvince,
      VATNumber,
    } = formData;

    const card = elements.getElement(CardElement);

    const addressObject = {
      city: city,
      country: country,
      line1: address,
      postal_code: postalCode,
      state: country === "US" ? usState : caProvince,
    };

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: card,
      billing_details: {
        name: name,
        email: email,
        address: addressObject,
      },
    });

    if (error) {
      throw new Error(error.code);
    }
    var accountRes = { accountID: window.accountId };

    if (!accountRes.accountID) {
      accountRes = await ensurePurchaseAccount({
        email: email,
        accountName: buyingFor === "myself" ? name : organisationName,
        paymentMethodID: paymentMethod.id,
        country,
      });

      if (accountRes.code) {
        if (accountRes.code === "unauthorized") {
          throw new Error("email_already_exists");
        } else {
          throw new Error(
            JSON.parse(accountRes.message)?.decline_code || accountRes.code
          );
        }
      }
    }

    const customerInfoRes = await postCustomerInfoToStripeAccount({
      paymentMethodID: paymentMethod.id,
      accountID: accountRes.accountID,
      address: addressObject,
      name: name,
      taxID: {
        type: "eu_vat",
        value: VATNumber,
      },
    });

    if (customerInfoRes.errors) {
      //We ignore VAT errors but throw the others
      if (JSON.parse(customerInfoRes.errors).code !== "tax_id_invalid") {
        throw new Error(JSON.parse(customerInfoRes.errors).code);
      }
    }

    return {
      accountId: accountRes.accountID,
      paymentMethod: paymentMethod.card,
    };
  });

  return mutation;
};

export default registerPaymentMethod;
