import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <section className="p-strip is-shallow">
      <div className="row">
        <div className="col-12">Content</div>
      </div>
    </section>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

ReactDOM.render(<App />, document.getElementById("react-root"));
