import React, { useContext } from "react";
import classNames from "classnames";
import { Col, List, Row } from "@canonical/react-components";
import RadioCard from "../RadioCard";
import {
  Features,
  isPublicCloud,
  ProductTypes,
} from "advantage/subscribe/react/utils/utils";
import { FormContext } from "advantage/subscribe/react/utils/FormContext";

const Feature = () => {
  const { productType, feature, setFeature } = useContext(FormContext);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFeature(event.target.value as Features);
  };

  return (
    <div
      className={classNames({
        "u-disable": isPublicCloud(productType),
      })}
      data-testid="wrapper"
    >
      <Row>
        <p>
          Essential features are already included in your subscription.
          <br />
          <a href="/support">
            See what is included with Applications coverage.
          </a>
        </p>
        <Col size={12} className="radio-wrapper--stacking">
          <RadioCard
            name="feature"
            value={Features.infra}
            selectedValue={feature}
            handleChange={handleChange}
            radioLabel="Select Infra only"
          >
            <h4 className="p-card__title">Infra</h4>
            <hr className="u-sv1" />
            <List
              className="u-align-text--left"
              items={[
                <>
                  Security coverage for high and critical CVEs with extended
                  security maintenance for over 2,000 packages including:
                  <h5>OpenStack, Ceph raw storage, MAAS, KVM.</h5>
                </>,
                <>
                  Optional tech support for Ubuntu OS and the underlying
                  infrastructure as specified above
                </>,
              ]}
              ticked
            />
          </RadioCard>
          <RadioCard
            name="feature"
            value={Features.apps}
            selectedValue={feature}
            handleChange={handleChange}
            radioLabel="Select Apps only"
          >
            <h4 className="p-card__title">Apps</h4>
            <hr className="u-sv1" />
            <List
              className="u-align-text--left"
              items={[
                <>
                  Security coverage for high and critical CVEs with extended
                  security maintenance for over 28,000 packages including:
                  <h5> NodeJS, Django, NGINX, Redis, Kafka, ROS.</h5>
                </>,
                <>
                  Optional tech support for Ubuntu OS and selected open source
                  applications
                </>,
              ]}
              ticked
            />
          </RadioCard>
          <RadioCard
            name="feature"
            value={Features.pro}
            selectedValue={feature}
            handleChange={handleChange}
            radioLabel="Select Infra + Apps"
            disabled={productType === ProductTypes.desktop}
            dataTestid="pro-feature"
          >
            <h4 className="p-card__title">Infra + Apps</h4>
            <hr className="u-sv1" />
            <List
              className="u-align-text--left"
              items={[
                <>
                  Security coverage for high and critical CVEs with extended
                  security maintenance for over 30,000 packages including:
                  <h5>Infrastructure, Applications.</h5>
                </>,
                <>
                  Optional tech support for Ubuntu OS, the underlying
                  infrastructure and selected open source applications
                </>,
              ]}
              ticked
            />
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

export default Feature;
