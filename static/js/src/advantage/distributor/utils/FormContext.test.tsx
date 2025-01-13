import React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { FormContext, FormProvider, defaultValues } from "./FormContext";
import {
  DistributorProductTypes,
  SLA,
  Support,
  Durations,
  Currencies,
} from "./utils";
import { UserSubscriptionMarketplace } from "advantage/api/enum";

describe("FormProvider tests", () => {
  let mockLocalStorage: any;

  beforeEach(() => {
    mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };

    Object.defineProperty(window, "localStorage", {
      value: mockLocalStorage,
      writable: true,
    });

    global.window.channelProductList = {
      "product-listing-id-1": {
        currency: "EUR",
        effective_days: 730,
        exclusion_group: "2024Q1",
        id: "product-listing-id-1",
        marketplace: UserSubscriptionMarketplace.CanonicalProChannel,
        metadata: [{ key: "key1", value: "value1" }],
        name: "product-1",
        price: 100,
        product: {
          id: "uio-standard-virtual",
          name: "Ubuntu Pro + Infra Support (weekday) - Virtual",
        },
        status: "active",
      } as any,
    };
  });

  const mockOffer = {
    account_id: "account-123",
    actionable: true,
    created_at: "2023-10-01T00:00:00Z",
    id: "offer-123",
    exclusion_group: "2024Q1",
    items: [
      {
        allowance: 1,
        currency: "EUR",
        effectiveDays: 730,
        id: "product-220",
        name: "random-name",
        price: 71109,
        productID: "uio-standard-virtual",
        productName: "Ubuntu Pro + Infra Support (weekday) - Virtual",
      },
    ],
    technical_contact_name: "John Doe",
    technical_contact_email: "john.doe@example.com",
    updated_at: "2023-10-01T00:00:00Z",
    marketplace: UserSubscriptionMarketplace.CanonicalProChannel,
    total: 100,
    discount: 15,
  };

  afterEach(() => {
    jest.clearAllMocks();
    delete (global.window as any).channelProductList;
  });

  const createWrapper = (props: any = {}) => {
    return ({ children }: { children: React.ReactNode }) => (
      <FormProvider {...props}>{children}</FormProvider>
    );
  };

  it("initializes with default values when no props are provided", () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => React.useContext(FormContext), {
      wrapper,
    });

    expect(result.current.productType).toBe(defaultValues.productType);
    expect(result.current.subscriptionList).toEqual(
      defaultValues.subscriptionList,
    );
    expect(result.current.duration).toBe(defaultValues.duration);
    expect(result.current.currency).toBe(defaultValues.currency);
    expect(result.current.technicalUserContact).toEqual(
      defaultValues.technicalUserContact,
    );
  });

  it("initializes values from props", () => {
    const initialProps = {
      initialSubscriptionList: [{ id: "sub-1" }],
      initialType: DistributorProductTypes.virtual,
      initialDuration: Durations.two,
      initialCurrency: Currencies.gbp,
      initialTechnicalUserContact: {
        name: "Test User",
        email: "test@example.com",
      },
    };
    const wrapper = createWrapper(initialProps);

    const { result } = renderHook(() => React.useContext(FormContext), {
      wrapper,
    });

    expect(result.current.subscriptionList).toEqual(
      initialProps.initialSubscriptionList,
    );
    expect(result.current.productType).toBe(initialProps.initialType);
    expect(result.current.duration).toBe(initialProps.initialDuration);
    expect(result.current.currency).toBe(initialProps.initialCurrency);
    expect(result.current.technicalUserContact).toEqual(
      initialProps.initialTechnicalUserContact,
    );
  });

  it("filters products based on subscriptionList and duration", () => {
    const subscriptionList = [
      {
        id: "sub-1",
        type: DistributorProductTypes.virtual,
        support: Support.full,
        sla: SLA.everyday,
      },
    ];

    const wrapper = createWrapper({
      initialSubscriptionList: subscriptionList,
      initialDuration: Durations.one,
      initialCurrency: Currencies.usd,
    });

    const { result } = renderHook(() => React.useContext(FormContext), {
      wrapper,
    });

    expect(result.current.products).toEqual([]); // Updated logic to match test expectations
  });

  it("sets technicalUserContact from offer", () => {
    const wrapper = createWrapper({ initialOffer: mockOffer });

    const { result } = renderHook(() => React.useContext(FormContext), {
      wrapper,
    });

    expect(result.current.technicalUserContact).toEqual({
      name: "John Doe",
      email: "john.doe@example.com",
    });
  });

  it("handles preselected items from the offer", () => {
    const wrapper = createWrapper({ initialOffer: mockOffer });

    const { result } = renderHook(() => React.useContext(FormContext), {
      wrapper,
    });

    expect(result.current.subscriptionList).toEqual([
      {
        id: "product-220",
        quantity: 1,
        sla: "Weekday",
        support: "Infra",
        type: "virtual",
      },
    ]);
    expect(result.current.currency.toUpperCase()).toBe("EUR");
  });
});
