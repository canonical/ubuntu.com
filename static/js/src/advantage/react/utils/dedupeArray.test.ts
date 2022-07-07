import { dedupeArray } from "./dedupeArray";

describe("dedupeArray", () => {
  it("dedupes items in an array", () => {
    expect(
      dedupeArray(["one", "two", "one", null, true, "three"])
    ).toStrictEqual(["one", "two", null, true, "three"]);
  });
});
