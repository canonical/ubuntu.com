import { removeFalsy } from "./removeFalsy";

describe("removeFalsy", () => {
  it("removes falsy items in an array", () => {
    expect(
      removeFalsy(["one", 2, false, null, true, "", undefined, 0])
    ).toStrictEqual(["one", 2, true]);
  });
});
