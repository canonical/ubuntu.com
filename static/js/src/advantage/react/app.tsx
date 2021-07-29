import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

import { useLoadWindowData } from "./hooks";

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
      <section className="p-strip is-shallow">
        <div className="row">
          <div className="col-12" data-test="subscriptions-app">
            Content
          </div>
        </div>
      </section>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

const appRoot = document.getElementById("react-root");
if (appRoot) {
  ReactDOM.render(<App />, appRoot);
}
