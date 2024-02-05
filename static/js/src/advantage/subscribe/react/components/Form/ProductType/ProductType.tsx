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
    name: "AWS",
    CTA: [
      {
        CTAName: "In-place upgrade to Ubuntu Pro",
        link:
          "/blog/upgrade-your-existing-ubuntu-lts-instances-to-ubuntu-pro-in-aws",
        appearance: "positive",
      },
      {
        CTAName: "More info for Ubuntu 18.04 LTS users",
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
        instance in AWS, you can also in-place upgrade that instance to a Ubuntu
        Pro. If you need tech support as well,{" "}
        <a href="/aws#get-in-touch">contact us</a>.
      </>
    ),
  },
  [PublicClouds.azure]: {
    title: "Azure",
    name: "Azure",
    CTA: [
      {
        CTAName: "In-place upgrade to Ubuntu Pro",
        link:
          "/blog/announcing-in-place-upgrade-from-ubuntu-server-to-ubuntu-pro-on-azure",
        appearance: "positive",
      },
      {
        CTAName: "More info for Ubuntu 18.04 LTS users",
        link: "/18-04/azure",
        appearance: "",
      },
    ],
    describe: (
      <>
        You can{" "}
        <a href="https://azuremarketplace.microsoft.com/en-us/marketplace/apps?search=ubuntu%20pro%20canonical&page=1">
          launch new Ubuntu Pro instances on the Azure Marketplace
        </a>{" "}
        at an hourly, per-machine rate. If you have a running Ubuntu LTS
        instance in Azure, you can also in-place upgrade that instance to a
        Ubuntu Pro. If you need tech support as well,{" "}
        <a href="/azure#get-in-touch">contact us</a>.
      </>
    ),
  },
  [PublicClouds.gcp]: {
    title: "GCP",
    name: "Google Cloud",
    CTA: [
      {
        CTAName: "In-place upgrade to Ubuntu Pro",
        link:
          "https://cloud.google.com/compute/docs/images/premium/ubuntu-pro/upgrade-from-ubuntu",
        appearance: "positive",
      },
      {
        CTAName: "More info for Ubuntu 18.04 LTS users",
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
        instance in Google Cloud, you can also in-place upgrade that instance to
        a Ubuntu Pro. If you need tech support as well,{" "}
        <a href="/gcp#get-in-touch">contact us</a>.{" "}
      </>
    ),
    link:
      "https://console.cloud.google.com/marketplace/browse?q=ubuntu%20pro&filter=partner:Canonical%20Group&authuser=1",
  },
  [PublicClouds.oracle]: {
    title: "Oracle",
    name: "Oracle Cloud",
    CTA: [
      {
        CTAName: "Contact us",
        link: "/security/esm#get-in-touch",
        appearance: "positive",
      },
      {
        CTAName: "More info for Ubuntu 18.04 LTS instances",
        link: "/18-04/oci",
        appearance: "",
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
    title: "IBM",
    name: "IBM Cloud",
    CTA: [
      {
        CTAName: "Contact us",
        link: "/security/esm#get-in-touch",
        appearance: "positive",
      },
      {
        CTAName: "More info for Ubuntu 18.04 LTS instances",
        link: "/18-04/ibm",
        appearance: "",
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
            {PublicCloudInfo[PublicClouds.oracle].title}
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
            {PublicCloudInfo[PublicClouds.ibm].title}
          </button>
        </div>
      </div>

      <p>
        <strong>{PublicCloudInfo[publicCloud]?.name}</strong>
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
      <>
        <Button
          appearance="positive"
          element="a"
          href="/internet-of-things#get-in-touch"
        >
          Contact us to find out more our IoT pricing
        </Button>
      </>
      {iotDevice === IoTDevices.core && (
        <>
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
        {productType === ProductTypes.desktop && (
          <Col size={12} style={{ marginLeft: "35px" }}>
            <p>
              A subscription limited to single-user machine Desktop use-cases
            </p>
          </Col>
        )}
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
