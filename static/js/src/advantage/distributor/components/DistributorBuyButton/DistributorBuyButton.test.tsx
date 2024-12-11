import { render, screen, fireEvent } from "@testing-library/react";
import DistributorBuyButton from "./DistributorBuyButton";
import {
  DistributorProductTypes as ProductTypes,
  SLA as SLAEnum,
  SubscriptionItem,
  Support as SupportEnum,
  ChannelProduct,
  Currencies,
} from "advantage/distributor/utils/utils";
import {
  FormContext,
  defaultValues,
} from "advantage/distributor/utils/FormContext";
import { DistributorProduct } from "advantage/subscribe/checkout/utils/test/Mocks";
import { ChannelOfferFactory } from "advantage/offers/tests/factories/channelOffers";
import { UserSubscriptionMarketplace } from "advantage/api/enum";

const mockSubscription: SubscriptionItem = {
  id: "mocked-id-1",
  sla: SLAEnum.none,
  support: SupportEnum.none,
  type: ProductTypes.desktop,
  quantity: 3,
};

const mockContextValue = {
  ...defaultValues,
  subscriptionList: [mockSubscription] as SubscriptionItem[],
  products: [DistributorProduct] as ChannelProduct[],
  offer: ChannelOfferFactory.build({ id: "offer-id-1" }),
};

test("Should display correct price per machine", () => {
  render(
    <FormContext.Provider value={mockContextValue}>
      <DistributorBuyButton />
    </FormContext.Provider>,
  );

  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
  };
  Object.defineProperty(window, "localStorage", { value: localStorageMock });

  const originalLocation = window.location;

  delete (window as any).location;

  window.location = { href: "" } as any;

  const button = screen.getByText(/Proceed to checkout/i);

  expect(button).toBeInTheDocument();

  fireEvent.click(button);

  const expectedShopCheckoutData = {
    products: [
      {
        product: {
          id: "uai-essential-desktop-1y-channel-eur-v2",
          longId: "lANXjQ-H8fzvf_Ea8bIK1KW7Wi2W0VHnV0ZUsrEGbUiQ",
          marketplace: UserSubscriptionMarketplace.CanonicalProChannel,
          name: "uai-essential-desktop-1y-channel-eur-v2",
          price: {
            value: 50000,
            discount: 10,
            currency: Currencies.eur,
          },
          offerId: "offer-id-1",
        },
        quantity: 3,
      },
    ],
    action: "offer",
  };

  expect(localStorageMock.setItem).toHaveBeenCalledWith(
    "shop-checkout-data",
    JSON.stringify(expectedShopCheckoutData),
  );

  expect(window.location.href).toBe("/account/checkout");
  window.location = originalLocation;
});

test("Should disable button when no products are selected", async () => {
  render(
    <FormContext.Provider value={{ ...mockContextValue, products: [] }}>
      <DistributorBuyButton />
    </FormContext.Provider>,
  );

  const button = screen.getByText(/Proceed to checkout/i);

  expect(button).toBeInTheDocument();
  expect(button).toHaveAttribute("aria-disabled", "true");
  expect(button).toHaveClass("is-disabled");
});
