import { initHomepage } from "./init";

describe("initHomepage", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
    document.body.innerHTML = "";
  });

  it("calls start once per matching element, with that element", () => {
    document.body.innerHTML = `
      <div class="js-a" id="first"></div>
      <div class="js-a" id="second"></div>
    `;
    const start = jest.fn();

    initHomepage([{ selector: ".js-a", start }]);

    expect(start).toHaveBeenCalledTimes(2);
    expect(start).toHaveBeenNthCalledWith(1, document.getElementById("first"));
    expect(start).toHaveBeenNthCalledWith(2, document.getElementById("second"));
  });

  it("skips a module whose selector matches nothing", () => {
    const start = jest.fn();

    expect(() =>
      initHomepage([{ selector: ".js-missing", start }]),
    ).not.toThrow();
    expect(start).not.toHaveBeenCalled();
  });

  it("logs a throwing module and still starts the next one", () => {
    document.body.innerHTML = `<div class="js-a"></div><div class="js-b"></div>`;
    const error = new Error("boom");
    const failing = jest.fn(() => {
      throw error;
    });
    const next = jest.fn();

    initHomepage([
      { selector: ".js-a", start: failing },
      { selector: ".js-b", start: next },
    ]);

    expect(console.error).toHaveBeenCalledWith(expect.any(String), error);
    expect(next).toHaveBeenCalledWith(document.querySelector(".js-b"));
  });
});
