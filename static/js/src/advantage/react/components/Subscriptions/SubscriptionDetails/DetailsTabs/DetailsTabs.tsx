import { Icon, List, Row, Tabs } from "@canonical/react-components";
import React, { HTMLProps, useState } from "react";
import type { ReactNode } from "react";
import {
  ContractToken,
  UserSubscription,
  UserSubscriptionEntitlement,
} from "advantage/api/types";
import { EntitlementsStore, filterAndFormatEntitlements } from "advantage/react/utils/filterAndFormatEntitlements";
import {
  isBlenderSubscription,
  isFreeSubscription,
} from "advantage/react/utils";
import { EntitlementType } from "advantage/api/enum";
import { sendAnalyticsEvent } from "advantage/react/utils/sendAnalyticsEvent";

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
            label: "Ubuntu Pro (esm-apps) tutorial",
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

const getSupportLevel = (subscription: UserSubscription) => {

  const features: EntitlementsStore = filterAndFormatEntitlements(subscription.entitlements);
  if (features.byLabel["24/5 Support"]) {
    return "24/5 Weekday Support";
  }
  if (features.byLabel["24/7 Support"]) {
    return "24/7 Support";
  }
  return "None";
}
const DetailsTabs = ({
  subscription,
  token,
  ...wrapperProps
}: Props) => {

  const isBlender = isBlenderSubscription(subscription);
  const isFree = isFreeSubscription(subscription);
  const supportLevel = getSupportLevel(subscription);

  let content: ReactNode | null;

  // Display tutorial link for the free subscription.
  const docs = generateDocLinks(subscription.entitlements);

  const UADocs = (subscription: UserSubscription) => {
    return (<>
      <h5 className="u-no-padding--top p-subscriptions__details-small-title">Services and Documentation</h5>
      <table>
        {isFree ? null : <>
          <thead>
            <tr>
              <th colSpan={2}>SUPPORT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Knowledge Base</td>
              <td><a href="https://portal.support.canonical.com/?_ga=2.3371065.849364026.1691488233-1001052631.1648559628">Online library of articles and tutorials</a></td>
            </tr>
            {supportLevel == "None" ? null : <tr>
              <td>{supportLevel}</td>
              <td><a href="https://portal.support.canonical.com/staff/s/contactsupport">Phone and ticket support</a></td>
            </tr>}
            <tr>
              <td>Ubuntu Assurance Program</td>
              <td><a href="https://ubuntu.com/legal/ubuntu-pro-assurance">Protecting your business from IP infringement</a></td>
            </tr>
          </tbody>
        </>}
        <thead>
          <tr>
            <th colSpan={2}>Security and Compliance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ESM</td>
            <td><a href="https://ubuntu.com/pro/tutorial">Set up access to security updates with ESM</a></td>
          </tr>
          <tr>
            <td>USG</td>
            <td><a href="/security/certifications/docs/usg">Automated hardening profiles for CIS and DISA STIG</a></td>
          </tr>
          <tr>
            <td>FIPS</td>
            <td><a href="https://ubuntu.com/security/certifications/docs/fips">NIST-certified FIPS 140 cryptographic modules for Ubuntu</a></td>
          </tr>
        </tbody>
      </table >
    </>);
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

  return (
    <div {...wrapperProps}>
      {isBlender ? blenderDocs : UADocs()}
    </div>
  );
};

export default DetailsTabs;
