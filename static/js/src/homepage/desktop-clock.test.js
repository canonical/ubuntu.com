import { formatClock, startDesktopClock } from "./desktop-clock";

// Tests run in UTC (see yarn test-js)
const SAT_0108 = new Date("2026-10-10T01:08:30Z");

it("follows the visitor's language", () => {
  expect(formatClock(SAT_0108, "en-GB")).toBe("Sat 10 Oct  01:08");
  expect(formatClock(SAT_0108, "en-US")).toBe("Sat Oct 10  01:08");
});

it("turns over on the minute", () => {
  jest.useFakeTimers();
  jest.setSystemTime(SAT_0108);
  const el = document.createElement("span");
  startDesktopClock(el);
  expect(el.textContent).toMatch(/01:08$/);
  jest.advanceTimersByTime(30000);
  expect(el.textContent).toMatch(/01:09$/);
  jest.useRealTimers();
});
