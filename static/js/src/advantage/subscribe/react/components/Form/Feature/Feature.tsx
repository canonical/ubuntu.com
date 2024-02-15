import React, { useContext } from "react";
import classNames from "classnames";
import { Col, RadioInput, Row } from "@canonical/react-components";
import {
  Features,
  ProductTypes,
  LTSVersions,
} from "advantage/subscribe/react/utils/utils";
import { FormContext } from "advantage/subscribe/react/utils/FormContext";

const Feature = () => {
  const { productType, feature, setFeature, version } = useContext(FormContext);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFeature(event.target.value as Features);
    localStorage.setItem(
      "pro-selector-feature",
      JSON.stringify(event.target.value as Features)
    );
  };

  const infraOnlyDisabled =
    productType === ProductTypes.desktop && version !== LTSVersions.trusty;

  const proDisabled = version === LTSVersions.trusty;

  return (
    <>
      <Row>
        <Col size={6}><h2>What security coverage do you need?</h2></Col>
        <Col size={6}>
          <div
            className={classNames({
              row: true,
              "p-divider": true,
            })}
            data-testid="wrapper">
            <p>Not sure? Run <code> pro security-status</code> to find out which packages and repositories you are currently using.</p>
            <RadioInput
              label="Pro - all repositories"
              checked={feature === Features.pro}
              value={Features.pro}
              onChange={handleChange}
              disabled={proDisabled}
            />
            <hr />
            <RadioInput label="Infra only - limited subset"
              checked={feature === Features.infra}
              value={Features.infra}
              onChange={handleChange}
              disabled={infraOnlyDisabled}
            />
          </div>
        </Col>
        <Col size={11} emptyMedium={2} emptyLarge={2}>
          <hr className="is-fixed-width" />
        </Col>
      </Row>
      <Row >
        <Col size={2} emptyMedium={2} emptyLarge={2}>
          <h1>{feature === Features.pro ? "25000" : "2300"}</h1>
        </Col>
        <Col size={3}>
          <p>Covers {feature === Features.pro ? "25000" : "2300"} packages in Ubuntu Main {feature === Features.pro ? "and Universe" : ""}</p>
        </Col>
        <Col size={6}>
          <div className="p-graphic-main" />
          <div className={classNames({
            "p-graphic-universe": feature === Features.pro,
            "p-graphic-universe--empty": feature === Features.infra
          })} />
          <p className="p-text--small graphic-legend-main">LTS standard security maintenance for Ubuntu Main (initial 5 years)</p>
          {feature === Features.pro && <p className="p-text--small graphic-legend-universe">LTS Expanded Security Maintenance (ESM) for Ubuntu Main (additional 5 years)</p>}
        </Col>
      </Row>
      <Row>
        <Col size={11} emptySmall={2} emptyLarge={2}>
          <div className="p-logo-section--dense">
            <div className="p-logo-section__items u-sv3">
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/3ad7e0a9-systemd-logo.png"
                  alt="Systemd"
                  width="67"
                  height="64"
                  className="p-logo-section__logo"
                  />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/3b69f369-ruby-logo.png"
                  alt=""
                  width="104"
                  height="252"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/bedc5d63-rabbitmq-logo.png"
                  alt=""
                  width="248"
                  height="257"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/c2cd0bc4-php-logo.png"
                  alt=""
                  width="160"
                  height="252"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/86fdc1d7-openssl-logo.png"
                  alt=""
                  width="172"
                  height="252"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/a92957da-nginex logo.png"
                  alt=""
                  width="184"
                  height="258"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/0e5bcec1-mysql logo.png"
                  alt=""
                  width="180"
                  height="252"
                  className="p-logo-section__logo"
                />
              </div>
              { feature===Features.pro &&
              <>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/6cdc1a69-ansible logo.png"
                  alt=""
                  width="124"
                  height="253"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/605af026-apache tomcat logo.png"
                  alt=""
                  width="204"
                  height="253"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/5dbf023e-docker logo.png"
                  alt=""
                  width="244"
                  height="245"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/933cc587-etcd logo.png"
                  alt=""
                  width="196"
                  height="253"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/1f55452f-glusterfs logo.png"
                  alt=""
                  width="196"
                  height="253"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/973c8e10-Frame 19.png"
                  alt=""
                  width="232"
                  height="253"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/3ec28413-powerdns logo.png"
                  alt=""
                  width="252"
                  height="253"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/7e68a46f-perl logo.png"
                  alt=""
                  width="252"
                  height="253"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/35e5c439-puppet logo.png"
                  alt=""
                  width="236"
                  height="253"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/2ad3b2ba-python logo.png"
                  alt=""
                  width="252"
                  height="253"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/8279fc01-go logo.png"
                  alt=""
                  width="168"
                  height="253"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/94f1e342-nagios logo.png"
                  alt=""
                  width="252"
                  height="253"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/5b13a988-nginex logo-1.png"
                  alt=""
                  width="252"
                  height="253"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/56d8741e-node-logo.png"
                  alt=""
                  width="196"
                  height="253"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/fa78f5b4-openjdk logo.png"
                  alt=""
                  width="240"
                  height="253"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/05c01589-redis logo.png"
                  alt=""
                  width="252"
                  height="253"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/850af73c-ruby-rails logo.png"
                  alt=""
                  width="240"
                  height="253"
                  className="p-logo-section__logo"
                />
              </div>
              <div className="p-logo-section__item u-sv1">
                <img
                  src="https://assets.ubuntu.com/v1/93af6c88-rust logo.png"
                  alt=""
                  width="120"
                  height="252"
                  className="p-logo-section__logo"
                />
              </div>
              </>}
            </div>
          </div>
        </Col>
      </Row>

      <Col
        className="p-divider__block u-align--center u-hide u-show--small"
        size={6}
        small={2}
      >
        <h4>2,300+</h4>
        <p>packages in Ubuntu main, including:</p>
      </Col>
      <Col
        className={classNames({
          "p-divider__block u-align--center u-hide u-show--small": true,
          "u-disable": Features.infra === feature,
        })}
        size={6}
        small={2}
      >
        <h4>23,000+</h4>
        <p>packages in Ubuntu universe, including:</p>
      </Col>
    </>
  );
};

export default Feature;