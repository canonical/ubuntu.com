import React from "react";
import { ActionButton, Card } from "@canonical/react-components";
import { currencyFormatter } from "advantage/react/utils";
import { Offer as OfferType, Item } from "../../types";

type Props = {
  offer: OfferType;
};

const Offer = ({ offer }: Props) => {
  return (
    <Card data-testid="offer-card">
      <div className="advantage-offer-row">
        <p className="p-text--x-small-capitalised contract-item">
          Contract item
        </p>
        <p className="p-text--x-small-capitalised allowance">Allowance</p>
        <p className="p-text--x-small-capitalised price">Price</p>
      </div>
      <hr />
      {offer.items.map((item: Item) => {
        return (
          <div key={item.id} className="advantage-offer-row">
            <p className="contract-item">
              <strong>{item.name}</strong>
            </p>
            <p className="allowance">{item.allowance ?? 0}</p>
            <p className="price">
              {currencyFormatter.format(item.price / 100)}
            </p>
          </div>
        );
      })}
      <div className="advantage-offer-row">
        <p className="p-text--x-small-capitalised allowance">
          Total before taxes
        </p>
        <p className="price">{currencyFormatter.format(offer.total / 100)}</p>
      </div>
      <div
        style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}
      >
        <ActionButton
          appearance="positive"
          className="u-no-margin--bottom"
          onClick={() => {
            alert("nope.");
          }}
          disabled={!offer.actionable}
        >
          Purchase
        </ActionButton>
      </div>
    </Card>
  );
};

export default Offer;
