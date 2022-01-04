import React, { useState } from "react";

const OffersList = () => {
  const [offersList] = useState([]);

  if (offersList.length < 1) {
    return <p>You have no offers available.</p>;
  }

  return (
    <>
      {offersList.map((offer) => {
        <p>{offer}</p>;
      })}
    </>
  );
};

export default OffersList;
