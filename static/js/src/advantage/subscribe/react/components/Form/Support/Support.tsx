import React, { useContext } from "react";
import classNames from "classnames";
import { Col, RadioInput } from "@canonical/react-components";
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

  const infraOnlySupportDisabled = (ProductTypes.desktop === productType);
  const appsOnlySupportDisabled = (ProductTypes.desktop === productType) ||(Features.infra === feature);
  const fullSupportDisabled = (Features.infra === feature)

  return (
    <div
      className={classNames({"row": true, "u-disable": isPublicCloud(productType)})}
      data-testid="wrapper"
    >
        <Col className="u-hide--small" size={12}>
          <table className="p-table--selectable">
            <thead>
              <tr>
                <th>What's included?</th>
                <th
                  className={classNames({
                    selected: support === SupportEnum.none,
                  })}
                >
                  <RadioInput
                    inline
                    label="No, thank you"
                    value={SupportEnum.none}
                    checked={support === SupportEnum.none}
                    onChange={handleChange}
                  />
                </th>
                <th
                  className={classNames({
                    selected: support === SupportEnum.infra,
                  })}
                >
                  <RadioInput
                    inline
                    label="Infra only"
                    value={SupportEnum.infra}
                    checked={support === SupportEnum.infra}
                    onChange={handleChange}
                    disabled={infraOnlySupportDisabled}
                  />
                </th>
                <th
                  className={classNames({
                    selected: support === SupportEnum.apps,
                  })}
                >
                  <RadioInput
                    inline
                    label="Apps only"
                    value={SupportEnum.apps}
                    checked={support === SupportEnum.apps}
                    onChange={handleChange}
                    disabled={appsOnlySupportDisabled}
                  />
                </th>
                <th
                  className={classNames({
                    selected: support === SupportEnum.full,
                  })}
                >
                  <RadioInput
                    inline
                    label="Infra &amp; Apps"
                    value={SupportEnum.full}
                    checked={support === SupportEnum.full}
                    onChange={handleChange}
                    disabled={fullSupportDisabled}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Open Source Apps</td>
                <td
                  className={classNames({
                    "u-align--center": true,
                    selected: support === SupportEnum.none,
                  })}
                >
                  —
                </td>
                <td
                  className={classNames({
                    "u-align--center": true,
                    selected: support === SupportEnum.infra,
                  })}
                >
                  —
                </td>
                <td
                  className={classNames({
                    "u-align--center": true,
                    selected: support === SupportEnum.apps,
                  })}
                >
                  <i className="p-icon--success"></i> Included
                </td>
                <td
                  className={classNames({
                    "u-align--center": true,
                    selected: support === SupportEnum.full,
                  })}
                >
                  <i className="p-icon--success"></i> Included
                </td>
              </tr>
              <tr>
                <td>Ubuntu Base OS</td>
                <td
                  className={classNames({
                    "u-align--center": true,
                    selected: support === SupportEnum.none,
                  })}
                >
                  —
                </td>
                <td
                  className={classNames({
                    "u-align--center": true,
                    selected: support === SupportEnum.infra,
                  })}
                >
                  <i className="p-icon--success"></i> Included
                </td>
                <td
                  className={classNames({
                    "u-align--center": true,
                    selected: support === SupportEnum.apps,
                  })}
                >
                  <i className="p-icon--success"></i> Included
                </td>
                <td
                  className={classNames({
                    "u-align--center": true,
                    selected: support === SupportEnum.full,
                  })}
                >
                  <i className="p-icon--success"></i> Included
                </td>
              </tr>
              <tr>
                <td>Kubernetes, LXD, Charms</td>
                <td
                  className={classNames({
                    "u-align--center": true,
                    selected: support === SupportEnum.none,
                  })}
                >
                  —
                </td>
                <td
                  className={classNames({
                    "u-align--center": true,
                    selected: support === SupportEnum.infra,
                  })}
                >
                  <i className="p-icon--success"></i> Included
                </td>
                <td
                  className={classNames({
                    "u-align--center": true,
                    selected: support === SupportEnum.apps,
                  })}
                >
                  <i className="p-icon--success"></i> Included
                </td>
                <td
                  className={classNames({
                    "u-align--center": true,
                    selected: support === SupportEnum.full,
                  })}
                >
                  <i className="p-icon--success"></i> Included
                </td>
              </tr>
              <tr>
                <td>OpenStack, MAAS</td>
                <td
                  className={classNames({
                    "u-align--center": true,
                    selected: support === SupportEnum.none,
                  })}
                >
                  —
                </td>
                <td
                  className={classNames({
                    "u-align--center": true,
                    selected: support === SupportEnum.infra,
                  })}
                >
                  <i className="p-icon--success"></i> Included
                </td>
                <td
                  className={classNames({
                    "u-align--center": true,
                    selected: support === SupportEnum.apps,
                  })}
                >
                  <i className="p-icon--success"></i> Included
                </td>
                <td
                  className={classNames({
                    "u-align--center": true,
                    selected: support === SupportEnum.full,
                  })}
                >
                  <i className="p-icon--success"></i> Included
                </td>
              </tr>
              <tr>
                <td>Ceph and Swift storage</td>
                <td
                  className={classNames({
                    "u-align--center": true,
                    selected: support === SupportEnum.none,
                  })}
                >
                  —
                </td>
                <td
                  className={classNames({
                    "u-align--center": true,
                    selected: support === SupportEnum.infra,
                  })}
                >
                  <i className="p-icon--success"></i> Included
                </td>
                <td
                  className={classNames({
                    "u-align--center": true,
                    selected: support === SupportEnum.apps,
                  })}
                >
                  —
                </td>
                <td
                  className={classNames({
                    "u-align--center": true,
                    selected: support === SupportEnum.full,
                  })}
                >
                  <i className="p-icon--success"></i> Included
                </td>
              </tr>
            </tbody>
          </table>
        </Col>
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
            <span><i className="p-icon--error"></i> Open Source Applications</span>
            <hr className="u-sv1" />
            <span><i className="p-icon--error"></i> Ubuntu Base OS</span>
            <hr className="u-sv1" />
            <span><i className="p-icon--error"></i> Kubernetes, LXD, Charms</span>
            <hr className="u-sv1" />
            <span><i className="p-icon--error"></i> Openstack, MAAS</span>
            <hr className="u-sv1" />
            <span><i className="p-icon--error"></i> Ceph and Swift storage</span>
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
            <span><i className="p-icon--error"></i> Open Source Applications</span>
            <hr className="u-sv1" />
            <span><i className="p-icon--success"></i> Ubuntu Base OS</span>
            <hr className="u-sv1" />
            <span><i className="p-icon--success"></i> Kubernetes, LXD, Charms</span>
            <hr className="u-sv1" />
            <span><i className="p-icon--success"></i> Openstack, MAAS</span>
            <hr className="u-sv1" />
            <span><i className="p-icon--success"></i> Ceph and Swift storage</span>
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
            <span><i className="p-icon--success"></i> Open Source Applications</span>
            <hr className="u-sv1" />
            <span><i className="p-icon--success"></i> Ubuntu Base OS</span>
            <hr className="u-sv1" />
            <span><i className="p-icon--success"></i> Kubernetes, LXD, Charms</span>
            <hr className="u-sv1" />
            <span><i className="p-icon--success"></i> Openstack, MAAS</span>
            <hr className="u-sv1" />
            <span><i className="p-icon--error"></i> Ceph and Swift storage</span>
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
            <span><i className="p-icon--success"></i> Open Source Applications</span>
            <hr className="u-sv1" />
            <span><i className="p-icon--success"></i> Ubuntu Base OS</span>
            <hr className="u-sv1" />
            <span><i className="p-icon--success"></i> Kubernetes, LXD, Charms</span>
            <hr className="u-sv1" />
            <span><i className="p-icon--success"></i> Openstack, MAAS</span>
            <hr className="u-sv1" />
            <span><i className="p-icon--success"></i> Ceph and Swift storage</span>
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
                  style={{textAlign: "justify"}}
                >
                  <span>Weekday</span>
                  <p className="p-text--small u-no-margin--bottom">Up to 4h response time</p>
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
                  style={{textAlign: "justify"}}
                >
                  <span>24/7</span>
                  <p className="p-text--small u-no-margin--bottom">Up to 1h response time</p>
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
