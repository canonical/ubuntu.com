import React, { useContext } from "react";
import classNames from "classnames";
import { Col, RadioInput, Row } from "@canonical/react-components";
import { Features, isPublicCloud, ProductTypes } from "advantage/subscribe/react/utils/utils";
import { FormContext } from "advantage/subscribe/react/utils/FormContext";


const Feature = () => {
  const { productType, feature, setFeature} = useContext(FormContext);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFeature(event.target.value as Features);
  };

  
  const infraOnlyDisabled = (ProductTypes.desktop === productType);

  return (
    <div
      className={classNames({
        "row": true,
        "p-divider": true,
        "u-disable": isPublicCloud(productType),
      })}
      data-testid="wrapper"
    >
      <Col className="u-hide--small" size={12} small={4}>
        <table className="p-table--selectable">
          <thead>
            <tr>
              <th>CVE Security patching coverage until 2030 for:</th>
              <th className={classNames({ selected: feature === Features.pro })}>
                <RadioInput
                  inline
                  label="Ubuntu Pro"
                  value={Features.pro}
                  checked={feature === Features.pro}
                  onChange={handleChange}
                />
              </th>
              <th
                className={classNames({ selected: feature === Features.infra })}
              >
                <RadioInput
                  inline
                  label="Ubuntu Pro, Infra Only"
                  value={Features.infra}
                  checked={feature === Features.infra}
                  onChange={handleChange}
                  disabled={infraOnlyDisabled}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <p>
                  Over 2,300 open source deb packages in Ubuntu Main repository
                  until 2030 (extended from 2025), including:
                </p>
                <img src="" alt="" /> <img src="" alt="" /> <img src="" alt="" />
              </td>
              <td
                className={classNames({
                  selected: feature === Features.pro,
                  "u-align--center": true,
                })}
              >
                <i className="p-icon--success"></i> Included
              </td>
              <td
                className={classNames({
                  selected: feature === Features.infra,
                  "u-align--center": true,
                })}
              >
                <i className="p-icon--success"></i> Included
              </td>
            </tr>
            <tr>
              <td>
                <p>
                  Over 23,000 open source deb packages in Ubuntu Universe
                  repository until 2030, including:
                </p>
              </td>
              <td
                className={classNames({
                  selected: feature === Features.pro,
                  "u-align--center": true,
                })}
              >
                <i className="p-icon--success"></i> Included
              </td>
              <td
                className={classNames({
                  selected: feature === Features.infra,
                  "u-align--center": true,
                })}
              >
                <i className="p-icon--error"></i> Not Included
              </td>
            </tr>
          </tbody>
        </table>
        </Col>
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
        <Col className="p-divider__block u-align--center u-hide u-show--small"  size={6} small={2}>
          <h4>2,300+</h4>
          <p>packages in Ubuntu main, including:</p>
        </Col>
        <Col className={classNames({"p-divider__block u-align--center u-hide u-show--small": true, "u-disable": Features.infra === feature})} size={6} small={2}>
          <h4>23,000+</h4>
          <p>packages in Ubuntu universe, including:</p>
        </Col>
    </div>
  );
};

export default Feature;
