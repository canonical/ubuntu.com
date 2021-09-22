import { DataLayerEvent } from "globals";
import { sendAnalyticsEvent } from "./sendAnalyticsEvent";

describe("sendAnalyticsEvent", () => {
  let initialDataLayer: DataLayerEvent[] | undefined = [];

  beforeAll(() => {
    initialDataLayer = window.dataLayer;
  });

  afterEach(() => {
    window.dataLayer = initialDataLayer;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("sends an event", () => {
    Object.defineProperty(window, "dataLayer", {
      value: [],
      writable: true,
    });
    sendAnalyticsEvent({
      eventAction: "clicked",
      eventCategory: "button",
    });
    expect(window.dataLayer).toStrictEqual([
      {
        event: "GAEvent",
        eventAction: "clicked",
        eventCategory: "button",
      },
    ]);
  });

  it("does not error if the data layer was not added to the window", () => {
    expect(() =>
      sendAnalyticsEvent({
        eventAction: "clicked",
        eventCategory: "button",
      })
    ).not.toThrow();
  });
});
