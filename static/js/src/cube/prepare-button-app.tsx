import React from "react";
import ReactDOM from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ActionButton, Notification } from "@canonical/react-components";
import PrepareButton from "./components/PrepareButton";
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

const PrepareButtonApp = () => {
  const { studyLabs, isLoading, isError } = useMicrocertsData();
  const buttonText =
    studyLabs["status"] === "enrolled"
      ? "Access study labs"
      : "Purchase study labs access";

  return (
    <>
      {isLoading ? (
        <ActionButton appearance="positive" loading={isLoading}>
          {buttonText}
        </ActionButton>
      ) : isError ? (
        <Notification severity="negative" title="Error">
          We could not verify if you have access to the study labs.
        </Notification>
      ) : (
        <PrepareButton
          studyLabURL={String(studyLabs["take_url"])}
          productName={String(studyLabs["name"])}
          productListingId={String(studyLabs["product_listing_id"])}
          isEnrolled={studyLabs["status"] === "enrolled"}
          buttonText={buttonText}
          buttonAppearance="positive"
        />
      )}
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <PrepareButtonApp />
    </QueryClientProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("prepare-button-react"));
