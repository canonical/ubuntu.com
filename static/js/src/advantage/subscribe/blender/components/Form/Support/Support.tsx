import React, { useContext } from "react";
import { Col, Row } from "@canonical/react-components";
import RadioCard from "../RadioCard";
import { FormContext } from "advantage/subscribe/blender/utils/FormContext";
import { Support as SupportEnum } from "advantage/subscribe/blender/utils/utils";

const Support = () => {
  const { support, setSupport } = useContext(FormContext);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSupport(event.target.value as SupportEnum);
  };

  return (
    <div data-testid="wrapper">
      <Row>
        <Col size={12} className="radio-wrapper--stacking">
          <RadioCard
            name="support"
            value={SupportEnum.standard}
            selectedValue={support}
            handleChange={handleChange}
            dataTestid="standard"
          >
            <div className="u-align-items--center">
              <span>
                <strong>24 hours, 5 days a week</strong>
                <br />
                <small className="u-text-light">Phone and ticket support</small>
              </span>
              <img src="https://assets.ubuntu.com/v1/437efe31-UA_Software-security-Updates.svg" />
              <p id="essential-support-costs">$500 per user per year</p>
            </div>
          </RadioCard>
          <RadioCard
            name="support"
            value={SupportEnum.advanced}
            selectedValue={support}
            handleChange={handleChange}
            dataTestid="advanced"
          >
            <div className="u-align-items--center">
              <span>
                <strong>24 hours, 7 days a week</strong>
                <br />
                <small className="u-text-light">Phone and ticket support</small>
              </span>
              <img src="https://assets.ubuntu.com/v1/86f3a312-UA_24-5_Support.svg" />
              <p id="essential-support-costs">$1000 per user per year</p>
            </div>
          </RadioCard>
        </Col>
      </Row>
      <Row>
        <Col size={12}>
          <p>
            <a
              href="/legal/solution-support"
              target="_blank"
              rel="noopener noreferrer"
            >
              Details of our coverage and response times&nbsp;&rsaquo;
            </a>
          </p>
        </Col>
      </Row>
    </div>
  );
};

export default Support;
