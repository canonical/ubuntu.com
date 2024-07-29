import React, { useEffect } from "react";
import { Row, Col, Icon, ICONS } from "@canonical/react-components";
import ChannelOffersList from "./components/ChannelOffersList/ChannelOffersList";

const Distributor = () => {
  const distributorSelectorStates = [
    "distributor-selector-subscriptionList",
    "distributor-selector-currency",
    "channel-offer-data",
    "distributor-selector-duration",
    "distributor-selector-technicalUserContact",
    "distributor-selector-productType",
    "distributor-product-listing",
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
              alignItems: "baseline",
            }}
          >
            <h2>Available deal registrations</h2>
            <div>
              <a
                className="p-button--positive"
                href="https://www.partner.canonical.com/#/deals/new"
              >
                <Icon
                  name={ICONS.externalLink}
                  light={true}
                  style={{ marginRight: "0.3rem" }}
                />
                Register new deal
              </a>
            </div>
          </div>
          <ChannelOffersList />
        </Col>
      </Row>
    </div>
  );
};

export default Distributor;
