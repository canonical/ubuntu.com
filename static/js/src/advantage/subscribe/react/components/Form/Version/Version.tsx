import React, { useContext } from "react";
import { Card, Col, List, Row } from "@canonical/react-components";
import classNames from "classnames";
import {
  isPublicCloud,
  LTSVersions,
} from "advantage/subscribe/react/utils/utils";
import {
  defaultValues,
  FormContext,
} from "advantage/subscribe/react/utils/FormContext";

const livepatch = "Kernel Livepatch to avoid unscheduled reboots";
const landscape = "Ubuntu systems management with Landscape";
const knowledgeBase = "Knowledge base access";
const KVMDrivers = "Certified Windows drivers for KVM guests";
const CISBenchmark = "CIS benchmark";
const CISBenchmarkAndAutomation = "CIS benchmark and automation tooling";
const FIPS =
  "Certified compliance with FIPS 140-2 Level 1 certified crypto modules validated by NIST";
const DISA = "DISA STIG";
const CommonCriteria = "Common Criteria EAL2";
const ESMEndDate = "Extended Security Maintenance (ESM) until ";
const MicrosoftActiveDirectory =
  "Advanced Group Policy Object support for Microsoft Active Directory on Ubuntu Desktops";

const versionDetails: { [key: LTSVersions]: Array<string> } = {
  22.04: [
    `${ESMEndDate} 2032`,
    livepatch,
    KVMDrivers,
    CISBenchmarkAndAutomation,
    landscape,
    knowledgeBase,
    MicrosoftActiveDirectory,
  ],
  20.04: [
    `${ESMEndDate} 2030`,
    livepatch,
    KVMDrivers,
    FIPS,
    CISBenchmarkAndAutomation,
    landscape,
    knowledgeBase,
    MicrosoftActiveDirectory,
  ],
  18.04: [
    `${ESMEndDate} 2028`,
    livepatch,
    landscape,
    knowledgeBase,
    KVMDrivers,
    FIPS,
    CISBenchmarkAndAutomation,
    DISA,
  ],
  16.04: [
    `${ESMEndDate} 2026`,
    livepatch,
    landscape,
    knowledgeBase,
    KVMDrivers,
    FIPS,
    CommonCriteria,
    CISBenchmarkAndAutomation,
    DISA,
  ],
  14.04: [
    `${ESMEndDate} 2024`,
    livepatch,
    landscape,
    knowledgeBase,
    KVMDrivers,
    CISBenchmark,
  ],
};

const Version = () => {
  const { version, setVersion, productType } = useContext(FormContext);

  const versionsSegmentedControl = (
    <div className="p-segmented-control">
      <div
        className="p-segmented-control__list"
        role="tablist"
        aria-label="LTS version options"
      >
        {Object.keys(versionDetails).map((key) => {
          return (
            <button
              className="p-segmented-control__button"
              role="tab"
              aria-selected={version === key}
              aria-controls={key}
              id={key}
              onClick={(e) => {
                e.preventDefault();
                setVersion(key as LTSVersions);
              }}
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      className={classNames({ "u-disable": isPublicCloud(productType) })}
      data-testid="wrapper"
    >
      <Row>
        <Col size={12}>{versionsSegmentedControl}</Col>
      </Row>
      <Row>
        <Col size={12}>
          <h4 className="p-heading--5">
            All subscriptions for Ubuntu Pro {version} include:
          </h4>
          <List
            items={versionDetails[version ?? defaultValues.version]}
            divided
          />
        </Col>
      </Row>
    </div>
  );
};

export default Version;
