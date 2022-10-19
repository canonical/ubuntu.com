import { Icon, List, Tabs } from "@canonical/react-components";
import React, { HTMLProps, useState } from "react";
import type { ReactNode } from "react";
import {
  ContractToken,
  UserSubscription,
  UserSubscriptionEntitlement,
} from "advantage/api/types";
import { filterAndFormatEntitlements } from "advantage/react/utils/filterAndFormatEntitlements";
import {
  isBlenderSubscription,
  isFreeSubscription,
} from "advantage/react/utils";
import { EntitlementType } from "advantage/api/enum";
import { sendAnalyticsEvent } from "advantage/react/utils/sendAnalyticsEvent";
import FeaturesTab from "./components/FeaturesTab";

enum ActiveTab {
  DOCUMENTATION = "documentation",
  FEATURES = "features",
}

type Props = {
  subscription: UserSubscription;
  token?: ContractToken;
  setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;
} & HTMLProps<HTMLDivElement>;

type DocsLink = {
  url: string;
  label: string;
};

type ListItem = {
  icon?: string;
  label: ReactNode;
};

export const generateList = (title: React.ReactNode, items: ListItem[]) => (
  <>
    <h5 className="u-no-padding--top p-subscriptions__details-small-title">
      {title}
    </h5>
    <List
      items={items.map(({ label, icon }) => ({
        className: "u-no-padding--bottom",
        content: (
          <>
            {icon ? (
              <>
                <Icon name={icon} />
                &emsp;
              </>
            ) : null}
            {label}
          </>
        ),
      }))}
    />
  </>
);

const isEntitlementTypeEnum = (
  entitlementType: UserSubscriptionEntitlement["type"]
): entitlementType is EntitlementType =>
  Object.values<string>(EntitlementType).includes(entitlementType);

const showLast = (entitlement: UserSubscriptionEntitlement) =>
  isEntitlementTypeEnum(entitlement.type) &&
  [EntitlementType.Fips, EntitlementType.CcEal, EntitlementType.Cis].includes(
    entitlement.type
  );

const sortEntitlements = (
  entitlements: UserSubscriptionEntitlement[]
): UserSubscriptionEntitlement[] =>
  [...entitlements].sort((a, b) => {
    if (showLast(b) && !showLast(a)) {
      return -1;
    }
    if (showLast(a) && !showLast(b)) {
      return 1;
    }
    return 0;
  });

const generateDocLinks = (
  entitlements: UserSubscriptionEntitlement[]
): DocsLink[] =>
  sortEntitlements(entitlements).reduce<DocsLink[]>(
    (collection, entitlement) => {
      let link: DocsLink | null = null;
      switch (entitlement.type) {
        case EntitlementType.EsmApps:
        case EntitlementType.EsmInfra:
          link = {
            label: "Ubuntu Pro (esm-apps --beta) tutorial",
            url: "/pro/beta",
          };
          break;
        case EntitlementType.Livepatch:
        case EntitlementType.LivepatchOnprem:
          link = {
            label: "Livepatch",
            url: "/security/livepatch/docs",
          };
          break;
        case EntitlementType.Support:
          link = {
            label: "Support",
            url: "https://portal.support.canonical.com/",
          };
          break;
        case EntitlementType.Cis:
          link = {
            label: "CIS setup instructions",
            url: "/security/certifications/docs/cis",
          };
          break;
        case EntitlementType.CcEal:
          link = {
            label: "CC-EAL2 setup instructions",
            url: "/security/certifications/docs/cc",
          };
          break;
        case EntitlementType.Fips:
          link = {
            label: "FIPS setup instructions",
            url: "/security/certifications/docs/fips ",
          };
          break;
      }
      if (link && !collection.find(({ label }) => label === link?.label)) {
        collection.push(link);
      }
      return collection;
    },
    []
  );

const DetailsTabs = ({
  subscription,
  token,
  setHasUnsavedChanges,
  ...wrapperProps
}: Props) => {
  const featuresDisplay = filterAndFormatEntitlements(
    subscription.entitlements
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    featuresDisplay.included.length > 0
      ? ActiveTab.FEATURES
      : ActiveTab.DOCUMENTATION
  );
  let content: ReactNode | null;

  const isBlender = isBlenderSubscription(subscription);

  const isFree = isFreeSubscription(subscription);
  // Display tutorial link for the free subscription.
  const docs = isFree
    ? [
        {
          label: "Ubuntu Pro (esm-apps --beta) tutorial",
          url: "/pro/beta",
        },
      ]
    : generateDocLinks(subscription.entitlements);
  const setTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    sendAnalyticsEvent({
      eventCategory: "Advantage",
      eventAction: "subscription-details-tab",
      eventLabel: `subscription ${tab} tab clicked`,
    });
  };

  const generateUADocs = () => {
    return generateList(
      "Documentation & tutorials",
      docs
        .map((doc) => ({
          label: (
            <a data-test="doc-link" href={doc.url}>
              {doc.label}
            </a>
          ),
        }))
        .concat(
          token
            ? [
                {
                  label: (
                    <>
                      To attach a machine:{" "}
                      <code data-test="contract-token">
                        sudo pro attach {token?.contract_token}
                      </code>
                    </>
                  ),
                },
              ]
            : []
        )
    );
  };

  const blenderDocs = (
    <>
      <h5 className="u-no-padding--top p-subscriptions__details-small-title">
        Documentation & tutorials
      </h5>
      <a data-test="doc-link" href="https://blender.stackexchange.com/">
        Blender StackExchange
      </a>
    </>
  );

  switch (activeTab) {
    case ActiveTab.DOCUMENTATION:
      content = (
        <div data-test="docs-content">
          {isBlender ? blenderDocs : generateUADocs()}
        </div>
      );
      break;
    case ActiveTab.FEATURES:
    default:
      content = (
        <FeaturesTab
          subscription={subscription}
          setHasUnsavedChanges={setHasUnsavedChanges}
        />
      );
      break;
  }
  return (
    <div {...wrapperProps}>
      <Tabs
        className="p-tabs--brand"
        links={[
          ...(featuresDisplay.included.length > 0
            ? // Don't show the Features tab if there are no included features.
              [
                {
                  active: activeTab === ActiveTab.FEATURES,
                  "data-test": "features-tab",
                  label: "Features",
                  onClick: () => setTab(ActiveTab.FEATURES),
                },
              ]
            : []),
          {
            active: activeTab === ActiveTab.DOCUMENTATION,
            "data-test": "docs-tab",
            label: "Documentation",
            onClick: () => setTab(ActiveTab.DOCUMENTATION),
          },
        ]}
      />
      {content}
    </div>
  );
};

export default DetailsTabs;
