import React from "react";
import * as Sentry from "@sentry/react";
import useGetOffersList from "../../hooks/useGetOffersList";
import Offer from "../Offer";
import { Offer as OfferType } from "../../types";

const OffersList = () => {
  const { isLoading, isError, data: offersList, error } = useGetOffersList();

  if (isError) {
    Sentry.captureException(error);
    return <p>Something went wrong while trying to retrieve your offers.</p>;
  }

  if (isLoading) {
    return (
      <div className="p-card__content">
        <p>
          <span className="p-text--default">
            <i className="p-icon--spinner u-animation--spin"></i>
          </span>
          &nbsp;&nbsp; Loading offers...
        </p>
      </div>
    );
  }

  if (offersList.length < 1) {
    return <p>You have no offers available.</p>;
  }

  return (
    <>
      {offersList.map((offer: OfferType) => {
        return <Offer key={offer.id} offer={offer} />;
      })}
    </>
  );
};

export default OffersList;
