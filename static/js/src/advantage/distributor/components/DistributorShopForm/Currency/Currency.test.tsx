import { render, screen, fireEvent } from "@testing-library/react";
import Currency from "./Currency";
import {
  FormContext,
  defaultValues,
} from "advantage/distributor/utils/FormContext";
import {
  Currencies,
  DISTRIBUTOR_SELECTOR_KEYS,
} from "advantage/distributor/utils/utils";

const mockSetCurrency = jest.fn();
const mockCurrency = Currencies.usd;

const renderComponent = () => {
  render(
    <FormContext.Provider
      value={{
        ...defaultValues,
        currency: mockCurrency,
        setCurrency: mockSetCurrency,
      }}
    >
      <Currency />
    </FormContext.Provider>,
  );
};

describe("Test Currency Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("Shoould render correctly", () => {
    renderComponent();

    expect(screen.getByTestId("wrapper")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  test("Should update currency and local storage on change", () => {
    renderComponent();

    const selectElement = screen.getByRole("combobox");

    fireEvent.change(selectElement, { target: { value: Currencies.gbp } });

    expect(mockSetCurrency).toHaveBeenCalledWith(Currencies.gbp);

    expect(localStorage.getItem(DISTRIBUTOR_SELECTOR_KEYS.CURRENCY)).toBe(
      JSON.stringify(Currencies.gbp),
    );
  });
});
