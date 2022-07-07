import { formatDate } from "./formatDate";

describe("formatDate", () => {
  it("can parse and format a date", () => {
    expect(formatDate("2021-07-09T07:14:56Z")).toBe("09 Jul 2021");
  });

  it("returns the unformatted date if it can't be parsed", () => {
    expect(formatDate("abcd")).toBe("abcd");
  });
});
