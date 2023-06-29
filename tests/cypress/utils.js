export const getRandomEmail = () =>
  `cypress-test-${Math.random().toString(36).substr(2, 10)}@canonical.com`;

export const slowDownResponse = (req) => {
  req.on("response", (res) => {
    // throttle the response to reduce test flakiness
    // this makes the UI loading & disabled states appear for longer
    res.setThrottle(100);
  });
};