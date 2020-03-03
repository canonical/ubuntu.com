describe("example", () => {
  it("does some maths", () => {
    expect(2).toEqual(2);
  });
});

describe("failing test", () => {
  it("fails", () => {
    expect(5).toBe("seventy four");
  });
});
