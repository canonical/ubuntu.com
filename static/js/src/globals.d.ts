export {};

export type DataLayerEvent = {
  event: string;
  eventAction: string;
  eventCategory: string;
  eventLabel?: string;
  eventValue?: number;
};

declare global {
  interface Window {
    // The tag manager is included as a global variable in the base template.
    dataLayer?: DataLayerEvent[];
  }
}
