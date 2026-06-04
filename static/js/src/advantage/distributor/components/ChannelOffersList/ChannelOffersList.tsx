import { useState } from "react";
import * as Sentry from "@sentry/react";
import { Offer as OfferType } from "../../../offers/types";
import {
  MainTable,
  Select,
  Row,
  Col,
  SearchBox,
} from "@canonical/react-components";
import useGetChannelOffersList from "../../hooks/useGetChannelOffersList";
import InitiateButton from "../InitiateButton/InitiateButton";

const ChannelOffersList = () => {
  const [selectValue, setSelectValue] = useState("default");
  const [searchValue, setSearchValue] = useState("");
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
      ? offersList?.filter((offer: OfferType) => !offer?.purchase)
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

  const sortedOffersList = filteredOfferList?.sort(
    (a: OfferType, b: OfferType) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    },
  );

  const searchOfferList = sortedOffersList?.filter((offer: OfferType) => {
    const opId = offer?.external_ids?.[0]?.ids?.[0].toLowerCase() || "";
    const opportunityNumber = offer?.opportunity_number?.toLowerCase() || "";
    const creatorName = offer?.channel_deal_creator_name?.toLowerCase() || "";
    const resellerName = offer?.reseller_account_name?.toLowerCase() || "";
    const customerName = offer?.end_user_account_name?.toLowerCase() || "";
    const creationDate = offer?.created_at?.toLowerCase() || "";
    const searchValueLower = searchValue.toLowerCase();

    return (
      opId.includes(searchValueLower) ||
      opportunityNumber.includes(searchValueLower) ||
      creatorName.includes(searchValueLower) ||
      resellerName.includes(searchValueLower) ||
      customerName.includes(searchValueLower) ||
      creationDate.includes(searchValueLower)
    );
  });

  return (
    <>
      <Row>
        <Col size={3}>
          <SearchBox
            externallyControlled
            onChange={(value) => {
              setSearchValue(value);
            }}
            value={searchValue}
          />
        </Col>
        <Col emptyMedium={10} emptyLarge={10} size={3}>
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
                label: "Show used offers",
                value: "all",
              },
            ]}
            onChange={(e) => setSelectValue(e.target.value)}
          />
        </Col>
      </Row>
      <MainTable
        data-testid="channel-offer-table"
        className="u-no-margin--bottom channel-offer-table"
        headers={[
          {
            content: "Opp ID",
          },
          {
            content: "Opp number",
          },
          {
            content: "Creator",
          },
          {
            content: "Technical user",
          },
          {
            content: "Customer",
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
        rows={searchOfferList?.map((offer: OfferType) => {
          const status = offer?.actionable ? "Valid" : "Invalid";
          const opId = offer?.external_ids?.[0]?.ids?.[0];

          return {
            columns: [
              {
                content: opId ?? "-",
              },
              {
                content: offer?.opportunity_number ?? "-",
              },
              {
                content: offer?.channel_deal_creator_name ?? "-",
              },
              {
                content: offer?.end_user_account_name ?? "-",
              },
              {
                content: offer?.reseller_account_name ?? "-",
              },
              {
                content: offer?.created_at ? paraseDate(offer.created_at) : "-",
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
