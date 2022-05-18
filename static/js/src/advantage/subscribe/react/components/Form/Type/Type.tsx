import { Col, Row } from "@canonical/react-components";
import React from "react";
import RadioCard from "../RadioCard";
import {
  ProductTypes,
  ProductTypeType,
} from "advantage/subscribe/react/utils/utils";

const PublicCloudInfo = {
  [ProductTypes.aws]: {
    name: "AWS Marketplace",
    link:
      "https://aws.amazon.com/marketplace/search/results?page=1&filters=VendorId&VendorId=e6a5002c-6dd0-4d1e-8196-0a1d1857229b&searchTerms=ubuntu+pro",
  },
  [ProductTypes.azure]: {
    name: "Azure Marketplace",
    link:
      "https://azuremarketplace.microsoft.com/en-us/marketplace/apps?search=Ubuntu%20Pro&page=1",
  },
  [ProductTypes.gcp]: {
    name: "Google Cloud Console",
    link:
      "https://console.cloud.google.com/marketplace/browse?q=ubuntu%20pro%20canonical",
  },
  [ProductTypes.physical]: {
    name: "",
    link: "",
  },
  [ProductTypes.virtual]: {
    name: "",
    link: "",
  },
  [ProductTypes.desktop]: {
    name: "",
    link: "",
  },
};

const Type = () => {
  const [selectedValue, setSelectedValue] = React.useState<ProductTypeType>(
    ProductTypes.physical
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value as ProductTypeType);
  };

  const switchToVirtual = () => {
    setSelectedValue("virtual");
  };

  return (
    <li className="p-stepped-list__item" data-step="type">
      <h3 className="p-stepped-list__title">What are you setting up?</h3>
      <Row>
        <Col size={12} className="radio-wrapper--staggering">
          <RadioCard
            name="type"
            value={ProductTypes.physical}
            selectedValue={selectedValue}
            handleChange={handleChange}
          >
            <>
              <div className="image-wrapper">
                <img
                  src="https://assets.ubuntu.com/v1/fdf83d49-Server.svg"
                  alt=""
                />
              </div>
              <span>Physical servers</span>
            </>
          </RadioCard>
          <RadioCard
            name="type"
            value={ProductTypes.aws}
            selectedValue={selectedValue}
            handleChange={handleChange}
          >
            <>
              <div className="image-wrapper">
                <img
                  src="https://assets.ubuntu.com/v1/a82add58-profile-aws.svg"
                  alt=""
                />
              </div>
              <span>AWS instances</span>
            </>
          </RadioCard>
          <RadioCard
            name="type"
            value={ProductTypes.azure}
            selectedValue={selectedValue}
            handleChange={handleChange}
          >
            <>
              <div className="image-wrapper">
                <img
                  src="https://assets.ubuntu.com/v1/da9a1344-Microsoft-Azure-logo_stacked_transparent.png"
                  alt=""
                />
              </div>
              <span>Azure instances</span>
            </>
          </RadioCard>
          <RadioCard
            name="type"
            value={ProductTypes.gcp}
            selectedValue={selectedValue}
            handleChange={handleChange}
          >
            <>
              <div className="image-wrapper">
                <img
                  src="https://assets.ubuntu.com/v1/216e5289-google-cloud.svg"
                  alt=""
                />
              </div>
              <span>Google Cloud instances</span>
            </>
          </RadioCard>
          <RadioCard
            name="type"
            value={ProductTypes.virtual}
            selectedValue={selectedValue}
            handleChange={handleChange}
          >
            <>
              <div className="image-wrapper">
                <img
                  src="https://assets.ubuntu.com/v1/9ed50294-Virtual+machine.svg"
                  alt=""
                />
              </div>
              <span>Other VMs</span>
            </>
          </RadioCard>
          <RadioCard
            name="type"
            value={ProductTypes.desktop}
            selectedValue={selectedValue}
            handleChange={handleChange}
          >
            <>
              <div className="image-wrapper">
                <img
                  src="https://assets.ubuntu.com/v1/4b732966-Laptop.svg"
                  alt=""
                />
              </div>
              <span>Desktops</span>
            </>
          </RadioCard>
        </Col>
        {selectedValue === ProductTypes.aws ||
        selectedValue === ProductTypes.azure ||
        selectedValue === ProductTypes.gcp ? (
          <Col size={12} className="public-cloud-section">
            <span>
              <strong>
                You can buy{" "}
                <a href={PublicCloudInfo[selectedValue]?.link}>
                  Ubuntu Pro on the {PublicCloudInfo[selectedValue]?.name}
                </a>{" "}
                at an hourly, per-machine rate, with all UA software features
                included.
              </strong>
              If you need tech support as well,{" "}
              <a href="/support/contact-us">contact us</a>.
            </span>
            <br />
            <br />
            <span>
              <strong>
                Looking to add support to an existing virtual machine running
                Ubuntu 16.04 (Xenial)?
              </strong>
              <br />
              Choose the &quot;<a onClick={switchToVirtual}>Other VMs</a>&quot;
              option to purchase a subscription you can attach to your existing
              VM.
            </span>
          </Col>
        ) : null}
      </Row>
    </li>
  );
};

export default Type;
