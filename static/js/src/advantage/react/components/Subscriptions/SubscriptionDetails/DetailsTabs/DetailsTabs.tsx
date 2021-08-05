import { Col, Icon, List, Row, Tabs } from "@canonical/react-components";
import React, { HTMLProps, useState } from "react";
import type { ReactNode } from "react";

enum ActiveTab {
  DOCUMENTATION = "documentation",
  FEATURES = "features",
}

type Props = HTMLProps<HTMLDivElement>;

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

const DetailsTabs = (wrapperProps: Props) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.FEATURES);
  let content: ReactNode | null;
  switch (activeTab) {
    case ActiveTab.DOCUMENTATION:
      content = (
        <div data-test="docs-content">
          {generateList("Documentation & tutorials", [
            {
              label: <a href="#">Getting started / UA client</a>,
            },
            {
              label: <a href="#">Attaching machines</a>,
            },
            {
              label: <a href="#">ESM Infra & ESM Apps</a>,
            },
            {
              label: <a href="#">Livepatch</a>,
            },
            {
              label: <a href="#">Certification</a>,
            },
          ])}
        </div>
      );
      break;
    case ActiveTab.FEATURES:
    default:
      content = (
        <>
          <Row className="u-sv1" data-test="features-content">
            <Col size={4}>
              {generateList("Included", [
                {
                  icon: "success",
                  label: "ESM Infra",
                },
                {
                  icon: "success",
                  label: "24/5 support",
                },
                {
                  icon: "success",
                  label: "Livepatch",
                },
              ])}
            </Col>
            <Col size={4}>
              {generateList("Not included", [
                {
                  icon: "error",
                  label: "ESM Apps",
                },
              ])}
            </Col>
          </Row>
          <a href="#">Service description &rsaquo;</a>
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
