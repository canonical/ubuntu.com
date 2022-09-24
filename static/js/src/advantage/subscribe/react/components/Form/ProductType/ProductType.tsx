import React, { useContext, useState } from "react";
import { Button, Col, Row } from "@canonical/react-components";
import { RadioInput } from "@canonical/react-components";
import {
  isPublicCloud,
  ProductTypes,
  PublicClouds,
} from "advantage/subscribe/react/utils/utils";
import { FormContext } from "advantage/subscribe/react/utils/FormContext";

const PublicCloudInfo = {
  [PublicClouds.aws]: {
    name: "AWS",
    link:
      "https://aws.amazon.com/marketplace/search/results?page=1&filters=VendorId&VendorId=e6a5002c-6dd0-4d1e-8196-0a1d1857229b&searchTerms=ubuntu+pro",
  },
  [PublicClouds.azure]: {
    name: "Azure",
    link:
      "https://azuremarketplace.microsoft.com/en-us/marketplace/apps?search=Ubuntu%20Pro&page=1",
  },
  [PublicClouds.gcp]: {
    name: "Google Cloud",
    link:
      "https://console.cloud.google.com/marketplace/browse?q=ubuntu%20pro%20canonical",
  },
  [PublicClouds.oracle]: {
    name: "Oracle",
    link: "",
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
            }}
          >
            {PublicCloudInfo[PublicClouds.aws].name}
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
            }}
          >
            {PublicCloudInfo[PublicClouds.azure].name}
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
            }}
          >
            {PublicCloudInfo[PublicClouds.gcp].name}
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
            }}
          >
            {PublicCloudInfo[PublicClouds.oracle].name}
          </button>
        </div>
      </div>

      <p>
        <strong>{PublicCloudInfo[publicCloud]?.name}</strong>
      </p>
      <p>
        You can buy Ubuntu Pro on the {PublicCloudInfo[publicCloud]?.name} at an
        hourly, per-machine rate, with all UA software features included.
      </p>
      <Button element="a" href={PublicCloudInfo[publicCloud]?.link}>
        Visit {PublicCloudInfo[publicCloud]?.name}
      </Button>
    </>
  );

  return (
    <>
      <Row>
        <Col size={12}>
          <RadioInput
            label="Physical servers"
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
      </Row>
    </>
  );
};

export default ProductType;
