import React from "react";
import { mount as enzymeMount } from "enzyme";

import DetailsTabs from "./DetailsTabs";
import {
  freeSubscriptionFactory,
  userSubscriptionEntitlementFactory,
  userSubscriptionFactory,
} from "advantage/tests/factories/api";
import { getQueryClientWrapper } from "advantage/tests/utils";
import { UserSubscription } from "advantage/api/types";
import { EntitlementType, SupportLevel } from "advantage/api/enum";

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

  it("Display tutorial link for the subscription with 24/5 support", () => {
    const wrapper = mount(
      <DetailsTabs
        subscription={userSubscriptionFactory.build({
          entitlements: [
            userSubscriptionEntitlementFactory.build({
              enabled_by_default: true,
              type: EntitlementType.Support,
              support_level: SupportLevel.Standard,
            }),
          ],
        })}
        setHasUnsavedChanges={jest.fn()}
      />
    );
    const docsLinks = wrapper.find("[data-test='doc-link']");
    expect(docsLinks.length).toBe(11);
    expect(docsLinks.at(1).text()).toBe("24/5 Weekday Support");
  });

  it("Display tutorial link for the subscription with 24/7 support", () => {
    const wrapper = mount(
      <DetailsTabs
        subscription={userSubscriptionFactory.build({
          entitlements: [
            userSubscriptionEntitlementFactory.build({
              enabled_by_default: true,
              type: EntitlementType.Support,
              support_level: SupportLevel.Advanced,
            }),
          ],
        })}
        setHasUnsavedChanges={jest.fn()}
      />
    );
    const docsLinks = wrapper.find("[data-test='doc-link']");
    expect(docsLinks.length).toBe(11);
    expect(docsLinks.at(1).text()).toBe("24/7 Support");
  });

  it("Display tutorial link for the subscription without support", () => {
    const wrapper = mount(
      <DetailsTabs
        subscription={subscription}
        setHasUnsavedChanges={jest.fn()}
      />
    );
    const docsLinks = wrapper.find("[data-test='doc-link']");
    expect(docsLinks.length).toBe(10);
    expect(docsLinks.at(0).text()).toBe("Knowledge Base");
  });

  it("Display tutorial link for the free subscription", () => {
    const wrapper = mount(
      <DetailsTabs
        subscription={freeSubscriptionFactory.build()}
        setHasUnsavedChanges={jest.fn()}
      />
    );
    const docsLinks = wrapper.find("[data-test='doc-link']");
    expect(docsLinks.at(0).text()).toBe("ESM");
  });
});
