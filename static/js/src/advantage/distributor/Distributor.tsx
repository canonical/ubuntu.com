import { useEffect } from "react";
import { Row, Col, Icon, ICONS } from "@canonical/react-components";
import ChannelOffersList from "./components/ChannelOffersList/ChannelOffersList";
import { DISTRIBUTOR_SELECTOR_KEYS } from "./utils/utils";

const Distributor = () => {
  const distributorSelectorKeysArray = Object.values(DISTRIBUTOR_SELECTOR_KEYS);

  useEffect(() => {
    distributorSelectorKeysArray.forEach((key) => {
      localStorage.removeItem(key);
    });
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
                target="_blank"
                rel="noopener noreferrer"
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
