import React, { useContext } from "react";
import classNames from "classnames";
import { Col, RadioInput, Row } from "@canonical/react-components";
import { Features, ProductTypes } from "advantage/subscribe/react/utils/utils";
import { FormContext } from "advantage/subscribe/react/utils/FormContext";

const Feature = () => {
  const { productType, feature, setFeature } = useContext(FormContext);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFeature(event.target.value as Features);
    localStorage.setItem(
      "pro-selector-feature",
      JSON.stringify(event.target.value as Features)
    );
  };

  const infraOnlyDisabled = ProductTypes.desktop === productType;

  return (
    <div
      className={classNames({
        row: true,
        "p-divider": true,
      })}
      data-testid="wrapper"
    >
      <Row style={{ gap: "0" }} className="u-hide--small">
        <Col size={6} className="description-column">
          <div className="heading">
            <strong>
              Security coverage for critical, high and selected medium CVEs for:
            </strong>
          </div>
          <div className="main">
            <p>
              Over 2,300 open source deb packages in Ubuntu Main repository for
              10 years, including:
            </p>
            <div className="logos-wrapper">
              <img
                src="https://assets.ubuntu.com/v1/3ad7e0a9-systemd-logo.png"
                alt="Systemd"
              />
              <img
                src="https://assets.ubuntu.com/v1/3cf0ba5d-rabbitmq-logo.png"
                alt="RabbitMQ"
              />
              <img
                src="https://assets.ubuntu.com/v1/9259b689-openssl-logo.png"
                alt="OpenSSL"
              />
              <img
                src="https://assets.ubuntu.com/v1/a0dac4a0-ruby-logo.png"
                alt="Ruby"
              />
              <img
                src="https://assets.ubuntu.com/v1/9cdee338-php-logo.png"
                alt="PHP"
              />
              <img
                src="https://assets.ubuntu.com/v1/8b409e96-nginex+logo.png"
                alt="NGINX"
              />
              <img
                src="https://assets.ubuntu.com/v1/24058ec5-mysql+logo.png"
                alt="MySQL"
              />
            </div>
          </div>
          <div className="universe">
            <p>
              Over 23,000 open source deb packages in Ubuntu Universe repository
              for 10 years, including:
            </p>
            <div className="logos-wrapper">
              <img
                src="https://assets.ubuntu.com/v1/6b709d7b-apache+tomcat+logo.png"
                alt="Apache Tomcat"
              />
              <img
                src="https://assets.ubuntu.com/v1/bb10115e-nagios+logo.png"
                alt="Agios"
              />
              <img
                src="https://assets.ubuntu.com/v1/0d264437-nagios+logo-1.png"
                alt="NodeJS"
              />
              <img
                src="https://assets.ubuntu.com/v1/60a15fa2-puppet-logo.png"
                alt="Puppet"
              />
              <img
                src="https://assets.ubuntu.com/v1/38530c4f-redis-logo.png"
                alt="Redis"
              />
              <img
                src="https://assets.ubuntu.com/v1/e60387dd-rust-logo.png"
                alt="Rust"
              />
              <img
                src="https://assets.ubuntu.com/v1/842e6353-wordpress-logo.png"
                alt="Wordpress"
              />
            </div>
          </div>
        </Col>
        <Col size={3}>
          <div
            className={classNames({
              "p-card--radio--column": true,
              "is-selected": feature === Features.pro,
            })}
          >
            <label className="p-radio u-align-text--center">
              <input
                className="p-radio__input"
                autoComplete="off"
                type="radio"
                aria-labelledby={`pro-label`}
                value={Features.pro}
                checked={feature === Features.pro}
                onChange={handleChange}
              />
              <span className="p-radio__label" id={`pro-label`}>
                <RadioInput
                  labelClassName="inner-label plausible-event-name=proSelector plausible-event-selector=feature+ubuntu+pro"
                  label={"Ubuntu Pro"}
                  checked={feature === Features.pro}
                  value={Features.pro}
                  onChange={handleChange}
                />
                <div className="included">
                  <i className="p-icon--success"></i>Included
                </div>
                <div className="included">
                  <i className="p-icon--success"></i> Included
                </div>
              </span>
            </label>
          </div>
        </Col>
        <Col size={3}>
          <div
            className={classNames({
              "p-card--radio--column": true,
              "is-selected": feature === Features.infra,
            })}
          >
            <label className="p-radio u-align-text--center">
              <input
                data-testid="infra-only"
                className="p-radio__input"
                autoComplete="off"
                type="radio"
                aria-labelledby={`infra-label`}
                value={Features.infra}
                checked={feature === Features.infra}
                onChange={handleChange}
                disabled={infraOnlyDisabled}
              />
              <span className="p-radio__label" id={`infra-label`}>
                <RadioInput
                  labelClassName="inner-label plausible-event-name=proSelector plausible-event-selector=feature+ubuntu+pro+infra+only"
                  label={"Ubuntu Pro (Infra-only)"}
                  checked={feature === Features.infra}
                  value={Features.infra}
                  onChange={handleChange}
                  disabled={infraOnlyDisabled}
                />
                <div className="included">
                  <i className="p-icon--success"></i>Included
                </div>
                <div className="included">
                  <i className="p-icon--error"></i> Not included
                </div>
              </span>
            </label>
          </div>
        </Col>
      </Row>
      <Col className="u-hide u-show--small" size={12} small={4}>
        <RadioInput
          label="Ubuntu Pro"
          labelClassName="plausible-event-name=proSelector plausible-event-selector=feature+ubuntu+pro"
          value={Features.pro}
          checked={feature === Features.pro}
          onChange={handleChange}
        />
        <RadioInput
          label="Ubuntu Pro (Infra-only)"
          labelClassName="plausible-event-name=proSelector plausible-event-selector=feature+ubuntu+pro+infra+only"
          value={Features.infra}
          checked={feature === Features.infra}
          onChange={handleChange}
          disabled={infraOnlyDisabled}
        />
      </Col>
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
    </div>
  );
};

export default Feature;
