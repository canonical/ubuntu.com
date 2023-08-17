import React from "react";
import { mount as enzymeMount } from "enzyme";

import DetailsTabs from "./DetailsTabs";
import { freeSubscriptionFactory } from "advantage/tests/factories/api";
import { getQueryClientWrapper } from "advantage/tests/utils";

const mount = (Component: React.ReactElement) =>
  enzymeMount(Component, {
    wrappingComponent: getQueryClientWrapper(),
  });

describe("DetailsTabs", () => {
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
