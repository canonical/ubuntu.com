import React, { useContext, useEffect } from "react";
import { Button, Col, Row, Select } from "@canonical/react-components";
import { FormContext } from "../../../utils/FormContext";
import {
  DistributorProductTypes as ProductTypes,
  SubscriptionItem,
  generateUniqueId,
  Support as SupportEnum,
  SLA as SLAEnum,
  getPreSelectedItem,
} from "advantage/distributor/utils/utils";
import SubscriptionCard from "./SubscriptionCard.tsx/SubscriptionCard";
import { Offer as OfferType } from "../../../../offers/types";

type Prop = {
  offer: OfferType;
};

const AddSubscriptions = ({ offer }: Prop) => {
  const {
    productType,
    setProductType,
    subscriptionList,
    setSubscriptionList,
  } = useContext(FormContext);

  const { items } = offer;

  const handleProductTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setProductType(event.target.value as ProductTypes);
    localStorage.setItem(
      "distributor-selector-productType",
      JSON.stringify(event.target.value as ProductTypes)
    );
  };

  const handleAddProduct = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    const id = generateUniqueId();
    const subscriptionItem: SubscriptionItem = {
      id: id,
      type: productType,
      sla: SLAEnum.none,
      support: SupportEnum.none,
      quantity: 1,
    };
    setSubscriptionList([...subscriptionList, subscriptionItem]);
    localStorage.setItem(
      "distributor-selector-subscriptionList",
      JSON.stringify([...subscriptionList, subscriptionItem])
    );
  };
  const subscriptionTypes = [
    { label: "Ubuntu Pro Physical", value: ProductTypes.physical },
    { label: "Ubuntu Pro Desktop", value: ProductTypes.desktop },
    { label: "Ubuntu Pro Virtual", value: ProductTypes.virtual },
  ];

  useEffect(() => {
    if (subscriptionList?.length === 0) {
      const preSetItem = getPreSelectedItem(items);
      items.length > 0 &&
        preSetItem?.length > 0 &&
        setSubscriptionList(preSetItem as SubscriptionItem[]);
      localStorage.setItem(
        "distributor-selector-subscriptionList",
        JSON.stringify(preSetItem as SubscriptionItem[])
      );
    }
  }, [offer]);

  return (
    <div data-testid="wrapper">
      <p>Ubuntu Pro is avaiable for Ubuntu 14.04 and higher:</p>
      {subscriptionList?.length > 0 &&
        subscriptionList.map((subscription: SubscriptionItem) => {
          return (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
            />
          );
        })}
      <Row>
        <Col size={6}>
          <div style={{ display: "flex", alignItems: "end" }}>
            <div>
              <Select
                label="Select a subscription:"
                name="subscription-select"
                defaultValue={productType}
                options={
                  subscriptionTypes &&
                  subscriptionTypes.map((subscriptionType) => {
                    return {
                      label: subscriptionType.label,
                      value: subscriptionType.value,
                    };
                  })
                }
                onChange={handleProductTypeChange}
              />
            </div>
            <div>
              <Button
                className="p-button"
                style={{
                  backgroundColor: "#262626",
                  color: "#fff",
                  marginLeft: "0.5rem",
                }}
                onClick={handleAddProduct}
              >
                Add
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AddSubscriptions;
