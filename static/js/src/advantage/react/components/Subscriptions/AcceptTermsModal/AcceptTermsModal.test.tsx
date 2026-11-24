import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as contracts from "advantage/api/contracts";
import AcceptTermsModal from "./AcceptTermsModal";

describe("AcceptTermsModal", () => {
  let queryClient: QueryClient;
  let acceptAccountTOSSpy: jest.SpyInstance;

  const renderModal = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <AcceptTermsModal accountId="account-1" onClose={jest.fn()} />
      </QueryClientProvider>,
    );

  beforeEach(() => {
    queryClient = new QueryClient();
    acceptAccountTOSSpy = jest.spyOn(contracts, "acceptAccountTOS");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("only enables continue once both terms are checked", () => {
    renderModal();
    const continueButton = screen.getByRole("button", { name: "Continue" });

    expect(continueButton).toBeDisabled();
    fireEvent.click(screen.getByLabelText(/Ubuntu Pro service terms/));
    expect(continueButton).toBeDisabled();
    fireEvent.click(screen.getByLabelText(/Ubuntu Pro description/));
    expect(continueButton).toBeEnabled();
  });

  it("registers the acceptance and updates the cached terms status", async () => {
    const acceptance = {
      accepted: true,
      accepted_at: "2026-11-19T10:00:00Z",
      email: "user@example.com",
    };
    acceptAccountTOSSpy.mockResolvedValue(acceptance);
    renderModal();

    fireEvent.click(screen.getByLabelText(/Ubuntu Pro service terms/));
    fireEvent.click(screen.getByLabelText(/Ubuntu Pro description/));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() =>
      expect(queryClient.getQueryData(["accountTOS", "account-1"])).toEqual(
        acceptance,
      ),
    );
    expect(acceptAccountTOSSpy).toHaveBeenCalledWith("account-1");
  });

  it("shows an error if the acceptance fails", async () => {
    acceptAccountTOSSpy.mockResolvedValue({ errors: "Something went wrong" });
    renderModal();

    fireEvent.click(screen.getByLabelText(/Ubuntu Pro service terms/));
    fireEvent.click(screen.getByLabelText(/Ubuntu Pro description/));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(
      await screen.findByText("Could not accept the terms:"),
    ).toBeInTheDocument();
  });
});
