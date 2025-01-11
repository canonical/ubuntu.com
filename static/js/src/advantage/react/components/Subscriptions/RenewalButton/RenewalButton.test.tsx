import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserSubscriptionPeriod } from "advantage/api/enum";
import { userSubscriptionFactory } from "advantage/tests/factories/api";
import RenewalButton from "./RenewalButton";

describe("RenewalButton", () => {
  it("cannot submit if editing", async () => {
    Object.defineProperty(window, "location", {
      value: {
        href: "/old/url",
      },
    });
    Object.defineProperty(window, "dataLayer", {
      value: [],
      writable: true,
    });

    const subscription = userSubscriptionFactory.build();
    const action = "purchase";
    const editing = true;

    render(
      <RenewalButton
        subscription={subscription}
        action={action}
        editing={editing}
      ></RenewalButton>,
    );

    const renewButton = screen.getByRole("button") as HTMLInputElement;
    expect(renewButton).toBeInTheDocument();
    expect(renewButton).toHaveAttribute("aria-disabled", "true");

    userEvent.click(renewButton);
    await waitFor(() => {
      expect(window.location.href).toBe("/old/url");
      expect(localStorage.getItem("shop-checkout-data")).toBe(null);
    });
  });

  it("sets session and redirects for renewing", async () => {
    Object.defineProperty(window, "location", {
      value: {
        href: "/old/url",
      },
    });
    Object.defineProperty(window, "dataLayer", {
      value: [],
      writable: true,
    });

    const subscription = userSubscriptionFactory.build();
    const action = "renewal";
    const editing = false;

    render(
      <RenewalButton
        subscription={subscription}
        action={action}
        editing={editing}
      ></RenewalButton>,
    );

    const renewButton = screen.getByRole("button") as HTMLInputElement;
    expect(renewButton).toBeInTheDocument();

    userEvent.click(renewButton);
    await waitFor(() => {
      expect(window.location.href).toBe("/account/checkout");
      expect(localStorage.getItem("shop-checkout-data")).toBeDefined();
      expect(window.dataLayer).toStrictEqual([
        {
          event: "GAEvent",
          eventCategory: "Advantage",
          eventAction: "subscription-renewal-modal",
          eventLabel: "subscription renewal modal opened",
        },
      ]);
    });
  });

  it("sets session and redirects for rebuying", async () => {
    Object.defineProperty(window, "location", {
      value: {
        href: "/old/url",
      },
    });
    Object.defineProperty(window, "dataLayer", {
      value: [],
      writable: true,
    });

    const subscription = userSubscriptionFactory.build();
    const action = "purchase";
    const editing = false;

    render(
      <RenewalButton
        subscription={subscription}
        action={action}
        editing={editing}
      ></RenewalButton>,
    );

    const renewButton = screen.getByRole("button") as HTMLInputElement;
    expect(renewButton).toBeInTheDocument();

    userEvent.click(renewButton);
    await waitFor(() => {
      expect(window.location.href).toBe("/account/checkout");
      expect(localStorage.getItem("shop-checkout-data")).toBeDefined();
      expect(window.dataLayer).toStrictEqual([
        {
          event: "GAEvent",
          eventCategory: "Advantage",
          eventAction: "subscription-rebuy-expired-modal",
          eventLabel: "subscription rebuy expired modal opened",
        },
      ]);
    });
  });

  it("sets session and redirects for rebuying for monthly", async () => {
    Object.defineProperty(window, "location", {
      value: {
        href: "/old/url",
      },
    });
    Object.defineProperty(window, "dataLayer", {
      value: [],
      writable: true,
    });

    const subscription = userSubscriptionFactory.build({
      period: UserSubscriptionPeriod.Monthly,
    });
    const action = "purchase";
    const editing = false;

    render(
      <RenewalButton
        subscription={subscription}
        action={action}
        editing={editing}
      ></RenewalButton>,
    );

    const renewButton = screen.getByRole("button") as HTMLInputElement;
    expect(renewButton).toBeInTheDocument();

    userEvent.click(renewButton);
    await waitFor(() => {
      expect(window.location.href).toBe("/account/checkout");
      expect(localStorage.getItem("shop-checkout-data")).toBeDefined();
      expect(window.dataLayer).toStrictEqual([
        {
          event: "GAEvent",
          eventCategory: "Advantage",
          eventAction: "subscription-rebuy-expired-modal",
          eventLabel: "subscription rebuy expired modal opened",
        },
      ]);
    });
  });
});
