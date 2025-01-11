import { render, screen, fireEvent } from "@testing-library/react";
import AddSubscriptions from "./AddSubscriptions";
import { FormContext, defaultValues } from "../../../utils/FormContext";
import {
  DistributorProductTypes as ProductTypes,
  SubscriptionItem,
  SLA as SLAEnum,
  Support as SupportEnum,
  DISTRIBUTOR_SELECTOR_KEYS,
} from "advantage/distributor/utils/utils";

const mockSetProductType = jest.fn();
const mockSetSubscriptionList = jest.fn();

jest.mock("advantage/distributor/utils/utils", () => ({
  ...jest.requireActual("advantage/distributor/utils/utils"),
  generateUniqueId: jest.fn(() => "mocked-id-1"),
}));

const mockContextValue = {
  ...defaultValues,
  productType: ProductTypes.physical,
  setProductType: mockSetProductType,
  subscriptionList: [] as SubscriptionItem[],
  setSubscriptionList: mockSetSubscriptionList,
};

const renderComponent = (contextValue = mockContextValue) => {
  render(
    <FormContext.Provider value={contextValue}>
      <AddSubscriptions />
    </FormContext.Provider>,
  );
};

describe("AddSubscriptions Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.resetModules();
  });

  test("Should render correctly", () => {
    renderComponent();
    const wrapper = screen.getByTestId("wrapper");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveTextContent(
      "Ubuntu Pro is available for Ubuntu 14.04 and higher:",
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Add")).toBeInTheDocument();
  });

  test("Should updates productType and localStorage on select change", () => {
    renderComponent();

    const selectElement = screen.getByRole("combobox");
    fireEvent.change(selectElement, {
      target: { value: ProductTypes.desktop },
    });

    expect(mockSetProductType).toHaveBeenCalledWith(ProductTypes.desktop);
    expect(localStorage.getItem(DISTRIBUTOR_SELECTOR_KEYS.PRODUCT_TYPE)).toBe(
      JSON.stringify(ProductTypes.desktop),
    );
  });

  test("Should add a subscription (Physical) and updates context and localStorage on button click", () => {
    renderComponent();

    fireEvent.click(screen.getByText("Add"));
    const expectedSubscriptionItem: SubscriptionItem = {
      id: "mocked-id-1",
      type: ProductTypes.physical,
      sla: SLAEnum.none,
      support: SupportEnum.none,
      quantity: 1,
    };

    expect(mockSetSubscriptionList).toHaveBeenCalledWith([
      expectedSubscriptionItem,
    ]);

    expect(
      localStorage.getItem(DISTRIBUTOR_SELECTOR_KEYS.SUBSCRIPTION_LIST),
    ).toBe(JSON.stringify([expectedSubscriptionItem]));
  });

  test("Should add a subscription (Desktop) and updates context and localStorage on button click", () => {
    renderComponent();

    fireEvent.click(screen.getByText("Add"));
    const expectedSubscriptionItem = {
      id: "mocked-id-1",
      type: ProductTypes.physical,
      sla: SLAEnum.none,
      support: SupportEnum.none,
      quantity: 1,
    };

    expect(mockSetSubscriptionList).toHaveBeenCalledWith([
      expectedSubscriptionItem,
    ]);

    expect(
      localStorage.getItem(DISTRIBUTOR_SELECTOR_KEYS.SUBSCRIPTION_LIST),
    ).toBe(JSON.stringify([expectedSubscriptionItem]));
  });

  test("Should add a subscription (Virtual) and updates context and localStorage on button click", () => {
    renderComponent();
    fireEvent.click(screen.getByText("Add"));
    const expectedSubscriptionItem = {
      id: "mocked-id-1",
      type: ProductTypes.physical,
      sla: SLAEnum.none,
      support: SupportEnum.none,
      quantity: 1,
    };

    expect(mockSetSubscriptionList).toHaveBeenCalledWith([
      expectedSubscriptionItem,
    ]);

    expect(
      localStorage.getItem(DISTRIBUTOR_SELECTOR_KEYS.SUBSCRIPTION_LIST),
    ).toBe(JSON.stringify([expectedSubscriptionItem]));
  });
  test("Should render SubscriptionCard components based on subscriptionList", () => {
    const mockSubscriptionList: SubscriptionItem[] = [
      {
        id: "mocked-id-1",
        type: ProductTypes.physical,
        sla: SLAEnum.none,
        support: SupportEnum.none,
        quantity: 1,
      },
    ];

    mockContextValue.subscriptionList = mockSubscriptionList;

    renderComponent(mockContextValue);
    expect(screen.getByTestId("wrapper")).toBeInTheDocument();
    const heading = screen.getByRole("heading", {
      name: /Ubuntu Pro Physical/i,
    });
    expect(heading).toBeInTheDocument();
  });

  test("Should render multiple SubscriptionCard components based on subscriptionList", () => {
    const { generateUniqueId } = require("advantage/distributor/utils/utils");

    generateUniqueId
      .mockImplementationOnce(() => "mocked-id-1")
      .mockImplementationOnce(() => "mocked-id-2")
      .mockImplementationOnce(() => "mocked-id-3");

    const mockSubscriptionList: SubscriptionItem[] = [
      {
        id: "mocked-id-1",
        type: ProductTypes.physical,
        sla: SLAEnum.none,
        support: SupportEnum.none,
        quantity: 1,
      },
      {
        id: "mocked-id-2",
        type: ProductTypes.desktop,
        sla: SLAEnum.none,
        support: SupportEnum.none,
        quantity: 1,
      },
      {
        id: "mocked-id-3",
        type: ProductTypes.virtual,
        sla: SLAEnum.none,
        support: SupportEnum.none,
        quantity: 1,
      },
    ];

    mockContextValue.subscriptionList = mockSubscriptionList;

    renderComponent(mockContextValue);
    expect(screen.getByTestId("wrapper")).toBeInTheDocument();
    const headingPhysical = screen.getByRole("heading", {
      name: /Ubuntu Pro Physical/i,
    });
    const headingDesktop = screen.getByRole("heading", {
      name: /Ubuntu Pro Desktop/i,
    });
    const headingVirtual = screen.getByRole("heading", {
      name: /Ubuntu Pro Virtual/i,
    });

    expect(headingPhysical).toBeInTheDocument();
    expect(headingDesktop).toBeInTheDocument();
    expect(headingVirtual).toBeInTheDocument();
  });

  test("Should remove SubscriptionCard components based on subscriptionList", () => {
    const mockSubscriptionList: SubscriptionItem[] = [
      {
        id: "mocked-id-1",
        type: ProductTypes.physical,
        sla: SLAEnum.none,
        support: SupportEnum.none,
        quantity: 1,
      },
    ];

    mockContextValue.subscriptionList = mockSubscriptionList;
    renderComponent(mockContextValue);

    expect(screen.getByTestId("wrapper")).toBeInTheDocument();
    const heading = screen.getByRole("heading", {
      name: /Ubuntu Pro Physical/i,
    });
    expect(heading).toBeInTheDocument();

    const removeButton = screen.getByTestId("remove-subscription");
    expect(removeButton).toBeInTheDocument();

    fireEvent.click(removeButton);

    expect(mockSetSubscriptionList).toHaveBeenCalledWith([]);

    const subscriptionCard = screen.queryByTestId("subscription-card");
    expect(subscriptionCard).not.toBeInTheDocument();
  });

  test("Should update quantity of SubscriptionCard components based on subscriptionList", () => {
    const mockSubscriptionList: SubscriptionItem[] = [
      {
        id: "mocked-id-1",
        type: ProductTypes.physical,
        sla: SLAEnum.none,
        support: SupportEnum.none,
        quantity: 1,
      },
    ];

    mockContextValue.subscriptionList = mockSubscriptionList;
    renderComponent(mockContextValue);

    expect(screen.getByTestId("wrapper")).toBeInTheDocument();
    const heading = screen.getByRole("heading", {
      name: /Ubuntu Pro Physical/i,
    });
    expect(heading).toBeInTheDocument();

    const quantityInput = screen.getByTestId("quantity-input");
    expect(quantityInput).toBeInTheDocument();

    fireEvent.change(quantityInput, { target: { value: "2" } });

    expect(mockSetSubscriptionList).toHaveBeenCalledWith([
      {
        id: "mocked-id-1",
        type: ProductTypes.physical,
        sla: SLAEnum.none,
        support: SupportEnum.none,
        quantity: 2,
      },
    ]);
  });

  test("Should hide support options when product type is desktop", () => {
    const mockSubscriptionList: SubscriptionItem[] = [
      {
        id: "mocked-id-1",
        type: ProductTypes.desktop,
        sla: SLAEnum.none,
        support: SupportEnum.none,
        quantity: 1,
      },
    ];
    mockContextValue.subscriptionList = mockSubscriptionList;
    renderComponent(mockContextValue);
    expect(screen.getByTestId("wrapper")).toBeInTheDocument();
    const heading = screen.getByRole("heading", {
      name: /Ubuntu Pro Desktop/i,
    });
    expect(heading).toBeInTheDocument();
    expect(
      screen.queryByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === "h5" &&
          content.includes("Coverage options")
        );
      }),
    ).not.toBeInTheDocument();
  });

  test("Should show support options when product type is physical", () => {
    const mockSubscriptionList: SubscriptionItem[] = [
      {
        id: "mocked-id-1",
        type: ProductTypes.physical,
        sla: SLAEnum.none,
        support: SupportEnum.none,
        quantity: 1,
      },
    ];
    mockContextValue.subscriptionList = mockSubscriptionList;
    renderComponent(mockContextValue);
    expect(screen.getByTestId("wrapper")).toBeInTheDocument();
    const heading = screen.getByRole("heading", {
      name: /Ubuntu Pro Physical/i,
    });
    expect(heading).toBeInTheDocument();
    expect(
      screen.queryByText((content, element) => {
        return (
          element?.tagName.toLowerCase() === "h5" &&
          content.includes("Coverage options")
        );
      }),
    ).toBeInTheDocument();
  });
});
