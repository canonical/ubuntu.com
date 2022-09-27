import React, { useContext } from "react";
import classNames from "classnames";
import { Col, RadioInput, Row } from "@canonical/react-components";
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

  const infraOnlyDisabled = ProductTypes.desktop === productType;

  return (
    <div
      className={classNames({
        row: true,
        "p-divider": true,
        "u-disable": isPublicCloud(productType),
      })}
      data-testid="wrapper"
    >
      <Row style={{ gap: "0" }} className="u-hide--small">
        <Col size={6} className="description-column">
          <div className="heading">
            <strong>CVE Security patching coverage until 2030 for:</strong>
          </div>
          <hr />
          <div className="main">
            <p>
              Over 2,300 open source deb packages in Ubuntu Main repository
              until 2030 (extended from 2025), including:
            </p>
            <div className="logos-wrapper">
              <img src="https://placekitten.com/91/40" alt="" />
              <img src="https://placekitten.com/91/40" alt="" />
              <img src="https://placekitten.com/91/40" alt="" />
              <img src="https://placekitten.com/91/40" alt="" />
            </div>
          </div>
          <hr />
          <div className="universe">
            <p>
              Over 2,300 open source deb packages in Ubuntu Main repository
              until 2030 (extended from 2025), including:
            </p>
            <div className="logos-wrapper">
              <img src="https://placekitten.com/91/40" alt="" />
              <img src="https://placekitten.com/91/40" alt="" />
              <img src="https://placekitten.com/91/40" alt="" />
              <img src="https://placekitten.com/91/40" alt="" />
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
                  labelClassName="inner-label"
                  label={"Ubuntu pro"}
                  checked={feature === Features.pro}
                  value={Features.pro}
                  onChange={handleChange}
                />
                <hr />
                <div className="included">
                  <i className="p-icon--success"></i>Included
                </div>
                <hr />
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
              "u-disable": infraOnlyDisabled,
            })}
          >
            <label className="p-radio u-align-text--center">
              <input
                className="p-radio__input"
                autoComplete="off"
                type="radio"
                aria-labelledby={`infra-label`}
                value={Features.infra}
                checked={feature === Features.infra}
                onChange={handleChange}
              />
              <span className="p-radio__label" id={`infra-label`}>
                <RadioInput
                  labelClassName="inner-label"
                  label={"Ubuntu pro, infra only"}
                  checked={feature === Features.infra}
                  value={Features.infra}
                  onChange={handleChange}
                />
                <hr />
                <div className="included">
                  <i className="p-icon--success"></i>Included
                </div>
                <hr />
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
          value={Features.pro}
          checked={feature === Features.pro}
          onChange={handleChange}
        />
        <RadioInput
          label="Ubuntu Pro, Infra Only"
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
