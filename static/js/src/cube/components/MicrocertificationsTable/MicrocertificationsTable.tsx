import React from "react";
import { ContextualMenu, MainTable } from "@canonical/react-components";
import classNames from "classnames";
import CubePurchase from "../CubePurchase";
import PrepareButton from "../PrepareButton";
import { Module, Status } from "../../types";

type Props = {
  modules: Module[];
  studyLabs: Record<string, unknown>;
  certifiedBadge: null | Record<string, string>;
  isLoading: boolean;
  isError: boolean;
};

const translateStatus = (status: Status) => {
  return {
    [Status.Enrolled]: "Enrolled",
    [Status.NotEnrolled]: "Not Enrolled",
    [Status.Passed]: "Passed",
    [Status.Failed]: "Failed",
    [Status.InProgress]: "In Progress",
  }[status];
};

const copyBadgeUrl = async (badgeUrl: string) => {
  try {
    await navigator.clipboard.writeText(badgeUrl);
  } catch {
    console.error("Failed to copy data to clipboard");
  }
};

const MicrocertificationsTable = ({
  modules,
  studyLabs,
  certifiedBadge,
  isLoading,
  isError,
}: Props) => {
  const renderModuleName = (name: string, topics: Array<string>) => (
    <div>
      <h3 className="p-heading--5 u-no-margin u-no-padding">{name}</h3>
      <p className="u-text--muted u-hide--small">
        <small>{topics.length} topics</small>
      </p>
    </div>
  );

  const renderTopics = (topics: Array<string>) => (
    <ul className="p-list u-no-margin" style={{ whiteSpace: "normal" }}>
      {topics.map((topic) => (
        <li key={topic} className="p-list__item">
          {topic}
        </li>
      ))}
    </ul>
  );

  const renderStatus = (status: Status) => (
    <p className="u-no-padding--top">
      <>
        {status === Status.Passed ? (
          <i className="p-icon--success" />
        ) : status === Status.Failed ? (
          <i className="p-icon--error" />
        ) : null}
        {translateStatus(status)}
      </>
    </p>
  );

  const renderActions = (
    moduleName: string,
    badgeURL: string,
    studyLabURL: string,
    takeURL: string,
    status: Status,
    productListingId: string
  ) => (
    <div className="u-no-padding--top u-align--right">
      {status === Status.Enrolled ? (
        <>
          <PrepareButton
            studyLabURL={studyLabURL}
            productName={String(studyLabs["name"])}
            productListingId={String(studyLabs["product_listing_id"])}
            isEnrolled={studyLabs["status"] === "enrolled"}
          />
          <a className="p-button--positive" href={takeURL}>
            Take
          </a>
        </>
      ) : status === Status.InProgress ? (
        <a className="p-button--positive" href={takeURL}>
          Resume
        </a>
      ) : status === Status.Passed ? (
        <ContextualMenu
          hasToggleIcon
          toggleLabel="Share"
          links={[
            {
              children: "Share via LinkedIn",
              element: "a",
              href: `https://www.linkedin.com/shareArticle?mini=true&amp;url=${badgeURL}`,
            },
            {
              children: "Share via Twitter",
              element: "a",
              href:
                `https://twitter.com/share?text=I earned ${moduleName} ` +
                `from @Canonical. Now I’m one step closer to becoming a ` +
                `Certified @Ubuntu Engineer. Learn more about ` +
                `Canonical’s available microcerts and CUBE 2020 at ` +
                `https://ubuntu.com/cube.&amp;url=${badgeURL}&amp;` +
                `hashtags=CUBE2020`,
            },
            {
              children: "Copy to clipboard",
              onClick: () => copyBadgeUrl(badgeURL),
            },
          ]}
        />
      ) : (
        <CubePurchase
          productName={moduleName}
          productListingId={productListingId}
        />
      )}
    </div>
  );

  const sectionHeader = certifiedBadge
    ? "Microcertification history"
    : "Microcertifications";

  const headers = certifiedBadge
    ? [
        { content: "#" },
        { content: "" },
        { content: "Module" },
        {
          content: "Status",
          className: "p-table__cell--icon-placeholder u-align--right",
        },
      ]
    : [
        { content: "#" },
        { content: "" },
        { content: "Module" },
        { content: "Topics" },
        { content: "Status", className: "p-table__cell--icon-placeholder" },
        { content: "Action", className: "u-align--right" },
      ];

  const rows = modules.map(
    (
      {
        name,
        badgeURL,
        topics,
        studyLabURL,
        takeURL,
        status,
        productListingId,
      },
      index
    ) => {
      return {
        key: name,
        columns: [
          {
            content: <span className="u-text--muted">{index + 1}</span>,
            className: "u-no-padding--right",
            "aria-label": "Module number",
          },
          {
            content: <img src={badgeURL} alt="" />,
            className: "p-table--cube--grid__module-logo",
          },
          {
            content: renderModuleName(name, topics),
            "aria-label": "Module",
          },
          ...(certifiedBadge
            ? [
                {
                  content: (
                    <p className="u-no-padding--top u-align--right">
                      <i className="p-icon--success" />
                      {"Passed"}
                    </p>
                  ),
                  className: "p-table__cell--icon-placeholder",
                  "aria-label": "Status",
                },
              ]
            : [
                {
                  content: renderTopics(topics),
                  "aria-label": "Topics",
                },
                {
                  content: renderStatus(status),
                  className: "p-table__cell--icon-placeholder",
                  "aria-label": "Status",
                },

                {
                  content: renderActions(
                    name,
                    badgeURL,
                    studyLabURL,
                    takeURL,
                    status,
                    productListingId
                  ),
                },
              ]),
        ],
      };
    }
  );

  return (
    <section className="p-strip">
      <div className="u-fixed-width">
        <h2>{sectionHeader}</h2>
        <MainTable
          responsive
          className={classNames("p-table--cube--grid", {
            "is-passed": certifiedBadge,
          })}
          headers={headers}
          rows={rows}
          emptyStateMsg={
            <section
              aria-live="polite"
              aria-busy={isLoading ? "true" : "false"}
            >
              <p>
                {isLoading ? (
                  <i className="p-icon--spinner u-animation--spin"></i>
                ) : isError ? (
                  <i>{"An error occurred while loading the microcerts"}</i>
                ) : (
                  <i>No microcerts were found</i>
                )}
              </p>
            </section>
          }
        />
      </div>
    </section>
  );
};

export default MicrocertificationsTable;
