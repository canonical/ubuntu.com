import React, { useState } from "react";
import * as Sentry from "@sentry/react";
import {
  Offer as OfferType,
  ExternalId as ExternalIdType,
} from "../../../offers/types";
import { MainTable, Select, Row, Col } from "@canonical/react-components";
import useGetChannelOffersList from "../../hooks/useGetChannelOffersList";
import InitiateButton from "../InitiateButton/InitiateButton";

const ChannelOffersList = () => {
  const [selectValue, setSelectValue] = useState("default");
  const {
    isLoading,
    isError,
    data: offersList,
    error,
  } = useGetChannelOffersList();

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

  const filteredOfferList =
    selectValue === "default"
      ? offersList?.filter((offer: OfferType) => offer.purchase === false)
      : offersList;
  const paraseDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formattedDate = `${day} ${monthNames[monthIndex]} ${year}`;
    return formattedDate;
  };
  return (
    <>
      <Row style={{ display: "flex", justifyContent: "end" }}>
        <Col size={3}>
          <Select
            defaultValue="default"
            id="offerSelect"
            name="offerSelect"
            options={[
              {
                label: "Default",
                value: "default",
              },
              {
                label: "Show used offer",
                value: "all",
              },
            ]}
            onChange={(e) => setSelectValue(e.target.value)}
          />
        </Col>
      </Row>
      <MainTable
        className="u-no-margin--bottom"
        headers={[
          {
            content: "Deal registration id",
          },
          {
            content: "Customer",
          },
          {
            content: "Technical user",
          },
          {
            content: "Creator",
          },
          {
            content: "Created",
          },
          {
            content: "Status",
          },
          {
            content: "Actions",
            className: "u-align--right",
          },
        ]}
        rows={filteredOfferList?.map((offer: OfferType) => {
          const deal_registration_id = offer?.external_ids?.filter(
            (external_id: ExternalIdType) => (external_id.origin = "Zift")
          )[0]["ids"];
          const status = offer?.actionable ? "Valid" : "Invalid";
          return {
            columns: [
              {
                content: deal_registration_id,
              },
              {
                content: offer.end_user_account_name,
              },
              {
                content: offer.technical_contact_name,
              },
              {
                content: offer.distributor_account_name,
              },
              {
                content: paraseDate(offer.created_at),
              },
              {
                content: status,
              },
              {
                content: <InitiateButton offer={offer} />,
                className: "u-align--right",
              },
            ],
          };
        })}
      />
    </>
  );
};

export default ChannelOffersList;
