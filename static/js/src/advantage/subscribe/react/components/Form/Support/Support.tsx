import React from "react";
import { Col, Row } from "@canonical/react-components";
import RadioCard from "../RadioCard";
import { Support as SupportEnum } from "advantage/subscribe/react/utils/utils";

const Support = () => {
  const [selectedValue, setSelectedValue] = React.useState<SupportEnum>(
    SupportEnum.essential
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value as SupportEnum);
  };

  return (
    <li className="p-stepped-list__item" data-step="version">
      <h3 className="p-stepped-list__title">Do you also want tech support?</h3>
      <Row>
        <Col size={12} className="radio-wrapper--staggering">
          <RadioCard
            name="support"
            value={SupportEnum.essential}
            selectedValue={selectedValue}
            handleChange={handleChange}
          >
            <div className="u-align-items--center">
              <span>
                No, thanks
                <br />
                <small className="u-text-light">
                  Software and security updates only
                </small>
              </span>
              <img src="https://assets.ubuntu.com/v1/437efe31-UA_Software-security-Updates.svg" />
              <p id="essential-support-costs">No additional costs</p>
            </div>
          </RadioCard>
          <RadioCard
            name="support"
            value={SupportEnum.standard}
            selectedValue={selectedValue}
            handleChange={handleChange}
          >
            <div className="u-align-items--center">
              <span>
                24 hours, 5 days a week
                <br />
                <small className="u-text-light">Phone and ticket support</small>
              </span>
              <img src="https://assets.ubuntu.com/v1/86f3a312-UA_24-5_Support.svg" />
              <p id="essential-support-costs">$750 per machine per year</p>
            </div>
          </RadioCard>
          <RadioCard
            name="support"
            value={SupportEnum.advanced}
            selectedValue={selectedValue}
            handleChange={handleChange}
          >
            <div className="u-align-items--center">
              <span>
                24 hours, 7 days a week
                <br />
                <small className="u-text-light">Phone and ticket support</small>
              </span>
              <img src="https://assets.ubuntu.com/v1/b0af9ede-UA_24-7_Support.svg" />
              <p id="essential-support-costs">$1,500 per machine per year</p>
            </div>
          </RadioCard>
        </Col>
      </Row>
      <Row>
        <Col size={12}>
          <p>
            <a
              href="/legal/ubuntu-advantage-service-description"
              target="_blank"
              rel="noopener noreferrer"
            >
              Details of our coverage and response times&nbsp;&rsaquo;
            </a>
          </p>
        </Col>
      </Row>
    </li>
  );
};

export default Support;
