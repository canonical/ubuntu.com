import { createTypewriter } from "./typewriter";

const WORDS = ["docker", "git"];
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
  writer = createTypewriter(el, WORDS, { typeMs: 90, holdMs: 1500 });
});

afterEach(() => jest.useRealTimers());

describe("createTypewriter", () => {
  it("types the first word one character per 90ms", () => {
    writer.start();
    tick(90 * 3);

    expect(typed()).toBe("doc");
  });

  it("holds, deletes, then types the next word", () => {
    writer.start();
    tick(90 * 6 + 1400);
    expect(typed()).toBe("docker");

    tick(100 + 90 * 5);
    expect(typed()).toBe("");

    tick(90 * 2);
    expect(typed()).toBe("gi");
  });

  it("freezes on stop and resumes on start", () => {
    writer.start();
    tick(90 * 2);

    writer.stop();
    tick(2000);
    expect(typed()).toBe("do");

    writer.start();
    tick(90);
    expect(typed()).toBe("doc");
  });

  it("restores the static list on reset, read once by screen readers", () => {
    writer.start();
    expect(el.querySelector(".u-off-screen").textContent).toBe(STATIC);

    tick(500);
    writer.reset();

    expect(el.textContent).toBe(STATIC);
    expect(el.querySelector("[aria-hidden]")).toBeNull();
  });
});
