import React from "react";
import { screen, within } from "@testing-library/react";

import { EntitlementType } from "advantage/api/enum";
import {
  userSubscriptionFactory,
  userSubscriptionEntitlementFactory,
} from "advantage/tests/factories/api";
import { renderWithQueryClient } from "advantage/tests/utils";

import FeaturesTab from "../FeaturesTab";

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
    }),
  ],
});
it("displays feature categories with content", () => {
  renderWithQueryClient(<FeaturesTab subscription={subscription} />);
  screen.getByRole("heading", { name: "Included" });
  screen.getByRole("heading", { name: "Not included" });
  screen.getByRole("heading", { name: "Compliance & Hardening" });

  within(screen.getByTestId("included-features")).getByLabelText("Livepatch");
  within(screen.getByTestId("excluded-features")).getByText("ESM Apps");
  within(screen.getByTestId("always-available-features")).getByLabelText("CIS");
});
