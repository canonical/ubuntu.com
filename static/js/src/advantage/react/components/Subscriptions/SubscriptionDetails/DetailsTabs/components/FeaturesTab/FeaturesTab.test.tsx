import React from "react";
import { screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EntitlementType } from "advantage/api/enum";
import {
  userSubscriptionFactory,
  userSubscriptionEntitlementFactory,
} from "advantage/tests/factories/api";
import { renderWithQueryClient } from "advantage/tests/utils";
import * as api from "advantage/api/contracts";

import FeaturesTab from "../FeaturesTab";

jest.mock("advantage/api/contracts", () => ({
  putContractEntitlements: jest.fn(),
}));

const subscription = userSubscriptionFactory.build({
  entitlements: [
    userSubscriptionEntitlementFactory.build({
      enabled_by_default: true,
      is_available: true,
      is_editable: true,
      type: EntitlementType.Livepatch,
    }),
    userSubscriptionEntitlementFactory.build({
      enabled_by_default: false,
      is_available: false,
      is_editable: false,
      type: EntitlementType.EsmApps,
    }),
    userSubscriptionEntitlementFactory.build({
      enabled_by_default: false,
      type: EntitlementType.Cis,
      is_available: true,
      is_editable: true,
    }),
  ],
});

it("displays feature categories with content", () => {
  renderWithQueryClient(
    <FeaturesTab subscription={subscription} setHasUnsavedChanges={jest.fn()} />
  );
  screen.getByRole("heading", { name: "Default settings" });
  screen.getByRole("heading", { name: "Service enablement for individual machines" });

  within(screen.getByTestId("included-features")).getByLabelText("Livepatch");
  expect(screen.queryByText("ESM Apps")).not.toBeInTheDocument();
  within(screen.getByTestId("always-available-features")).getByLabelText("CIS");
});

it("submits correct entitlement updates", async () => {
  renderWithQueryClient(
    <FeaturesTab subscription={subscription} setHasUnsavedChanges={jest.fn()} />
  );

  expect(
    screen.queryByRole("button", { name: "Save" })
  ).not.toBeInTheDocument();

  userEvent.click(
    screen.getByRole("checkbox", {
      name: "Livepatch",
    })
  );
  await waitFor(() => {
    expect(
      (screen.getByRole("checkbox", {
        name: "Livepatch",
      }) as HTMLInputElement).checked
    ).toBe(false);
  });

  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
  );
  userEvent.click(screen.getByRole("button", { name: "Save" }));

  await waitFor(() =>
    expect(api.putContractEntitlements).toHaveBeenCalledTimes(1)
  );
  expect(
    api.putContractEntitlements
  ).toHaveBeenCalledWith(subscription.contract_id, [
    { is_enabled: false, type: "livepatch" },
  ]);
});

it("hides feature tab when no features are available", () => {
  const subscription = userSubscriptionFactory.build({
    entitlements: [
      userSubscriptionEntitlementFactory.build({
        enabled_by_default: false,
        type: EntitlementType.EsmApps,
      }),
    ],
  });
  renderWithQueryClient(
    <FeaturesTab subscription={subscription} setHasUnsavedChanges={jest.fn()} />
  );
  expect(screen.queryByText("Features")).not.toBeInTheDocument();
});
