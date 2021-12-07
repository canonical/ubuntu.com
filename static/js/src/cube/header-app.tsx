import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import CubeHeader from "./components/CubeHeader";
import useMicrocertsData from "./hooks/useMicrocertsData";

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
  const {
    modules,
    certifiedBadge,
    hasEnrollments,
    isLoading,
  } = useMicrocertsData();

  return (
    <CubeHeader
      modules={modules}
      certifiedBadge={certifiedBadge}
      hasEnrollments={hasEnrollments}
      isLoading={isLoading}
    />
  );
};

const HeaderApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
};

export default HeaderApp;
