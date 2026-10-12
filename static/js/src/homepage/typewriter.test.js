import { createTypewriter } from "./typewriter";

const STATIC = "$ sudo snap install docker/git";
let el;
let writer;

const typed = () =>
  el
    .querySelector("[aria-hidden]")
    .textContent.replace("$ sudo snap install ", "");
const tick = (ms) => jest.advanceTimersByTime(ms);

beforeEach(() => {
  jest.useFakeTimers();
  document.body.innerHTML = `<code>${STATIC}</code>`;
  el = document.querySelector("code");
  writer = createTypewriter(el, { typeMs: 90, holdMs: 1500 });
  writer.start();
});

afterEach(() => jest.useRealTimers());

describe("createTypewriter", () => {
  it("leads in, types, holds, deletes, then types the next word", () => {
    tick(1499);
    expect(typed()).toBe("");

    tick(1 + 90 * 5 + 1400);
    expect(typed()).toBe("docker");

    tick(100 + 90 * 5);
    expect(typed()).toBe("");

    tick(90 * 2);
    expect(typed()).toBe("gi");
  });

  it("freezes on stop and resumes on start", () => {
    tick(1500 + 90);

    writer.stop();
    tick(2000);
    expect(typed()).toBe("do");

    writer.start();
    tick(90);
    expect(typed()).toBe("doc");
  });

  it("restores the static list on reset, read once by screen readers", () => {
    expect(el.querySelector(".u-off-screen").textContent).toBe(STATIC);

    writer.reset();

    expect(el.textContent).toBe(STATIC);
    expect(el.querySelector("[aria-hidden]")).toBeNull();
  });
});
