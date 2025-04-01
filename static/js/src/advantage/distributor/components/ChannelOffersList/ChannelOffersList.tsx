import { useState } from "react";
import * as Sentry from "@sentry/react";
import { Offer as OfferType } from "../../../offers/types";
import { MainTable, Select, Row, Col } from "@canonical/react-components";
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
    const opId = offer?.external_ids?.[0]?.ids?.[0];
    const opportunityNumber = offer?.opportunity_number;
    const creatorName = offer?.channel_deal_creator_name;
    const resellerName = offer?.reseller_account_name;
    const customerName = offer?.end_user_account_name;

    return (
      opId?.toLowerCase().includes(searchValue.toLowerCase()) ||
      opportunityNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
      creatorName?.toLowerCase().includes(searchValue.toLowerCase()) ||
      resellerName?.toLowerCase().includes(searchValue.toLowerCase()) ||
      customerName?.toLowerCase().includes(searchValue.toLowerCase())
    );
  });

  return (
    <>
      <Row>
        <Col size={3}>
          <form className="p-search-box">
            <label className="u-off-screen" htmlFor="search">
              Search
            </label>
            <input
              type="search"
              id="search"
              className="p-search-box__input"
              name="search"
              placeholder="Search"
              autoComplete="on"
              onChange={(e) => setSearchValue(e.target.value)}
              value={searchValue}
            />
            {searchValue != "" && (
              <button
                className="p-search-box__reset"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSearchValue("");
                }}
              >
                <i className="p-icon--close">Close</i>
              </button>
            )}
            <button
              className="p-search-box__button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <i className="p-icon--search">Search</i>
            </button>
          </form>
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
