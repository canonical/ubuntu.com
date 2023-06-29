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
    CTA: [
      {
        CTAName: "In-place upgrade to Ubuntu Pro",
        link:
          "/blog/upgrade-your-existing-ubuntu-lts-instances-to-ubuntu-pro-in-aws",
        appearance: "positive",
      },
      {
        CTAName: "Solutions for Ubuntu 18.04 LTS instances",
        link: "/18-04/aws",
        appearance: "",
      },
    ],
    describe: (
      <>
        You can{" "}
        <a href="https://aws.amazon.com/marketplace/search/results?page=1&filters=VendorId&VendorId=e6a5002c-6dd0-4d1e-8196-0a1d1857229b&searchTerms=ubuntu+pro+ec2">
          launch new Ubuntu Pro instances on the AWS Marketplace
        </a>{" "}
        and the{" "}
        <a href="/blog/ubuntu-pro-is-now-part-of-the-aws-ec2-console">
          EC2 Console
        </a>{" "}
        at a per-second, per-machine rate. If you have a running Ubuntu LTS
        instance in AWS, you can also In-place upgrade that instance to a Ubuntu
        Pro. If you need tech support as well,{" "}
        <a href="/aws#get-in-touch">contact us</a>.
      </>
    ),
  },
  [PublicClouds.azure]: {
    title: "Azure",
    name: "Azure Marketplace",
    CTA: [
      {
        CTAName: "In-place upgrade to Ubuntu Pro",
        link:
          "https://azuremarketplace.microsoft.com/en-us/marketplace/apps?search=Ubuntu%20Pro&page=1",
        appearance: "positive",
      },
      {
        CTAName: "Solutions for Ubuntu 18.04 LTS instances",
        link: "/18-04/azure",
        appearance: "",
      },
    ],
    describe: (
      <>
        You can{" "}
        <a href="https://azuremarketplace.microsoft.com/en-us/marketplace/apps?search=Ubuntu%20Pro&page=1">
          launch new Ubuntu Pro instances on the Azure Marketplace
        </a>{" "}
        at an hourly, per-machine rate. If you need tech support as well, or to
        add Ubuntu Pro entitlements to existing Ubuntu LTS instances, please{" "}
        <a href="/azure#get-in-touch">contact us</a>.
      </>
    ),
  },
  [PublicClouds.gcp]: {
    title: "GCP",
    name: "Google Compute Engine",
    CTA: [
      {
        CTAName: "In-place upgrade to Ubuntu Pro",
        link:
          "https://cloud.google.com/compute/docs/images/premium/ubuntu-pro/upgrade-from-ubuntu",
        appearance: "positive",
      },
      {
        CTAName: "Solutions for Ubuntu 18.04 LTS instances",
        link: "/18-04/gcp",
        appearance: "",
      },
    ],
    describe: (
      <>
        You can{" "}
        <a href="https://console.cloud.google.com/marketplace/browse?q=ubuntu%20pro&filter=partner:Canonical%20Group&authuser=1&pli=1">
          launch new Ubuntu Pro instances on the Google Compute Engine
        </a>{" "}
        at an hourly, per-machine rate. If you have a running Ubuntu LTS
        instance in Google Cloud, you can also In-place upgrade that instance to
        a Ubuntu Pro. If you need tech support as well,{" "}
        <a href="/gcp#get-in-touch">contact us</a>.{" "}
      </>
    ),
    link:
      "https://console.cloud.google.com/marketplace/browse?q=ubuntu%20pro&filter=partner:Canonical%20Group&authuser=1",
  },
  [PublicClouds.oracle]: {
    title: "Oracle",
    name: "Oracle",
    CTA: [
      {
        CTAName: "Solutions for Ubuntu 18.04 LTS instances",
        link: "/18-04/oci",
        appearance: "positive",
      },
    ],
    describe: (
      <>
        Please <a href="/security/esm#get-in-touch">contact us</a> to purchase a
        subscription that you can attach to your Oracle Cloud Infrastructure
        instance.
      </>
    ),
  },
  [PublicClouds.ibm]: {
    title: "IBM Cloud",
    name: "IBM",
    CTA: [
      {
        CTAName: "Solutions for Ubuntu 18.04 LTS instances",
        link: "/18-04/ibm",
        appearance: "positive",
      },
    ],
    describe: (
      <>
        Please <a href="/security/esm#get-in-touch">contact us</a> to purchase a
        subscription that you can attach to your IBM Cloud instance.
      </>
    ),
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
            className="p-segmented-control__button"
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
            className="p-segmented-control__button"
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
            className="p-segmented-control__button"
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
          <button
            className="p-segmented-control__button"
            role="tab"
            aria-selected={publicCloud === PublicClouds.oracle}
            aria-controls={PublicClouds.oracle}
            id={PublicClouds.oracle}
            onClick={(e) => {
              e.preventDefault();
              setPublicCloud(PublicClouds.oracle);
              localStorage.setItem(
                "pro-selector-publicCloud",
                JSON.stringify(PublicClouds.oracle)
              );
            }}
          >
            {PublicCloudInfo[PublicClouds.ibm].title}
          </button>
          <button
            className="p-segmented-control__button"
            role="tab"
            aria-selected={publicCloud === PublicClouds.ibm}
            aria-controls={PublicClouds.ibm}
            id={PublicClouds.ibm}
            onClick={(e) => {
              e.preventDefault();
              setPublicCloud(PublicClouds.ibm);
              localStorage.setItem(
                "pro-selector-publicCloud",
                JSON.stringify(PublicClouds.ibm)
              );
            }}
          >
            {PublicCloudInfo[PublicClouds.oracle].title}
          </button>
        </div>
      </div>

      <p>
        <strong>{PublicCloudInfo[publicCloud]?.title}</strong>
      </p>
      <p>{PublicCloudInfo[publicCloud]?.describe}</p>
      {PublicCloudInfo[publicCloud]?.CTA.map((cta) => (
        <Button
          appearance={cta.appearance}
          element="a"
          href={cta.link}
          key={cta.CTAName}
        >
          {cta.CTAName}
        </Button>
      ))}
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
            className="p-segmented-control__button"
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
            className="p-segmented-control__button"
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
          />
        </Col>
        <Col size={12}>
          <RadioInput
            label="IoT and devices"
            name="type"
            value={ProductTypes.iotDevice}
            onChange={handleProductTypeChange}
            checked={productType === ProductTypes.iotDevice}
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
