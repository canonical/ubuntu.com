import { renderHook } from "@testing-library/react-hooks";
import { mount } from "enzyme";
import React from "react";

import { useScrollIntoView } from "./useScrollIntoView";

describe("useScrollIntoView", () => {
  let html: HTMLHtmlElement | null;
  let scrollToSpy: jest.Mock;

  beforeEach(() => {
    global.innerHeight = 500;
    html = document.querySelector("html");
    scrollToSpy = jest.fn();
    global.scrollTo = scrollToSpy;
  });

  afterEach(() => {
    if (html) {
      html.scrollTop = 0;
    }
  });

  it("does not scroll if the target is on screen", () => {
    if (html) {
      html.scrollTop = 10;
    }
    const { result } = renderHook(() => useScrollIntoView<HTMLDivElement>());
    const [targetRef, scrollIntoView] = result.current;
    mount(<div ref={targetRef}></div>);
    if (targetRef.current) {
      targetRef.current.getBoundingClientRect = () => ({ y: 10 } as DOMRect);
    }
    scrollIntoView();
    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it("scrolls if the target is off the top of the screen", () => {
    if (html) {
      html.scrollTop = 100;
    }
    const { result } = renderHook(() => useScrollIntoView<HTMLDivElement>());
    const [targetRef, scrollIntoView] = result.current;
    mount(<div ref={targetRef}></div>);
    if (targetRef.current) {
      targetRef.current.getBoundingClientRect = () => ({ y: -10 } as DOMRect);
    }
    scrollIntoView();
    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 90,
      left: 0,
      behavior: "smooth",
    });
  });
});
