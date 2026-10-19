/**
 * Regression tests for the public cloud cost formula in the Ceph pricing
 * calculator (WD-38476).
 *
 * The formula previously subtracted a flat `500` from
 * `selectedStorage * 1024 * 1024` before multiplying by the per-GB rate,
 * instead of converting the 500 TB "included" allowance to the same unit
 * first. This produced an inflated public cloud cost estimate. The fixed
 * formula is:
 *
 *   (selectedStorage * 1024 - 500) * 1024 * 0.021
 *
 * `calculatePublicCloudCost` is exported via a CommonJS-guarded
 * `module.exports` (this file is loaded as a plain, non-bundled browser
 * script, so it can't use ES module `export`), which is a no-op in the
 * browser and only used here so the formula can be unit tested directly.
 *
 * Note: requiring this module also runs its top-level side effects
 * (`initializeSliders()`), which queries `#compare-costs-form`, so a
 * minimal stub of that element must exist in the DOM before requiring it.
 */

document.body.innerHTML = `<form id="compare-costs-form"></form>`;
const { calculatePublicCloudCost } = require("./ceph-pricing-calculator.js");

describe("calculatePublicCloudCost", () => {
  it("calculates the correct cost for 9 (TB) over 12 months", () => {
    expect(calculatePublicCloudCost(9, 12)).toBeCloseTo(2384928.768, 2);
  });

  it("calculates the correct cost for 2.25 (TB) over 1 month", () => {
    expect(calculatePublicCloudCost(2.25, 1)).toBeCloseTo(50108.416, 2);
  });

  it("calculates the correct cost for 18 (TB) over 36 months", () => {
    expect(calculatePublicCloudCost(18, 36)).toBeCloseTo(14289297.408, 2);
  });

  it("scales linearly with the number of months", () => {
    const oneMonth = calculatePublicCloudCost(9, 1);
    expect(calculatePublicCloudCost(9, 12)).toBeCloseTo(oneMonth * 12, 6);
  });
});
