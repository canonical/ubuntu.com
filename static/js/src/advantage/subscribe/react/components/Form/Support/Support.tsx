import React, { useContext } from "react";
import classNames from "classnames";
import { Col, Row } from "@canonical/react-components";
import RadioCard from "../RadioCard";
import {
  Features,
  isPublicCloud,
  LTSVersions,
  ProductIDs,
  ProductTypes,
  Support as SupportEnum,
} from "advantage/subscribe/react/utils/utils";
import { FormContext } from "advantage/subscribe/react/utils/FormContext";
import { currencyFormatter } from "advantage/react/utils";

const Support = () => {
  const { support, setSupport, version, productType, feature } = useContext(
    FormContext
  );

  const isWeirdAppsID =
    feature === Features.apps && productType === ProductTypes.physical;

  const essentialID = isWeirdAppsID
    ? `${feature}-essential-yearly`
    : `${feature}-essential-${productType}-yearly`;

  const standardID = isWeirdAppsID
    ? `${feature}-standard-yearly`
    : `${feature}-standard-${productType}-yearly`;

  const advancedID = isWeirdAppsID
    ? `${feature}-advanced-yearly`
    : `${feature}-advanced-${productType}-yearly`;

  const supportPrices = {
    standard:
      ((window.productList[standardID as ProductIDs]?.price.value ?? 0) -
        (window.productList[essentialID as ProductIDs]?.price.value ?? 0)) /
      100,
    advanced:
      ((window.productList[advancedID as ProductIDs]?.price.value ?? 0) -
        (window.productList[essentialID as ProductIDs]?.price.value ?? 0)) /
      100,
  };

  const onlyEssential =
    version === LTSVersions.xenial ||
    version === LTSVersions.trusty ||
    (productType === ProductTypes.desktop && feature === Features.apps);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSupport(event.target.value as SupportEnum);
  };

  return (
    <div
      className={classNames({
        "u-disable": isPublicCloud(productType),
      })}
      data-testid="wrapper"
    >
      <Row>
        <Col size={12} className="radio-wrapper--stacking">
          <RadioCard
            name="support"
            value={SupportEnum.essential}
            selectedValue={support}
            handleChange={handleChange}
            dataTestid="essential"
          >
            <div className="u-align-items--center">
              <span>
                <strong>No, thanks</strong>
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
            selectedValue={support}
            handleChange={handleChange}
            disabled={onlyEssential}
            dataTestid="standard"
          >
            <div className="u-align-items--center">
              <span>
                <strong>24 hours, 5 days a week</strong>
                <br />
                <small className="u-text-light">Phone and ticket support</small>
              </span>
              <img src="https://assets.ubuntu.com/v1/86f3a312-UA_24-5_Support.svg" />
              {supportPrices.standard ? (
                <p id="essential-support-costs">
                  +{currencyFormatter.format(supportPrices.standard)} per
                  machine per year
                </p>
              ) : null}
            </div>
          </RadioCard>
          <RadioCard
            name="support"
            value={SupportEnum.advanced}
            selectedValue={support}
            handleChange={handleChange}
            disabled={onlyEssential}
            dataTestid="advanced"
          >
            <div className="u-align-items--center">
              <span>
                <strong>24 hours, 7 days a week</strong>
                <br />
                <small className="u-text-light">Phone and ticket support</small>
              </span>
              <img src="https://assets.ubuntu.com/v1/b0af9ede-UA_24-7_Support.svg" />
              {supportPrices.advanced ? (
                <p id="essential-support-costs">
                  +{currencyFormatter.format(supportPrices.advanced)} per
                  machine per year
                </p>
              ) : null}
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
    </div>
  );
};

export default Support;
