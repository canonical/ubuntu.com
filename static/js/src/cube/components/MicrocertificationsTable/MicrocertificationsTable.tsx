import React, { useEffect, useState } from "react";
import { ContextualMenu, MainTable } from "@canonical/react-components";
import CubePurchase from "../CubePurchase";
import PrepareButton from "../PrepareButton";

export enum Status {
  Enrolled = "enrolled",
  NotEnrolled = "not-enrolled",
  Passed = "passed",
  Failed = "failed",
  InProgress = "in-progress",
}

const translateStatus = (status: Status) => {
  return {
    [Status.Enrolled]: "Enrolled",
    [Status.NotEnrolled]: "Not Enrolled",
    [Status.Passed]: "Passed",
    [Status.Failed]: "Failed",
    [Status.InProgress]: "In Progress",
  }[status];
};

const TableView = () => {
  const [modules, setModules] = useState([]);
  const [studyLabs, setStudyLabs] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getModules = async () => {
      try {
        const queryString = window.location.search;
        const response = await fetch(`/cube/microcerts.json${queryString}`);

        if (response.status === 200) {
          const responseJson = await response.json();
          const { study_labs_listing: studyLabs } = responseJson;
          let { modules } = responseJson;
          modules = modules.map((module: Record<string, unknown>) => ({
            name: module["name"],
            badgeURL: module["badge-url"],
            topics: module["topics"],
            studyLabURL: module["study_lab_url"],
            takeURL: module["take_url"],
            status: module["status"],
            productListingId: module["product_listing_id"],
          }));

          setModules(modules);
          setStudyLabs(studyLabs);
        }
      } catch {
        const errorMessage = "An error occurred while loading the microcerts";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    getModules();
  }, []);

  const copyBadgeUrl = async (badgeUrl: string) => {
    try {
      await navigator.clipboard.writeText(badgeUrl);
    } catch {
      console.error("Failed to copy data to clipboard");
    }
  };

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

  return (
    <MainTable
      responsive
      className="p-table--cube--grid"
      headers={[
        { content: "#" },
        { content: "" },
        { content: "Module" },
        { content: "Topics" },
        { content: "Status", className: "p-table__cell--icon-placeholder" },
        { content: "Action", className: "u-align--right" },
      ]}
      rows={modules.map(
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
            ],
          };
        }
      )}
      emptyStateMsg={
        <section aria-live="polite" aria-busy={isLoading ? "true" : "false"}>
          <p>
            {isLoading ? (
              <i className="p-icon--spinner u-animation--spin"></i>
            ) : error ? (
              <i>{error}</i>
            ) : (
              <i>No microcerts were found</i>
            )}
          </p>
        </section>
      }
    />
  );
};

export default TableView;
