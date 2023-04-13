import React, { useContext, useState } from "react";
import { Button, Col, RadioInput, Row } from "@canonical/react-components";
import { FormContext } from "advantage/subscribe/react/utils/FormContext";
import {
  IoTDevices,
  isIoTDevice,
  isPublicCloud,
  ProductTypes,
  PublicClouds,
} from "advantage/subscribe/react/utils/utils";

const PublicCloudInfo = {
  [PublicClouds.aws]: {
    title: "AWS",
    name: "AWS Marketplace",
    CTAName: "AWS marketplace",
    link:
      "https://aws.amazon.com/marketplace/search/results?page=1&filters=VendorId&VendorId=e6a5002c-6dd0-4d1e-8196-0a1d1857229b&searchTerms=ubuntu+pro",
  },
  [PublicClouds.azure]: {
    title: "Azure",
    name: "Azure Marketplace",
    CTAName: "Azure marketplace",
    link:
      "https://azuremarketplace.microsoft.com/en-us/marketplace/apps?search=Ubuntu%20Pro&page=1",
  },
  [PublicClouds.gcp]: {
    title: "GCP",
    name: "Google Compute Engine",
    CTAName: "GCE marketplace",
    link:
      "https://console.cloud.google.com/marketplace/browse?q=ubuntu%20pro&filter=partner:Canonical%20Group&authuser=1",
  },
  [PublicClouds.oracle]: {
    title: "Oracle",
    name: "Oracle",
    CTAName: "Oracle marketplace",
    link: "",
  },
};
const ProductType = () => {
  const localPublicCloud = localStorage.getItem("pro-selector-publicCloud");
  const { productType, setProductType, iotDevice, setIoTDevice } = useContext(
    FormContext
  );
  const [publicCloud, setPublicCloud] = useState(
    localPublicCloud
      ? (JSON.parse(localPublicCloud) as PublicClouds)
      : PublicClouds.aws
  );

  const handleProductTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProductType(event.target.value as ProductTypes);
    localStorage.setItem(
      "pro-selector-productType",
      JSON.stringify(event.target.value as ProductTypes)
    );
  };

  const publicCloudsSelector = (
    <>
      <div className="p-segmented-control">
        <div
          className="p-segmented-control__list"
          role="tablist"
          aria-label="Public cloud options"
        >
          <button
            className="p-segmented-control__button plausible-event-name=pro+selector+public+cloud+aws"
            role="tab"
            aria-selected={publicCloud === PublicClouds.aws}
            aria-controls={PublicClouds.aws}
            id={PublicClouds.aws}
            onClick={(e) => {
              e.preventDefault();
              setPublicCloud(PublicClouds.aws);
              localStorage.setItem(
                "pro-selector-publicCloud",
                JSON.stringify(PublicClouds.aws)
              );
            }}
          >
            {PublicCloudInfo[PublicClouds.aws].title}
          </button>
          <button
            className="p-segmented-control__button plausible-event-name=pro+selector+public+cloud+azure"
            role="tab"
            aria-selected={publicCloud === PublicClouds.azure}
            aria-controls={PublicClouds.azure}
            id={PublicClouds.azure}
            onClick={(e) => {
              e.preventDefault();
              setPublicCloud(PublicClouds.azure);
              localStorage.setItem(
                "pro-selector-publicCloud",
                JSON.stringify(PublicClouds.azure)
              );
            }}
          >
            {PublicCloudInfo[PublicClouds.azure].title}
          </button>
          <button
            className="p-segmented-control__button plausible-event-name=pro+selector+public+cloud+gcp"
            role="tab"
            aria-selected={publicCloud === PublicClouds.gcp}
            aria-controls={PublicClouds.gcp}
            id={PublicClouds.gcp}
            onClick={(e) => {
              e.preventDefault();
              setPublicCloud(PublicClouds.gcp);
              localStorage.setItem(
                "pro-selector-publicCloud",
                JSON.stringify(PublicClouds.gcp)
              );
            }}
          >
            {PublicCloudInfo[PublicClouds.gcp].title}
          </button>
        </div>
      </div>

      <p>
        <strong>{PublicCloudInfo[publicCloud]?.title}</strong>
      </p>
      <p>
        You can buy Ubuntu Pro on the {PublicCloudInfo[publicCloud]?.name} at an
        hourly, per-machine rate. If you need tech support as well,{" "}
        <a href="/support/contact-us">contact us</a>.
      </p>
      <Button
        appearance="positive"
        element="a"
        href={PublicCloudInfo[publicCloud]?.link}
      >
        Visit {PublicCloudInfo[publicCloud]?.CTAName}
      </Button>
    </>
  );

  const IoTDeviceselector = (
    <>
      <div className="p-segmented-control">
        <div
          className="p-segmented-control__list"
          role="tablist"
          aria-label="IoT device options"
        >
          <button
            className="p-segmented-control__button plausible-event-name=pro+selector+iot+device+ubuntu+classic"
            role="tab"
            aria-selected={iotDevice === IoTDevices.classic}
            aria-controls={IoTDevices.classic}
            id={IoTDevices.classic}
            onClick={(e) => {
              e.preventDefault();
              setIoTDevice(IoTDevices.classic);
              localStorage.setItem(
                "pro-selector-iotDevice",
                JSON.stringify(IoTDevices.classic)
              );
            }}
          >
            Ubuntu Classic
          </button>
          <dfn></dfn>
          <button
            className="p-segmented-control__button plausible-event-name=pro+selector+iot+device+ubuntu+core"
            role="tab"
            aria-selected={iotDevice === IoTDevices.core}
            aria-controls={IoTDevices.core}
            id={IoTDevices.core}
            onClick={(e) => {
              e.preventDefault();
              setIoTDevice(IoTDevices.core);
              localStorage.setItem(
                "pro-selector-iotDevice",
                JSON.stringify(IoTDevices.core)
              );
            }}
          >
            Ubuntu Core
          </button>
        </div>
      </div>
      {iotDevice === IoTDevices.core && (
        <>
          <p>
            <strong> Ubuntu Core </strong>
          </p>
          <p>
            If you are interested in Ubuntu Core, please{" "}
            <a href="/core/contact-us">contact us</a>.
          </p>
          <Button element="a" href="/core">
            Learn more about Ubuntu Core
          </Button>
        </>
      )}
    </>
  );

  return (
    <>
      <Row>
        <Col size={12}>
          <RadioInput
            label="Physical servers with unlimited VMs"
            name="type"
            value={ProductTypes.physical}
            onChange={handleProductTypeChange}
            checked={productType === ProductTypes.physical}
            labelClassName="plausible-event-name=pro+selector+physical+servers"
          />
        </Col>
        {productType === "physical" && (
          <Col size={12} style={{ marginLeft: "35px" }}>
            <p>
              <strong>Unlimited VMs on selected hypervisors</strong>
            </p>
            <p>
              Any of: KVM | Qemu | Boch, VMWare ESXi, LXD | LXC, Xen, Hyper-V
              (WSL, Multipass), VirtualBox, z/VM, Docker. All Nodes in the
              cluster have to be subscribed to the service in order to benefit
              from the unlimited VM support
            </p>
          </Col>
        )}
        <Col size={12}>
          <RadioInput
            label="Public cloud instances"
            name="type"
            value={ProductTypes.publicCloud}
            onChange={handleProductTypeChange}
            checked={productType == ProductTypes.publicCloud}
            labelClassName="plausible-event-name=pro+selector+public+cloud"
          />
        </Col>
        <Col size={12} style={{ marginLeft: "35px" }}>
          {isPublicCloud(productType) ? publicCloudsSelector : null}
        </Col>
        <Col size={12}>
          <RadioInput
            label="Desktops"
            name="type"
            value={ProductTypes.desktop}
            onChange={handleProductTypeChange}
            checked={productType === ProductTypes.desktop}
            labelClassName="plausible-event-name=pro+selector+desktop"
          />
        </Col>
        <Col size={12}>
          <RadioInput
            label="IoT and devices"
            name="type"
            value={ProductTypes.iotDevice}
            onChange={handleProductTypeChange}
            checked={productType === ProductTypes.iotDevice}
            labelClassName="plausible-event-name=pro+selector+iot+device"
          />
        </Col>
        <Col size={12} style={{ marginLeft: "35px" }}>
          {isIoTDevice(productType) ? IoTDeviceselector : null}
        </Col>
      </Row>
    </>
  );
};

export default ProductType;
