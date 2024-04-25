import React from "react";
import { Row, Col, Button, Icon, ICONS } from "@canonical/react-components";
import ChannelOffersList from "./components/ChannelOffersList/ChannelOffersList";

const Distributor = () => {
  return (
    <div className="p-strip">
      <Row>
        <Col size={12}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <h2>Available deal registreations</h2>
            {/* Todo: update link */}
            <Button appearance="positive" hasIcon={true}>
              <Icon name={ICONS.externalLink} light={true} />
              <span>Register new deal</span>
            </Button>
          </div>
          <ChannelOffersList />
        </Col>
        <p>
          {/* Todo: update link */}
          <a href="" className="p-distributor-link--external">
            View all deal registreations
          </a>
        </p>
      </Row>
    </div>
  );
};

export default Distributor;
