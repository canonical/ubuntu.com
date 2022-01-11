import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import MicrocertsContainer from "./components/MicrocertsContainer";

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

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MicrocertsContainer />
    </QueryClientProvider>
  );
};

export default App;
