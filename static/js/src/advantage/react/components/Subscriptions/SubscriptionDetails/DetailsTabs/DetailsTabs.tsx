import { Col, Icon, List, Row, Tabs } from "@canonical/react-components";
import React, { HTMLProps, useState } from "react";
import type { ReactNode } from "react";
import {
  ContractToken,
  UserSubscription,
  UserSubscriptionEntitlement,
} from "advantage/api/types";
import { getFeaturesDisplay, isFreeSubscription } from "advantage/react/utils";
import { EntitlementType } from "advantage/api/enum";

enum ActiveTab {
  DOCUMENTATION = "documentation",
  FEATURES = "features",
}

type Props = {
  subscription: UserSubscription;
  token?: ContractToken;
} & HTMLProps<HTMLDivElement>;

type DocsLink = {
  url: string;
  label: string;
};

type ListItem = {
  icon?: string;
  label: ReactNode;
};

const generateList = (title: string, items: ListItem[]) => (
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

const generateDocLinks = (
  entitlements: UserSubscriptionEntitlement[]
): DocsLink[] =>
  entitlements.reduce<DocsLink[]>((collection, entitlement) => {
    let link: DocsLink | null = null;
    switch (entitlement.type) {
      case EntitlementType.EsmApps:
      case EntitlementType.EsmInfra:
        link = {
          label: "ESM Infra & ESM Apps",
          url:
            "https://support.canonical.com/staff/s/article/Obtaining-ESM-Credentials-And-Enabling-ESM-On-Ubuntu ",
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
        link = { label: "Support", url: "https://support.canonical.com/" };
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
  }, []);

const DetailsTabs = ({ subscription, token, ...wrapperProps }: Props) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.FEATURES);
  let content: ReactNode | null;
  const features = getFeaturesDisplay(subscription.entitlements);
  const isFree = isFreeSubscription(subscription);
  // Don't display any docs links for the free subscription.
  const docs = isFree ? [] : generateDocLinks(subscription.entitlements);
  switch (activeTab) {
    case ActiveTab.DOCUMENTATION:
      content = (
        <div data-test="docs-content">
          {generateList(
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
                              sudo ua attach {token?.contract_token}
                            </code>
                          </>
                        ),
                      },
                    ]
                  : []
              )
          )}
        </div>
      );
      break;
    case ActiveTab.FEATURES:
    default:
      content = (
        <>
          <Row className="u-sv1" data-test="features-content">
            <Col size={4}>
              {features.included.length
                ? generateList(
                    "Included",
                    features.included.map((feature) => ({
                      icon: "success",
                      label: feature,
                    }))
                  )
                : null}
            </Col>
            <Col size={4}>
              {features.excluded.length
                ? generateList(
                    "Not included",
                    features.excluded.map((feature) => ({
                      icon: "error",
                      label: feature,
                    }))
                  )
                : null}
            </Col>
          </Row>
          <a href="/legal/ubuntu-advantage-service-description">
            Service description &rsaquo;
          </a>
        </>
      );
      break;
  }
  return (
    <div {...wrapperProps}>
      <Tabs
        className="p-tabs--brand"
        links={[
          {
            active: activeTab === ActiveTab.FEATURES,
            "data-test": "features-tab",
            label: "Features",
            onClick: () => setActiveTab(ActiveTab.FEATURES),
          },
          {
            active: activeTab === ActiveTab.DOCUMENTATION,
            "data-test": "docs-tab",
            label: "Documentation",
            onClick: () => setActiveTab(ActiveTab.DOCUMENTATION),
          },
        ]}
      />
      {content}
    </div>
  );
};

export default DetailsTabs;
