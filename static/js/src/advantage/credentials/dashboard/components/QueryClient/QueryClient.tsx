import {
  QueryClient as Client,
  QueryClientProvider,
} from "@tanstack/react-query";

const oneHour = 1000 * 60 * 60;
const queryClient = new Client({
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

type Props = {
  children: React.ReactNode;
};

const QueryClient = (props: Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
};

export default QueryClient;
