import React from "react";
import { ActionButton, Card } from "@canonical/react-components";
import { currencyFormatter } from "advantage/react/utils";
import { Offer, ProductListing } from "../types";

type Props = {
  offer: Offer;
};

const Offer = ({ offer }: Props) => {
  let total = 0;
  return (
    <Card>
      <div className="advantage-offer-row">
        <p className="p-text--x-small-capitalised contract-item">
          Contract item
        </p>
        <p className="p-text--x-small-capitalised allowance">Allowance</p>
        <p className="p-text--x-small-capitalised price">Price</p>
      </div>
      <hr />
      {offer.productListings.map((productListing: ProductListing) => {
        total += productListing.price.value;
        return (
          <div key={productListing.id} className="advantage-offer-row">
            <p className="contract-item">
              <strong>{productListing.name}</strong>
            </p>
            <p className="allowance">{productListing.allowance ?? 0}</p>
            <p className="price">
              {currencyFormatter.format(productListing.price.value / 100)}
            </p>
          </div>
        );
      })}
      <div className="advantage-offer-row">
        <p className="p-text--x-small-capitalised allowance">
          Total before taxes
        </p>
        <p className="price">{currencyFormatter.format(total / 100)}</p>
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
        >
          Purchase
        </ActionButton>
      </div>
    </Card>
  );
};

export default Offer;
