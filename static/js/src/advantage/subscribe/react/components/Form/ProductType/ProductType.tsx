import React, { useContext, useState } from "react";
import { Button, Col, Row } from "@canonical/react-components";
import RadioCard from "../RadioCard";
import {
  isPublicCloud,
  ProductTypes,
  PublicClouds,
} from "advantage/subscribe/react/utils/utils";
import { FormContext } from "advantage/subscribe/react/utils/FormContext";

const PublicCloudInfo = {
  [PublicClouds.aws]: {
    name: "AWS Marketplace",
    link:
      "https://aws.amazon.com/marketplace/search/results?page=1&filters=VendorId&VendorId=e6a5002c-6dd0-4d1e-8196-0a1d1857229b&searchTerms=ubuntu+pro",
  },
  [PublicClouds.azure]: {
    name: "Azure Marketplace",
    link:
      "https://azuremarketplace.microsoft.com/en-us/marketplace/apps?search=Ubuntu%20Pro&page=1",
  },
  [PublicClouds.gcp]: {
    name: "Google Cloud Console",
    link:
      "https://console.cloud.google.com/marketplace/browse?q=ubuntu%20pro%20canonical",
  },
};

const ProductType = () => {
  const { productType, setProductType } = useContext(FormContext);
  const [publicCloud, setPublicCloud] = useState(PublicClouds.aws);

  const handleProductTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProductType(event.target.value as ProductTypes);
  };

  const handlePublicCloudChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPublicCloud(event.target.value as PublicClouds);
  };

  const switchToVirtual = () => {
    setProductType(ProductTypes.virtual);
  };

  return (
    <>
      <Row>
        <Col size={12} className="radio-wrapper--staggering">
          <RadioCard
            name="type"
            value={ProductTypes.physical}
            selectedValue={productType}
            handleChange={handleProductTypeChange}
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
            value={ProductTypes.publicCloud}
            selectedValue={productType}
            handleChange={handleProductTypeChange}
          >
            <>
              <div className="image-wrapper">
                <img
                  src="https://manager.assets.ubuntu.com/update?file-path=ca1ea583-icon-intro-cloud.svg"
                  alt=""
                />
              </div>
              <span>Public Cloud instances</span>
            </>
          </RadioCard>
          <RadioCard
            name="type"
            value={ProductTypes.virtual}
            selectedValue={productType}
            handleChange={handleProductTypeChange}
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
            selectedValue={productType}
            handleChange={handleProductTypeChange}
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
        {isPublicCloud(productType) ? (
          <>
            <Col size={12} className="radio-wrapper--staggering">
              <RadioCard
                name="type"
                value={PublicClouds.aws}
                selectedValue={publicCloud}
                handleChange={handlePublicCloudChange}
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
                value={PublicClouds.azure}
                selectedValue={publicCloud}
                handleChange={handlePublicCloudChange}
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
                value={PublicClouds.gcp}
                selectedValue={publicCloud}
                handleChange={handlePublicCloudChange}
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
            </Col>

            <Col size={12} className="public-cloud-section">
              <p>
                <strong>
                  You can buy Ubuntu Pro on the{" "}
                  {PublicCloudInfo[publicCloud]?.name} at an hourly, per-machine
                  rate, with all UA software features included.
                </strong>
                <br />
                If you need tech support as well,{" "}
                <a href="/support/contact-us">contact us</a>.
              </p>
              <Row>
                <Col size={12} className="u-align--right">
                  <Button
                    appearance="positive"
                    classn
                    element="a"
                    onClick={switchToVirtual}
                    href={PublicCloudInfo[publicCloud]?.link}
                  >
                    Visit {PublicCloudInfo[publicCloud]?.name}
                  </Button>
                </Col>
              </Row>
            </Col>
          </>
        ) : null}
      </Row>
    </>
  );
};

export default ProductType;
