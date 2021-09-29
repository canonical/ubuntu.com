import { screen, MatcherFunction } from "@testing-library/react";
import { User } from "../users/types";

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

const getRandomString = () => `${Math.random().toString(36).substr(2, 10)}`;
export const getRandomUser = (): User => {
  const name = getRandomString();
  return {
    name,
    email: `${name}@ecorp.com`,
    role: "admin",
    lastLoginAt: "2021-02-15T13:45:00Z",
  };
};
