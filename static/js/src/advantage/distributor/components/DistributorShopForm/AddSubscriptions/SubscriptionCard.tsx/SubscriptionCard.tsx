import React, { useContext } from "react";
import {
  Col,
  Input,
  Row,
  Card,
  RadioInput,
  Icon,
  ICONS,
} from "@canonical/react-components";
import { FormContext } from "../../../../utils/FormContext";
import {
  DistributorProductTypes as ProductTypes,
  SLA as SLAEnum,
  SubscriptionItem,
  Support as SupportEnum,
  currencyFormatter,
  Currencies,
  getProductId,
  DISTRIBUTOR_SELECTOR_KEYS,
} from "../../../../utils/utils";

export const getProductTitle = (type: ProductTypes) => {
  switch (type) {
    case (type = ProductTypes.physical):
      return "Ubuntu Pro Physical";
    case (type = ProductTypes.desktop):
      return "Ubuntu Pro Desktop";
    case (type = ProductTypes.virtual):
      return "Ubuntu Pro Virtual";
  }
};

type Prop = {
  subscription: SubscriptionItem;
};
const SubscriptionCard = ({ subscription }: Prop) => {
  const { subscriptionList, setSubscriptionList, products, duration } =
    useContext(FormContext);

  const handleRemoveSubscription = (subscriptionId: string) => {
    const updatedList = subscriptionList.filter(
      (item) => item.id !== subscriptionId,
    );
    setSubscriptionList(updatedList);
    localStorage.setItem(
      DISTRIBUTOR_SELECTOR_KEYS.SUBSCRIPTION_LIST,
      JSON.stringify(updatedList),
    );
  };

  const product = products?.filter(
    (prod) =>
      prod?.productID ===
      getProductId(subscription.type, subscription.support, subscription.sla),
  )[0];

  const priceCurrency = product?.price?.currency as Currencies;
  const priceValue = (product?.price?.value as number) / duration;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const { name, value } = e.target;
    const fieldName = name.split("-")[0];

    const updatedList = subscriptionList.map((item) => {
      if (item.id === id) {
        const isQuantity = fieldName === "quantity" && Number(value) > 0;
        const updatedItem: SubscriptionItem = {
          ...item,
          [fieldName]: isQuantity ? (Number(value) ?? 0) : value,
        };

        if (updatedItem.type === ProductTypes.desktop) {
          updatedItem.support = SupportEnum.full;
        }

        if (updatedItem.sla === SLAEnum.none) {
          updatedItem.support = SupportEnum.none;
        }

        if (
          updatedItem.type !== ProductTypes.desktop &&
          updatedItem.sla !== SLAEnum.none
        ) {
          if (updatedItem.support !== SupportEnum.full) {
            updatedItem.support = SupportEnum.infra;
          } else {
            updatedItem.support = SupportEnum.full;
          }
        }
        return updatedItem;
      }
      return item;
    });

    setSubscriptionList(updatedList);

    localStorage.setItem(
      DISTRIBUTOR_SELECTOR_KEYS.SUBSCRIPTION_LIST,
      JSON.stringify(updatedList),
    );
  };

  return (
    <div className="add-subscription-card-container">
      <Icon
        name={ICONS.close}
        light={false}
        onClick={() => handleRemoveSubscription(subscription.id)}
        data-testid="remove-subscription"
      />
      <Card
        title={getProductTitle(subscription.type)}
        className="add-subscription-card"
      >
        <hr />
        <Row>
          <Col size={3}>
            <div>
              <h5>Support options</h5>
              <RadioInput
                label="Self support"
                name={`sla-${subscription.id}`}
                value={SLAEnum.none}
                checked={subscription.sla === SLAEnum.none}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange(e, subscription.id)
                }
              />
              <RadioInput
                label="24/5 support (Weekday)"
                name={`sla-${subscription.id}`}
                value={SLAEnum.weekday}
                checked={subscription.sla === SLAEnum.weekday}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange(e, subscription.id)
                }
              />
              <RadioInput
                label="24/7 support"
                name={`sla-${subscription.id}`}
                value={SLAEnum.everyday}
                checked={subscription.sla === SLAEnum.everyday}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChange(e, subscription.id)
                }
              />
            </div>
            {subscription.type != ProductTypes.desktop && (
              <div>
                <h5>Coverage options</h5>
                <RadioInput
                  label="Infra"
                  name={`support-${subscription.id}`}
                  value={SupportEnum.infra}
                  checked={subscription.support === SupportEnum.infra}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(e, subscription.id)
                  }
                  disabled={subscription.sla === SLAEnum.none}
                />
                <RadioInput
                  label="Full"
                  name={`support-${subscription.id}`}
                  value={SupportEnum.full}
                  checked={subscription.support === SupportEnum.full}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(e, subscription.id)
                  }
                  disabled={subscription.sla === SLAEnum.none}
                />
              </div>
            )}
          </Col>
          <Col size={3}>
            <h5>No of machines</h5>
            <Input
              id="distributor-quantity-input"
              className="u-no-margin--bottom"
              type="number"
              name={`quantity-${subscription.id}`}
              min="1"
              max="1000"
              step="1"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange(e, subscription.id)
              }
              value={subscription.quantity}
              pattern="\d+"
              style={{ minWidth: "unset", width: "4rem" }}
              aria-label="number of machines"
              data-testid="quantity-input"
            />
            <p className="u-text--muted">
              {" "}
              {priceCurrency
                ? currencyFormatter(priceCurrency).format(
                    (priceValue ?? 0) / 100,
                  )
                : 0}{" "}
              / year per machine
            </p>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SubscriptionCard;
