import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Duration from "./Duration";
import {
  FormContext,
  defaultValues,
} from "advantage/distributor/utils/FormContext";
import { Durations } from "advantage/distributor/utils/utils";

const mockSetDuration = jest.fn();

const mockContextValue = {
  duration: Durations.one,
  setDuration: mockSetDuration,
};

const renderComponent = () => {
  render(
    <FormContext.Provider value={{ ...defaultValues, ...mockContextValue }}>
      <Duration />
    </FormContext.Provider>,
  );
};

describe("Duration Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("Should render correctly", () => {
    renderComponent();

    const wrapper = screen.getByTestId("wrapper");
    expect(wrapper).toBeInTheDocument();

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("1 year")).toBeInTheDocument();
    expect(screen.getByText("2 years")).toBeInTheDocument();
    expect(screen.getByText("3 years")).toBeInTheDocument();
  });

  test("Should update duration and localStorage on select change", async () => {
    renderComponent();

    const selectElement = screen.getByRole("combobox");
    fireEvent.change(selectElement, { target: { value: Durations.two } });

    await waitFor(() => {
      expect(mockSetDuration).toHaveBeenCalledWith(Durations.two);
      expect(localStorage.getItem("distributor-selector-duration")).toBe(
        JSON.stringify(Durations.two),
      );
    });
  });
});
