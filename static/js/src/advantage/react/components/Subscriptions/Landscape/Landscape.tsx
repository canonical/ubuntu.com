import React from "react";
import { Button, Col, Row } from "@canonical/react-components";

const Landscape = () => {
  return (
    <div className="u-vertically-spaced">
      <Row>
        <Col size={4}>
          <h2>Landscape</h2>
        </Col>
        <Col size={8}>
          <p>Save time and improve security at scale with Landscape.</p>
          <p>
            Landscape SaaS and self-hosted Landscape are included with Ubuntu
            Pro.
          </p>
          <p>
            <Button element="a" href="https://ubuntu.com/landscape/install">
              Install self-hosted Landscape
            </Button>
            <Button
              element="a"
              href="https://ubuntu.com/contact-us/form?product=landscape"
            >
              Request a Landscape SaaS account
            </Button>
          </p>
          <hr />
          <p>
            <a href="https://ubuntu.com/landscape">
              Learn more about Landscape
            </a>
          </p>
        </Col>
      </Row>
    </div>
  );
};
export default Landscape;
