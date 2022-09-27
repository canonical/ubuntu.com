import React, { useContext } from "react";
import classNames from "classnames";
import { Row, Col, RadioInput } from "@canonical/react-components";
import {
  isPublicCloud,
  Features,
  ProductTypes,
  SLA,
  Support as SupportEnum,
} from "advantage/subscribe/react/utils/utils";
import { FormContext } from "advantage/subscribe/react/utils/FormContext";

const Support = () => {
  const { feature, sla, setSLA, support, setSupport, productType } = useContext(
    FormContext
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSupport(event.target.value as SupportEnum);
  };

  const infraOnlySupportDisabled = ProductTypes.desktop === productType;
  const appsOnlySupportDisabled =
    ProductTypes.desktop === productType || Features.infra === feature;
  const fullSupportDisabled = Features.infra === feature;

  return (
    <div
      className={classNames({
        row: true,
        "u-disable": isPublicCloud(productType),
      })}
      data-testid="wrapper"
    >
      <Row style={{ gap: "0" }} className="u-hide--small">
        <Col size={4} className="description-column">
          <div className="support-heading">
            <strong>What&apos;s included?</strong>
          </div>
          <hr />
          <div className="support-row">
            <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
              Open source applications
            </a>
          </div>
          <hr />
          <div className="support-row">
            <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
              Ubuntu base OS
            </a>
          </div>
          <hr />
          <div className="support-row">
            <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
              Kubernetes, LXD, Charms
            </a>
          </div>
          <hr />
          <div className="support-row">
            <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
              OpenStack, MAAS
            </a>
          </div>
          <hr />
          <div className="support-row">
            <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
              Ceph and Swift storage
            </a>
          </div>
        </Col>
        <Col size={2}>
          <div
            className={classNames({
              "p-card--radio--column": true,
              "is-selected": support === SupportEnum.none,
            })}
          >
            <label className="p-radio u-align-text--center">
              <input
                className="p-radio__input"
                autoComplete="off"
                type="radio"
                aria-labelledby={`none-label`}
                value={SupportEnum.none}
                checked={support === SupportEnum.none}
                onChange={handleChange}
              />
              <span className="p-radio__label" id={`none-label`}>
                <RadioInput
                  labelClassName="inner-support-label"
                  label={"No, thank you"}
                  checked={support === SupportEnum.none}
                  value={SupportEnum.none}
                  onChange={handleChange}
                />
                <hr />
                <div className="support-row not-supported">—</div>
                <hr />
                <div className="support-row not-supported">—</div>
                <hr />
                <div className="support-row not-supported">—</div>
                <hr />
                <div className="support-row not-supported">—</div>
                <hr />
                <div className="support-row not-supported">—</div>
              </span>
            </label>
          </div>
        </Col>
        <Col size={2}>
          <div
            className={classNames({
              "p-card--radio--column": true,
              "is-selected": support === SupportEnum.infra,
            })}
          >
            <label className="p-radio u-align-text--center">
              <input
                className="p-radio__input"
                autoComplete="off"
                type="radio"
                aria-labelledby={`infra-label`}
                value={SupportEnum.infra}
                checked={support === SupportEnum.infra}
                onChange={handleChange}
              />
              <span className="p-radio__label" id={`infra-label`}>
                <RadioInput
                  labelClassName="inner-support-label"
                  label={"Infra only"}
                  checked={support === SupportEnum.infra}
                  value={SupportEnum.infra}
                  onChange={handleChange}
                />
                <hr />
                <div className="support-row not-supported">—</div>
                <hr />
                <div className="support-row">
                  <i className="p-icon--success"></i>Included
                </div>
                <hr />
                <div className="support-row">
                  <i className="p-icon--success"></i>Included
                </div>
                <hr />
                <div className="support-row">
                  <i className="p-icon--success"></i>Included
                </div>
                <hr />
                <div className="support-row">
                  <i className="p-icon--success"></i>Included
                </div>
              </span>
            </label>
          </div>
        </Col>
        <Col size={2}>
          <div
            className={classNames({
              "p-card--radio--column": true,
              "is-selected": support === SupportEnum.apps,
            })}
          >
            <label className="p-radio u-align-text--center">
              <input
                className="p-radio__input"
                autoComplete="off"
                type="radio"
                aria-labelledby={`apps-label`}
                value={SupportEnum.apps}
                checked={support === SupportEnum.apps}
                onChange={handleChange}
              />
              <span className="p-radio__label" id={`apps-label`}>
                <RadioInput
                  labelClassName="inner-support-label"
                  label={"Apps only"}
                  checked={support === SupportEnum.apps}
                  value={SupportEnum.apps}
                  onChange={handleChange}
                />
                <hr />
                <div className="support-row">
                  <i className="p-icon--success"></i>Included
                </div>
                <hr />
                <div className="support-row">
                  <i className="p-icon--success"></i>Included
                </div>
                <hr />
                <div className="support-row">
                  <i className="p-icon--success"></i>Included
                </div>
                <hr />
                <div className="support-row">
                  <i className="p-icon--success"></i>Included
                </div>
                <hr />
                <div className="support-row not-supported">—</div>
              </span>
            </label>
          </div>
        </Col>
        <Col size={2}>
          <div
            className={classNames({
              "p-card--radio--column": true,
              "is-selected": support === SupportEnum.full,
            })}
          >
            <label className="p-radio u-align-text--center">
              <input
                className="p-radio__input"
                autoComplete="off"
                type="radio"
                aria-labelledby={`full-label`}
                value={SupportEnum.full}
                checked={support === SupportEnum.full}
                onChange={handleChange}
              />
              <span className="p-radio__label" id={`full-label`}>
                <RadioInput
                  labelClassName="inner-support-label"
                  label={"Infra & Apps"}
                  checked={support === SupportEnum.full}
                  value={SupportEnum.full}
                  onChange={handleChange}
                />
                <hr />
                <div className="support-row">
                  <i className="p-icon--success"></i>Included
                </div>
                <hr />
                <div className="support-row">
                  <i className="p-icon--success"></i>Included
                </div>
                <hr />
                <div className="support-row">
                  <i className="p-icon--success"></i>Included
                </div>
                <hr />
                <div className="support-row">
                  <i className="p-icon--success"></i>Included
                </div>
                <hr />
                <div className="support-row">
                  <i className="p-icon--success"></i>Included
                </div>
              </span>
            </label>
          </div>
        </Col>
      </Row>
      <Col className="u-hide u-show--small" size={12}>
        <div
          className={classNames({
            "p-card--radio": true,
            "is-selected": SupportEnum.none === support,
            "u-disable": false,
          })}
          onClick={() => setSupport(SupportEnum.none)}
        >
          <RadioInput
            inline
            label="No, thank you"
            value={SupportEnum.none}
            checked={support === SupportEnum.none}
          />
          <hr className="u-sv1" />
          <span>
            <i className="p-icon--error"></i> Open Source Applications
          </span>
          <hr className="u-sv1" />
          <span>
            <i className="p-icon--error"></i> Ubuntu Base OS
          </span>
          <hr className="u-sv1" />
          <span>
            <i className="p-icon--error"></i> Kubernetes, LXD, Charms
          </span>
          <hr className="u-sv1" />
          <span>
            <i className="p-icon--error"></i> Openstack, MAAS
          </span>
          <hr className="u-sv1" />
          <span>
            <i className="p-icon--error"></i> Ceph and Swift storage
          </span>
        </div>
      </Col>
      <Col className="u-hide u-show--small" size={12}>
        <div
          className={classNames({
            "p-card--radio": true,
            "is-selected": SupportEnum.infra === support,
            "u-disable": infraOnlySupportDisabled,
          })}
          onClick={() => setSupport(SupportEnum.infra)}
        >
          <RadioInput
            inline
            label="Infra only"
            value={SupportEnum.infra}
            checked={support === SupportEnum.infra}
          />
          <hr className="u-sv1" />
          <span>
            <i className="p-icon--error"></i> Open Source Applications
          </span>
          <hr className="u-sv1" />
          <span>
            <i className="p-icon--success"></i> Ubuntu Base OS
          </span>
          <hr className="u-sv1" />
          <span>
            <i className="p-icon--success"></i> Kubernetes, LXD, Charms
          </span>
          <hr className="u-sv1" />
          <span>
            <i className="p-icon--success"></i> Openstack, MAAS
          </span>
          <hr className="u-sv1" />
          <span>
            <i className="p-icon--success"></i> Ceph and Swift storage
          </span>
        </div>
      </Col>
      <Col className="u-hide u-show--small" size={12}>
        <div
          className={classNames({
            "p-card--radio": true,
            "is-selected": SupportEnum.apps === support,
            "u-disable": appsOnlySupportDisabled,
          })}
          onClick={() => setSupport(SupportEnum.apps)}
        >
          <RadioInput
            inline
            label="Apps only"
            value={SupportEnum.apps}
            checked={support === SupportEnum.apps}
          />
          <hr className="u-sv1" />
          <span>
            <i className="p-icon--success"></i> Open Source Applications
          </span>
          <hr className="u-sv1" />
          <span>
            <i className="p-icon--success"></i> Ubuntu Base OS
          </span>
          <hr className="u-sv1" />
          <span>
            <i className="p-icon--success"></i> Kubernetes, LXD, Charms
          </span>
          <hr className="u-sv1" />
          <span>
            <i className="p-icon--success"></i> Openstack, MAAS
          </span>
          <hr className="u-sv1" />
          <span>
            <i className="p-icon--error"></i> Ceph and Swift storage
          </span>
        </div>
      </Col>
      <Col className="u-hide u-show--small" size={12}>
        <div
          className={classNames({
            "p-card--radio": true,
            "is-selected": SupportEnum.full === support,
            "u-disable": fullSupportDisabled,
          })}
          onClick={() => setSupport(SupportEnum.full)}
        >
          <RadioInput
            inline
            label="Infra &amp; Apps"
            value={SupportEnum.full}
            checked={support === SupportEnum.full}
          />
          <hr className="u-sv1" />
          <span>
            <i className="p-icon--success"></i> Open Source Applications
          </span>
          <hr className="u-sv1" />
          <span>
            <i className="p-icon--success"></i> Ubuntu Base OS
          </span>
          <hr className="u-sv1" />
          <span>
            <i className="p-icon--success"></i> Kubernetes, LXD, Charms
          </span>
          <hr className="u-sv1" />
          <span>
            <i className="p-icon--success"></i> Openstack, MAAS
          </span>
          <hr className="u-sv1" />
          <span>
            <i className="p-icon--success"></i> Ceph and Swift storage
          </span>
        </div>
      </Col>
      {support !== SupportEnum.none ? (
        <>
          <Col size={12}>
            <hr className="u-sv2" />
          </Col>
          <Col size={3}>
            <p className="p-heading--5">Response Time</p>
          </Col>
          <Col size={9}>
            <div className="p-segmented-control">
              <div
                className="p-segmented-control__list"
                role="tablist"
                aria-label="LTS version options"
              >
                <button
                  className="p-segmented-control__button"
                  role="tab"
                  aria-selected={SLA.weekday === sla}
                  aria-controls="Weekday"
                  id="Weekday"
                  onClick={(e) => {
                    e.preventDefault();
                    setSLA(SLA.weekday);
                  }}
                  style={{ textAlign: "justify" }}
                >
                  <span>Weekday</span>
                  <p className="p-text--small u-no-margin--bottom">
                    Up to 4h response time
                  </p>
                </button>
                <button
                  className="p-segmented-control__button"
                  role="tab"
                  aria-selected={SLA.everyday === sla}
                  aria-controls="24/7"
                  id="24/7"
                  onClick={(e) => {
                    e.preventDefault();
                    setSLA(SLA.everyday);
                  }}
                  style={{ textAlign: "justify" }}
                >
                  <span>24/7</span>
                  <p className="p-text--small u-no-margin--bottom">
                    Up to 1h response time
                  </p>
                </button>
              </div>
            </div>
          </Col>
        </>
      ) : null}
    </div>
  );
};

export default Support;
