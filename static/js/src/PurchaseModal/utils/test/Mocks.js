export const preview = {
  amountDue: 14031,
  currency: "usd",
  customerAddress: {
    city: "London",
    country: "GB",
    line1: "23 Carleton Rd",
    line2: "",
    postal_code: "N7 0QZ",
    state: "",
  },
  customerEmail: "tim.bisley@spaced.com",
  customerName: "Tim Bisley",
  id: {
    IDs: {
      0: "",
    },
    origin: "Stripe",
  },
  identifier: "40B2AD28-0074",
  lineItems: {
    0: {
      currency: "usd",
      description:
        "Unused time on 42 × UA Infrastructure - Essential (Physical) after 29 Jul 2021",
      planID: {
        IDs: {
          0: "CO4VF1902",
        },
        origin: "Stripe",
      },
      proRatedAmount: -491114,
      quantity: 42,
    },
    1: {
      currency: "usd",
      description:
        "Remaining time on 43 × UA Infrastructure - Essential (Physical) after 29 Jul 2021",
      planID: {
        IDs: {
          0: "CO4VF1902",
        },
        origin: "Stripe",
      },
      proRatedAmount: 502807,
      quantity: 43,
    },
  },
  reason: "upcoming",
  status: "draft",
  subscriptionEndOfCycle: "2022-02-03T16:32:54Z",
  subscriptionID: {
    IDs: {
      0: "sub_IsZQrABghMojbd",
    },
    origin: "Stripe",
  },
  subscriptionStartOfCycle: "2021-02-03T16:32:54Z",
  taxAmount: 2338,
  total: 14031,
};

export const userInfo = {
  accountInfo: {
    createdAt: "2021-02-03T16:31:58Z",
    externalAccountIDs: {
      0: {
        IDs: {
          0: "cus_IsZPfDL456aKUZ",
        },
        origin: "Stripe",
      },
      1: {
        IDs: {
          0: "0012500001NNQpbAAH",
        },
        origin: "Salesforce",
      },
    },
    id: "aBe5SKIDeTMFTwNJY0X9BNrLIKd0tFeMrnciM2llSS_0",
    name: "Doktor Mandrake",
  },
  customerInfo: {
    address: {
      city: "London",
      country: "GB",
      line1: "23 Carleton Rd",
      line2: "",
      postal_code: "N7 0QZ",
      state: "",
    },
    defaultPaymentMethod: {
      brand: "mastercard",
      country: "US",
      expMonth: 4,
      expYear: 2044,
      id: "pm_1JHUiLCzjFajHovdTdla5G5e",
      last4: "4444",
    },
    email: "tim.bisley@spaced.com",
    name: "Tim Bisley",
    taxID: {
      type: "eu_vat",
      value: "GB123123123123",
    },
  },
};
