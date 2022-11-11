import React from "react";
import { ActionButton, Card, Row, Col } from "@canonical/react-components";
import { currencyFormatter } from "advantage/react/utils";
import PurchaseModal from "../../../../PurchaseModal";
import { Offer as OfferType, Item } from "../../types";
import Summary from "../Summary";
import usePortal from "react-useportal";
import { marketplace } from "PurchaseModal/utils/utils";
import { Periods } from "advantage/subscribe/react/utils/utils";

type Props = {
  offer: OfferType;
};

const termsLabel = (
  <>
    I agree to the{" "}
    <a
      href="/legal/ubuntu-advantage-service-terms"
      target="_blank"
      rel="noopener norefferer"
    >
      Ubuntu Pro terms
    </a>
    , which apply to the <a href="/legal/solution-support">Solution Support</a>{" "}
    service.
  </>
);

const descriptionLabel = (
  <>
    I agree to the{" "}
    <a
      href="/legal/ubuntu-pro-description"
      target="_blank"
      rel="noopener noreferrer"
    >
      Ubuntu Pro description
    </a>
  </>
);

const marketingLabel =
  "I agree to receive information about Canonical's products and services";

const Offer = ({ offer }: Props) => {
  const { id, marketplace, items, total, account_id } = offer;

  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  const product = {
    longId: id ?? "",
    period: Periods.yearly,
    marketplace: marketplace as marketplace,
    id: id,
    name: items[0].name ?? "",
    price: {
      value: Number(total),
    },
    canBeTrialled: false,
  };

  const OfferSummary = () => {
    return <Summary offer={offer} />;
  };

  return (
    <Card data-testid="offer-card">
      <Row>
        <Col size={6} small={2} medium={2}>
          <p className="p-text--x-small-capitalised">Contract item</p>
        </Col>
        <Col size={3} small={1} medium={2}>
          <p className="p-text--x-small-capitalised">Allowance</p>
        </Col>
        <Col size={3} small={1} medium={2}>
          <p className="p-text--x-small-capitalised">Price</p>
        </Col>
      </Row>
      <hr />
      {items.map((item: Item) => {
        return (
          <Row key={item.id}>
            <Col size={6} small={2} medium={2}>
              <p>
                <strong>{item.name}</strong>
              </p>
            </Col>
            <Col size={3} small={1} medium={2}>
              <p>{item.allowance ?? 0}</p>
            </Col>
            <Col size={3} small={1} medium={2}>
              <p>{currencyFormatter.format(item.price / 100)}</p>
            </Col>
          </Row>
        );
      })}
      <Row>
        <Col
          size={3}
          emptyLarge={7}
          small={2}
          emptySmall={2}
          medium={2}
          emptyMedium={3}
        >
          <p className="p-text--x-small-capitalised col-3 col-start-large-7">
            Total before taxes
          </p>
        </Col>
        <Col size={3} small={1} medium={2}>
          <p className="col-3">{currencyFormatter.format(total / 100)}</p>
        </Col>
      </Row>
      <Row>
        <Col size={12} className="u-align--right">
          <ActionButton
            appearance="positive"
            className="u-no-margin--bottom"
            onClick={openPortal}
          >
            Purchase
          </ActionButton>
        </Col>
      </Row>
      {isOpen ? (
        <Portal>
          <PurchaseModal
            accountId={account_id}
            termsLabel={termsLabel}
            product={product}
            quantity={items.length}
            descriptionLabel={descriptionLabel}
            marketingLabel={marketingLabel}
            Summary={OfferSummary}
            closeModal={closePortal}
            action="offer"
          />
        </Portal>
      ) : null}
    </Card>
  );
};

export default Offer;
