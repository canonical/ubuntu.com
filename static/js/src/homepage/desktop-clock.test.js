import { formatClock, startDesktopClock } from "./desktop-clock";

// Tests run in UTC (see yarn test-js)
const SAT_0108 = new Date("2026-10-10T01:08:30Z");

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(SAT_0108);
});

afterEach(() => jest.useRealTimers());

it("follows the visitor's language", () => {
  expect(formatClock(SAT_0108, "en-GB")).toBe("Sat 10 Oct  01:08");
  expect(formatClock(SAT_0108, "en-US")).toBe("Sat Oct 10  01:08");
});

it("turns over on the minute", () => {
  const el = document.createElement("time");
  const stop = startDesktopClock(el);
  expect(el.textContent).toMatch(/01:08$/);
  jest.advanceTimersByTime(30000);
  expect(el.textContent).toMatch(/01:09$/);
  stop();
});

it("catches up when the tab is shown again", () => {
  const el = document.createElement("time");
  const stop = startDesktopClock(el);
  jest.setSystemTime(new Date("2026-10-10T03:00:00Z"));
  document.dispatchEvent(new Event("visibilitychange"));
  expect(el.textContent).toMatch(/03:00$/);
  stop();
});

it("stops ticking when stopped", () => {
  const el = document.createElement("time");
  startDesktopClock(el)();
  jest.advanceTimersByTime(60000);
  expect(el.textContent).toMatch(/01:08$/);
});
