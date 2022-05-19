import React from "react";
import { Card, Col, List, Row } from "@canonical/react-components";
import RadioCard from "../RadioCard";
import { LTSVersions } from "advantage/subscribe/react/utils/utils";
import OlderVersionModal from "./OlderVersionModal";

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

const versionDetails = {
  22.04: [
    `${ESMEndDate} 2032`,
    livepatch,
    KVMDrivers,
    CISBenchmarkAndAutomation,
    landscape,
    knowledgeBase,
  ],
  20.04: [
    `${ESMEndDate} 2030`,
    livepatch,
    KVMDrivers,
    FIPS,
    CISBenchmarkAndAutomation,
    landscape,
    knowledgeBase,
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
  const [selectedValue, setSelectedValue] = React.useState<LTSVersions>(
    LTSVersions.bionic
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value as LTSVersions);
  };

  return (
    <>
      <p>
        Ubuntu Advantage is available for Ubuntu 14.04 and higher.
        <br />
        <OlderVersionModal />
      </p>
      <Row>
        <Col size={12} className="radio-wrapper--staggering">
          <RadioCard
            name="version"
            value={LTSVersions.jammy}
            selectedValue={selectedValue}
            handleChange={handleChange}
          >
            <h4>Ubuntu 22.04 LTS</h4>
          </RadioCard>
          <RadioCard
            name="version"
            value={LTSVersions.focal}
            selectedValue={selectedValue}
            handleChange={handleChange}
          >
            <h4>Ubuntu 20.04 LTS</h4>
          </RadioCard>
          <RadioCard
            name="version"
            value={LTSVersions.bionic}
            selectedValue={selectedValue}
            handleChange={handleChange}
          >
            <h4>Ubuntu 18.04 LTS</h4>
          </RadioCard>
          <RadioCard
            name="version"
            value={LTSVersions.xenial}
            selectedValue={selectedValue}
            handleChange={handleChange}
          >
            <h4>Ubuntu 16.04 LTS</h4>
          </RadioCard>
          <RadioCard
            name="version"
            value={LTSVersions.trusty}
            selectedValue={selectedValue}
            handleChange={handleChange}
          >
            <h4>Ubuntu 14.04 LTS</h4>
          </RadioCard>
        </Col>
      </Row>
      <Row>
        <Col size={12}>
          <Card
            title={`For Ubuntu ${selectedValue}, all UA plans include:`}
            className="version-features-section"
          >
            <Row>
              <Col size={12}>
                <List
                  items={versionDetails[selectedValue ?? "18.04"]}
                  split
                  ticked
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Version;
