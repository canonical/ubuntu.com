import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

import { useLoadWindowData } from "./hooks";
import Subscriptions from "./components/Subscriptions";

const oneHour = 1000 * 60 * 60;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: oneHour,
      retryOnMount: false,
    },
  },
});

export const App = () => {
  useLoadWindowData(queryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <Subscriptions />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

const appRoot = document.getElementById("react-root");
if (appRoot) {
  ReactDOM.render(<App />, appRoot);
}
