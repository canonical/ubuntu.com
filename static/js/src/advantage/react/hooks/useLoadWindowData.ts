import type { QueryClient } from "react-query";

const getWindowData = () => ({});

export const useLoadWindowData = (queryClient: QueryClient) => {
  const windowData = getWindowData();
  // TODO fetch the stripe key:
  // https://github.com/canonical-web-and-design/ubuntu.com/pull/10423
  console.log(windowData, queryClient.isFetching());
};
