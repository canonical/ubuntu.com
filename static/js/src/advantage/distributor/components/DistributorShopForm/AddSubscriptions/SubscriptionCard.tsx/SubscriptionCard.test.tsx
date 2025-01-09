import { render, screen } from "@testing-library/react";
import SubscriptionCard from "./SubscriptionCard";
import {
  DistributorProductTypes as ProductTypes,
  SLA as SLAEnum,
  SubscriptionItem,
  Support as SupportEnum,
  ChannelProduct,
} from "advantage/distributor/utils/utils";
import {
  FormContext,
  defaultValues,
} from "advantage/distributor/utils/FormContext";
import { DistributorProduct } from "advantage/subscribe/checkout/utils/test/Mocks";

const mockSubscription: SubscriptionItem = {
  id: "mocked-id-1",
  sla: SLAEnum.none,
  support: SupportEnum.none,
  type: ProductTypes.desktop,
  quantity: 1,
};

const mockContextValue = {
  ...defaultValues,
  subscriptionList: [mockSubscription] as SubscriptionItem[],
  setSubscriptionList: jest.fn(),
  products: [DistributorProduct] as ChannelProduct[],
  duration: 1,
};

const MockFormContext = ({ children }: { children: React.ReactNode }) => (
  <FormContext.Provider value={mockContextValue}>
    {children}
  </FormContext.Provider>
);

test("Should not render Coverage options for desktop type", () => {
  const mockSubscription: SubscriptionItem = {
    id: "mocked-id-1",
    sla: SLAEnum.none,
    support: SupportEnum.infra,
    type: ProductTypes.desktop,
    quantity: 1,
  };

  render(<SubscriptionCard subscription={mockSubscription} />);

  expect(screen.queryByText(/Coverage options/i)).not.toBeInTheDocument();
});

test("Should display correct price per machine", () => {
  render(
    <MockFormContext>
      <SubscriptionCard subscription={mockSubscription} />
    </MockFormContext>,
  );

  expect(screen.getByText(/Support options/i)).toBeInTheDocument();

  const initialPricePerMachine = screen.getByText(
    /€500.00 \/ year per machine/i,
  );

  expect(initialPricePerMachine).toBeInTheDocument();
});
