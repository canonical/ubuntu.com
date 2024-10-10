import { render, screen } from "@testing-library/react";
import { UserSubscriptionType } from "advantage/api/enum";
import { UserSubscription } from "advantage/api/types";
import {
  userSubscriptionFactory,
  userSubscriptionStatusesFactory,
} from "advantage/tests/factories/api";
import SubscriptionStatusChip from "./SubscriptionStatusChip";

const renderComponent = (subscription: UserSubscription) => {
  return render(
    <SubscriptionStatusChip subscription={subscription}>
      {(data) => (
        <div data-testid="chip" className={`p-chip--${data?.type}`}>
          {data?.status || "No status"}
        </div>
      )}
    </SubscriptionStatusChip>,
  );
};

describe("SubscriptionStatusChip Component", () => {
  it("Should show 'Expired' chip when status is expired", () => {
    renderComponent(
      userSubscriptionFactory.build({
        statuses: userSubscriptionStatusesFactory.build({
          is_expired: true,
        }),
      }),
    );

    expect(screen.getByTestId("chip")).toBeInTheDocument();
    expect(screen.getByTestId("chip")).toHaveTextContent("Expired");
    expect(screen.getByTestId("chip")).toHaveClass("p-chip--negative");
  });

  it("Should show 'Grace period' chip when is_in_grace_period is true", () => {
    renderComponent(
      userSubscriptionFactory.build({
        statuses: userSubscriptionStatusesFactory.build({
          is_in_grace_period: true,
        }),
      }),
    );
    expect(screen.getByTestId("chip")).toHaveTextContent("Grace period");
    expect(screen.getByTestId("chip")).toHaveClass("p-chip--negative");
  });

  it("Should show 'Expiring soon' chip when is_expiring is true", () => {
    renderComponent(
      userSubscriptionFactory.build({
        statuses: userSubscriptionStatusesFactory.build({ is_expiring: true }),
      }),
    );
    expect(screen.getByTestId("chip")).toHaveTextContent("Expiring soon");
    expect(screen.getByTestId("chip")).toHaveClass("p-chip--caution");
  });

  it("Should show 'Renewed' chip for legacy subscriptions", () => {
    renderComponent(
      userSubscriptionFactory.build({
        statuses: {
          is_renewed: true,
        },
        type: UserSubscriptionType.Legacy,
        renewal_id: "some-id",
      }),
    );
    expect(screen.getByTestId("chip")).toHaveTextContent("Renewed");
    expect(screen.getByTestId("chip")).toHaveClass("p-chip--positive");
  });

  it("Should show 'Not renewed' chip for legacy subscriptions", () => {
    renderComponent(
      userSubscriptionFactory.build({
        statuses: {
          is_renewed: false,
          is_renewal_actionable: true,
          is_renewable: true,
        },
        type: UserSubscriptionType.Legacy,
        renewal_id: "some-id",
      }),
    );
    expect(screen.getByTestId("chip")).toHaveTextContent("Not renewed");
    expect(screen.getByTestId("chip")).toHaveClass("p-chip--caution");
  });

  it("Should show Auto-renewal on chip for active monthly/yearly/trial subscriptions", () => {
    renderComponent(
      userSubscriptionFactory.build({
        statuses: {
          is_subscription_active: true,
          is_cancelled: false,
          is_renewed: true,
        },
        type: UserSubscriptionType.Monthly,
      }),
    );
    expect(screen.getByTestId("chip")).toHaveTextContent("Auto-renewal on");
    expect(screen.getByTestId("chip")).toHaveClass("p-chip--positive");
  });

  it("Should show Auto-renewal off chip for non-renewed monthly/yearly/trial subscriptions", () => {
    renderComponent(
      userSubscriptionFactory.build({
        statuses: {
          is_subscription_active: true,
          is_cancelled: false,
          is_renewed: false,
        },
        type: UserSubscriptionType.Monthly,
      }),
    );
    expect(screen.getByTestId("chip")).toHaveTextContent("Auto-renewal off");
    expect(screen.getByTestId("chip")).toHaveClass("p-chip--caution");
  });

  it("Should show 'Cancelled' chip for cancelled monthly/yearly/trial subscriptions", () => {
    renderComponent(
      userSubscriptionFactory.build({
        statuses: { is_subscription_active: false, is_cancelled: true },
        type: UserSubscriptionType.Monthly,
      }),
    );
    expect(screen.getByTestId("chip")).toHaveTextContent("Cancelled");
    expect(screen.getByTestId("chip")).toHaveClass("p-chip--negative");
  });

  it("Should show 'Active' chip for non-monthly/yearly/trial active subscriptions", () => {
    renderComponent(
      userSubscriptionFactory.build({
        statuses: { is_subscription_active: true, is_cancelled: false },
        type: UserSubscriptionType.KeyActivated,
      }),
    );
    expect(screen.getByTestId("chip")).toHaveTextContent("Active");
    expect(screen.getByTestId("chip")).toHaveClass("p-chip--positive");
  });

  it("Should show nothing when no conditions are met", () => {
    renderComponent(
      userSubscriptionFactory.build({
        statuses: {
          is_expired: false,
          is_in_grace_period: false,
          is_subscription_active: false,
          is_cancelled: false,
          is_renewed: false,
          is_expiring: false,
        },
      }),
    );
    expect(screen.getByTestId("chip")).toHaveTextContent("No status");
  });
});
