import React, { useEffect } from "react";
import { Row, Col, Button, Icon, ICONS } from "@canonical/react-components";
import ChannelOffersList from "./components/ChannelOffersList/ChannelOffersList";

const Distributor = () => {
  const distributorSelectorStates = [
    "distributor-selector-subscriptionList",
    "distributor-selector-currency",
    "channel-offer-data",
    "distributor-selector-duration",
    "distributor-selector-techincalUserContact",
    "distributor-selector-productType",
  ];

  useEffect(() => {
    distributorSelectorStates.forEach((state) =>
      localStorage.removeItem(state)
    );
  }, []);

  return (
    <div className="p-strip">
      <Row>
        <Col size={12}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
            }}
          >
            <h2>Available deal registrations</h2>
            <Button
              appearance="positive"
              hasIcon={true}
              onClick={() =>
                (window.location.href =
                  "https://www.partner.canonical.com/#/deals/new")
              }
            >
              <Icon name={ICONS.externalLink} light={true} />
              <span>Register new deal</span>
            </Button>
          </div>
          <ChannelOffersList />
        </Col>
      </Row>
    </div>
  );
};

export default Distributor;
