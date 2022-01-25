export type URLs = {
  [path: string]: URLs | string;
};

export const APP_URLS = {
  account: {
    paymentMethods: "/account/payment-methods",
  },
  advantage: {
    offers: "/advantage/offers",
  },
};

/**
 * Fetch the URL definition via a function to make testing easier.
 */
export const getURLs = () => APP_URLS;

/**
 * Recursively append the test backend param. This function uses a generic to
 * infer the shape of the object so that the types are not lost as it transfroms
 * it.
 */
const appendTestBackend = <U extends URLs>(urls: U): U => {
  Object.entries(urls).forEach(
    ([key, pathOrSection]: [keyof U, URLs | string]) => {
      let updatedPathOrSection = pathOrSection;
      if (typeof pathOrSection === "string") {
        // Only append the flag if it doesn't already exist.
        if (!pathOrSection.includes("test_backend=true")) {
          const querySeparator = pathOrSection.includes("?") ? "&" : "?";
          updatedPathOrSection = `${pathOrSection}${querySeparator}test_backend=true`;
        }
      } else {
        // This is an object of URLs, so append the flag to the children of this
        // section.
        updatedPathOrSection = appendTestBackend(pathOrSection);
      }
      urls[key] = updatedPathOrSection as U[keyof U];
    }
  );
  return urls;
};

/**
 * This hook creates the URLS for the app with the test backend flag applied if
 * it should be present.
 */
export const useURLs = () => {
  const params = new URLSearchParams(window.location.search);
  const usingTestBackend = params.get("test_backend") === "true";
  const urls = getURLs();
  return usingTestBackend ? appendTestBackend(urls) : urls;
};
