import React, { useContext } from "react";
import { Chip, Col, List, Row } from "@canonical/react-components";
import classNames from "classnames";
import {
  isPublicCloud,
  LTSVersions,
} from "advantage/subscribe/react/utils/utils";
import {
  defaultValues,
  FormContext,
} from "advantage/subscribe/react/utils/FormContext";

const livepatch =
  "Kernel Livepatch  to apply kernel patches at run time without the need for an immediate reboot";
const landscape = "Ubuntu systems management with Landscape";
const knowledgeBase = "Access to the Knowledge base";
const KVMDrivers = "Certified Windows Drivers for KVM guests";
const CISBenchmark =
  "Ubuntu Security Guide (USG) for certified CIS benchmark tooling and DISA-STIG configuration guide";
const CISBenchmarkAndAutomation =
  "Ubuntu Security Guide (USG) for certified CIS benchmark tooling and DISA-STIG tooling & automation";
const FIPS =
  "FIPS 140-2 Level 1 cryptographic packages for FedRAMP, HIPAA and PCI-DSS compliance";
const FIPSComingSoon = (
  <>
    FIPS 140-3 Level 1 cryptographic packages for FedRAMP, HIPAA and PCI-DSS
    compliance
    <Chip value="Coming soon" appearance="positive" className="is-dense" />
  </>
);
const CISComingSoon = (
  <>
    Ubuntu Security Guide (USG) for certified CIS benchmark tooling & automation
    <Chip value="Coming soon" appearance="positive" className="is-dense" />
  </>
);
const CommonCriteria = "Common Criteria EAL2";
const ESMEndDate = "Extended Security Maintenance (ESM) until ";

const versionDetails: { [key in LTSVersions]: Array<React.ReactNode> } = {
  [LTSVersions.jammy]: [
    `${ESMEndDate} 2032`,
    livepatch,
    FIPSComingSoon,
    CISComingSoon,
    KVMDrivers,
    landscape,
    knowledgeBase,
  ],
  [LTSVersions.focal]: [
    `${ESMEndDate} 2030`,
    livepatch,
    FIPS,
    CISBenchmarkAndAutomation,
    KVMDrivers,
    landscape,
    knowledgeBase,
  ],
  [LTSVersions.bionic]: [
    `${ESMEndDate} 2028`,
    livepatch,
    FIPS,
    CISBenchmark,
    CommonCriteria,
    KVMDrivers,
    landscape,
    knowledgeBase,
  ],
  [LTSVersions.xenial]: [
    `${ESMEndDate} 2026`,
    livepatch,
    FIPS,
    CISBenchmark,
    CommonCriteria,
    KVMDrivers,
    landscape,
    knowledgeBase,
  ],
  [LTSVersions.trusty]: [
    `${ESMEndDate} 2024`,
    livepatch,
    KVMDrivers,
    landscape,
    knowledgeBase,
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
              key={key}
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
              {key} LTS
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
            All subscriptions for Ubuntu Pro {version} LTS include:
          </h4>
          <List
            className="versions-features"
            items={versionDetails[version ?? defaultValues.version]}
            divided
          />
        </Col>
      </Row>
    </div>
  );
};

export default Version;
