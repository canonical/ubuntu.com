export type URLs = {
  [path: string]: URLs | string;
};

export const APP_URLS = {
  account: {
    paymentMethods: "/account/payment-methods",
  },
  advantage: {
    offers: "/pro/offers",
    users: "/pro/users",
  },
};

/**
 * Fetch the URL definition via a function to make testing easier.
 */
export const getURLs = () => APP_URLS;

/**
 * This hook creates the URLS for the app with the test backend flag applied if
 * it should be present.
 */
export const useURLs = () => {
  const urls = getURLs();
  return urls;
};
