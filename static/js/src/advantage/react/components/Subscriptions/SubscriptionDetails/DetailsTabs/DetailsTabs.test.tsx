import React from "react";
import { mount as enzymeMount } from "enzyme";

import DetailsTabs from "./DetailsTabs";
import {
  contractTokenFactory,
  freeSubscriptionFactory,
  userSubscriptionEntitlementFactory,
  userSubscriptionFactory,
} from "advantage/tests/factories/api";
import { UserSubscription } from "advantage/api/types";
import { EntitlementType } from "advantage/api/enum";
import { getQueryClientWrapper } from "advantage/tests/utils";

const mount = (Component: React.ReactElement) =>
  enzymeMount(Component, {
    wrappingComponent: getQueryClientWrapper(),
  });

describe("DetailsTabs", () => {
  let subscription: UserSubscription;

  beforeEach(async () => {
    subscription = userSubscriptionFactory.build({
      entitlements: [
        userSubscriptionEntitlementFactory.build({
          enabled_by_default: true,
          type: EntitlementType.Livepatch,
        }),
      ],
    });
  });

  it("defaults to the features tab if there are entitlements", () => {
    const wrapper = mount(
      <DetailsTabs
        subscription={subscription}
        setHasUnsavedChanges={jest.fn()}
      />
    );
    expect(wrapper.find("[data-testid='features-content']").exists()).toBe(
      true
    );
  });

  it("hides the feature content tab is there are not entitlements", () => {
    subscription = userSubscriptionFactory.build();
    const wrapper = mount(
      <DetailsTabs
        subscription={subscription}
        setHasUnsavedChanges={jest.fn()}
      />
    );
    expect(wrapper.find("[data-testid='features-content']").exists()).toBe(
      false
    );
  });

  it("can change tabs", () => {
    const wrapper = mount(
      <DetailsTabs
        subscription={subscription}
        setHasUnsavedChanges={jest.fn()}
      />
    );
    expect(wrapper.find("[data-test='docs-content']").exists()).toBe(false);
    wrapper.find("[data-test='docs-tab']").simulate("click");
    wrapper.update();
    expect(wrapper.find("[data-test='docs-content']").exists()).toBe(true);
  });

  it("only displays one link to livepatch docs", () => {
    subscription = userSubscriptionFactory.build({
      entitlements: [
        userSubscriptionEntitlementFactory.build({
          enabled_by_default: true,
          type: EntitlementType.Livepatch,
        }),
        userSubscriptionEntitlementFactory.build({
          enabled_by_default: true,
          type: EntitlementType.LivepatchOnprem,
        }),
      ],
    });
    const wrapper = mount(
      <DetailsTabs
        subscription={subscription}
        setHasUnsavedChanges={jest.fn()}
      />
    );
    // Switch to the docs tab:
    wrapper.find("[data-test='docs-tab']").simulate("click");
    const docsLinks = wrapper.find("[data-test='doc-link']");
    expect(docsLinks.length).toBe(1);
    expect(docsLinks.at(0).text()).toBe("Livepatch");
  });

  it("only displays one link to ESM docs", () => {
    subscription = userSubscriptionFactory.build({
      entitlements: [
        userSubscriptionEntitlementFactory.build({
          enabled_by_default: true,
          type: EntitlementType.EsmApps,
        }),
        userSubscriptionEntitlementFactory.build({
          enabled_by_default: true,
          type: EntitlementType.EsmInfra,
        }),
      ],
    });
    const wrapper = mount(
      <DetailsTabs
        subscription={subscription}
        setHasUnsavedChanges={jest.fn()}
      />
    );
    // Switch to the docs tab:
    wrapper.find("[data-test='docs-tab']").simulate("click");
    const docsLinks = wrapper.find("[data-test='doc-link']");
    expect(docsLinks.length).toBe(1);
    expect(docsLinks.at(0).text()).toBe(
      "Ubuntu Pro (esm-apps --beta) tutorial"
    );
  });

  it("reorders FIPS, CC-EAL, and CIS to the end", () => {
    subscription = userSubscriptionFactory.build({
      entitlements: [
        userSubscriptionEntitlementFactory.build({
          enabled_by_default: true,
          type: EntitlementType.EsmApps,
        }),
        userSubscriptionEntitlementFactory.build({
          enabled_by_default: true,
          type: EntitlementType.Fips,
        }),
        userSubscriptionEntitlementFactory.build({
          enabled_by_default: true,
          type: EntitlementType.CcEal,
        }),
        userSubscriptionEntitlementFactory.build({
          enabled_by_default: true,
          type: EntitlementType.Cis,
        }),
        userSubscriptionEntitlementFactory.build({
          enabled_by_default: true,
          type: EntitlementType.Livepatch,
        }),
      ],
    });
    const wrapper = mount(
      <DetailsTabs
        subscription={subscription}
        setHasUnsavedChanges={jest.fn()}
      />
    );
    // Switch to the docs tab:
    wrapper.find("[data-test='docs-tab']").simulate("click");
    const docsLinks = wrapper.find("[data-test='doc-link']");
    expect(docsLinks.at(0).text()).toBe(
      "Ubuntu Pro (esm-apps --beta) tutorial"
    );
    expect(docsLinks.at(1).text()).toBe("Livepatch");
    expect(docsLinks.at(2).text()).toBe("FIPS setup instructions");
    expect(docsLinks.at(3).text()).toBe("CC-EAL2 setup instructions");
    expect(docsLinks.at(4).text()).toBe("CIS setup instructions");
  });

  it("can display a contract token", () => {
    const wrapper = mount(
      <DetailsTabs
        subscription={subscription}
        token={contractTokenFactory.build()}
        setHasUnsavedChanges={jest.fn()}
      />
    );
    // Switch to the docs tab:
    wrapper.find("[data-test='docs-tab']").simulate("click");
    expect(wrapper.find("[data-test='contract-token']").exists()).toBe(true);
  });

  it("Display tutorial link for the free subscription", () => {
    const wrapper = mount(
      <DetailsTabs
        subscription={freeSubscriptionFactory.build()}
        token={contractTokenFactory.build()}
        setHasUnsavedChanges={jest.fn()}
      />
    );
    // Switch to the docs tab:
    wrapper.find("[data-test='docs-tab']").simulate("click");
    const docsLinks = wrapper.find("[data-test='doc-link']");
    expect(docsLinks.at(0).text()).toBe(
      "Ubuntu Pro (esm-apps --beta) tutorial"
    );
  });
});
