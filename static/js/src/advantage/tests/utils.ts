import { screen, MatcherFunction } from "@testing-library/react";

const getTextContentMatcher = (textMatch: string | RegExp): MatcherFunction => (
  _content,
  node
) => {
  const hasText = (node: Element | null) =>
    node?.textContent === textMatch || !!node?.textContent?.match(textMatch);
  const nodeHasText = hasText(node);
  const childrenDontHaveText = node?.children
    ? Array.from(node.children).every((child) => !hasText(child))
    : true;

  return nodeHasText && childrenDontHaveText;
};

// use only if a regular "getByText" query is not working, this is much slower
// https://github.com/testing-library/dom-testing-library/issues/410#issuecomment-797486513
export const getByTextContent = (text: string | RegExp) =>
  screen.getByText(getTextContentMatcher(text));
