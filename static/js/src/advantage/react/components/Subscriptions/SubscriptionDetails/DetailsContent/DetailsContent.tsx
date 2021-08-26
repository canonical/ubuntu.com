import {
  CodeSnippet,
  CodeSnippetBlockAppearance,
  Col,
  ColProps,
  Row,
} from "@canonical/react-components";
import React from "react";

import DetailsTabs from "../DetailsTabs";

type Feature = {
  size?: ColProps["size"];
  title: string;
  value: string | number;
};

const generateFeatures = (features: Feature[]) =>
  features.map(({ size = 3, title, value }) => (
    <Col key={title} medium={2} size={size} small={2}>
      <p className="u-text--muted u-no-margin--bottom">{title}</p>
      <p className="u-no-margin--bottom u-sv1">{value}</p>
    </Col>
  ));

const DetailsContent = () => {
  return (
    <>
      <Row className="u-sv4">
        {generateFeatures([
          {
            title: "Created",
            value: "12.02.2021",
          },
          {
            title: "Expires",
            value: "23.04.2022",
          },
          {
            size: 2,
            title: "Billing",
            value: "Annual",
          },
          {
            title: "Cost",
            value: "$25,000 USD/yr",
          },
          {
            title: "Machine type",
            value: "Virtual",
          },
          {
            title: "Machines",
            value: "10",
          },
        ])}
      </Row>
      <h5 className="u-no-padding--top p-subscriptions__details-small-title">
        Subscription
      </h5>
      <CodeSnippet
        blocks={[
          {
            appearance: CodeSnippetBlockAppearance.URL,
            code: "C2439dskds4efni0923u22q4234",
          },
        ]}
        className="u-sv4 u-no-margin--bottom"
      />
      <DetailsTabs />
    </>
  );
};

export default DetailsContent;
