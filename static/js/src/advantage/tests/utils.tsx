import React from "react";
import { render, screen, MatcherFunction } from "@testing-library/react";
import { QueryClient, QueryClientProvider, setLogger } from "react-query";

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

export const getQueryClientWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  setLogger({
    log: console.log,
    warn: console.warn,
    error: () => {},
  });

  const Wrapper = ({ children }: { children?: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return Wrapper;
};

export const renderWithQueryClient = (ui: React.ReactElement) =>
  render(ui, {
    wrapper: getQueryClientWrapper(),
  });
