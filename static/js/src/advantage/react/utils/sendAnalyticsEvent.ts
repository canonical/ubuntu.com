import { DataLayerEvent } from "globals";

export const sendAnalyticsEvent = (
  analyticsEvent: Omit<DataLayerEvent, "event">
) => {
  window.dataLayer?.push({
    event: "GAEvent",
    ...analyticsEvent,
  });
};
