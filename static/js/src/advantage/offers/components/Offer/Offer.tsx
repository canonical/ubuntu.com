import React from "react";
import {
  ActionButton,
  Card,
  Row,
  Col,
  Modal,
} from "@canonical/react-components";
import { currencyFormatter } from "advantage/react/utils";
import PurchaseModal from "../../../../PurchaseModal";
import { BuyButtonProps } from "../../../subscribe/react/utils/utils";
import { Offer as OfferType, Item } from "../../types";
import BuyButton from "../BuyButton";
import Summary from "../Summary";

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
      Ubuntu Advantage terms
    </a>
    , which apply to the <a href="/legal/solution-support">Solution Support</a>{" "}
    service.
  </>
);

const marketingLabel =
  "I agree to receive information about Canonical's products and services";

const Offer = ({ offer }: Props) => {
  const { items, marketplace, total, account_id } = offer;
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const OfferSummary = () => {
    return <Summary offer={offer} />;
  };

  const BuyOfferButton = ({
    areTermsChecked,
    isMarketingOptInChecked,
    setTermsChecked,
    setIsMarketingOptInChecked,
    setError,
    setStep,
    isUsingFreeTrial,
  }: BuyButtonProps) => {
    return (
      <BuyButton
        offer={offer}
        areTermsChecked={areTermsChecked}
        isMarketingOptInChecked={isMarketingOptInChecked}
        setTermsChecked={setTermsChecked}
        setIsMarketingOptInChecked={setIsMarketingOptInChecked}
        setError={setError}
        setStep={setStep}
        isUsingFreeTrial={isUsingFreeTrial}
      />
    );
  };

  return (
    <Card data-testid="offer-card">
      <Row>
        <Col size={6}>
          <p className="p-text--x-small-capitalised">Contract item</p>
        </Col>
        <Col size={3}>
          <p className="p-text--x-small-capitalised">Allowance</p>
        </Col>
        <Col size={3}>
          <p className="p-text--x-small-capitalised">Price</p>
        </Col>
      </Row>
      <hr />
      {items.map((item: Item) => {
        return (
          <Row key={item.id}>
            <Col size={6}>
              <p>
                <strong>{item.name}</strong>
              </p>
            </Col>
            <Col size={3}>
              <p>{item.allowance ?? 0}</p>
            </Col>
            <Col size={3}>
              <p>{currencyFormatter.format(item.price / 100)}</p>
            </Col>
          </Row>
        );
      })}
      <Row>
        <Col size={3} emptyLarge={7}>
          <p className="p-text--x-small-capitalised col-3 col-start-large-7">
            Total before taxes
          </p>
        </Col>
        <Col size={3}>
          <p className="col-3">{currencyFormatter.format(total / 100)}</p>
        </Col>
      </Row>
      <Row>
        <Col size={12} className="u-align--right">
          <ActionButton
            appearance="positive"
            className="u-no-margin--bottom"
            onClick={openModal}
          >
            Purchase
          </ActionButton>
        </Col>
      </Row>
      {isModalOpen ? (
        <Modal>
          <PurchaseModal
            accountId={account_id}
            termsLabel={termsLabel}
            marketingLabel={marketingLabel}
            Summary={OfferSummary}
            closeModal={closeModal}
            BuyButton={BuyOfferButton}
            marketplace={marketplace}
          />
        </Modal>
      ) : null}
    </Card>
  );
};

export default Offer;
