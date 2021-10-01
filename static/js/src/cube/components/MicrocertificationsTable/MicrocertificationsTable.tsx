import React from "react";
import { Button, ContextualMenu, MainTable } from "@canonical/react-components";

const TableView = () => {
  const enum Status {
    Enrolled = "Enrolled",
    NotEnrolled = "Not Enrolled",
    Passed = "Passed",
    Failed = "Failed",
    InProgress = "In Progress",
  }

  // TODO: replace dummy data with data from endpoint
  const modules = [
    {
      badgeURL: "https://assets.ubuntu.com/v1/9ef4a092-Architecture.svg",
      name: "Ubuntu System Architecture",
      topics: [
        "Review and record relevant system information",
        "Manage kernels and devices",
        "Make administrative changes to devices and hardware",
      ],
      studyLabURL:
        "https://qa.cube.ubuntu.com/courses/course-v1:CUBE+study_labs+2020/courseware/sysarch/",
      takeURL:
        "https://qa.cube.ubuntu.com/courses/course-v1:CUBE+sysarch+2020/courseware/2020/start/",
      status: Status.Enrolled,
    },
    {
      badgeURL: "https://assets.ubuntu.com/v1/c19e9931-Packages.svg",
      name: "Managing Packages in Ubuntu",
      topics: [
        "Assess package information",
        "Use and configure snaps",
        "Manage Debian packages",
        "Manage executables with alternatives",
      ],
      studyLabURL:
        "https://qa.cube.ubuntu.com/courses/course-v1:CUBE+study_labs+2020/courseware/package/",
      takeURL:
        "https://qa.cube.ubuntu.com/courses/course-v1:CUBE+package+2020/courseware/2020/start/",
      status: Status.NotEnrolled,
    },
    {
      badgeURL: "https://assets.ubuntu.com/v1/43f7d2a3-Commands.svg",
      name: "Using Command Line Tools",
      topics: [
        "Work with file contents",
        "Process data using the command line",
        "Use essential utilities",
      ],
      studyLabURL:
        "https://qa.cube.ubuntu.com/courses/course-v1:CUBE+study_labs+2020/courseware/commands/",
      takeURL:
        "https://qa.cube.ubuntu.com/courses/course-v1:CUBE+commands+2020/courseware/2020/start/",
      status: Status.Passed,
    },
    {
      badgeURL: "https://assets.ubuntu.com/v1/093b57b6-Devices+%26+files.svg",
      name: "Linux Devices and Filesystems",
      topics: [
        "Configure volumes and subvolumes",
        "Create and configure partitions",
        "Encrypt disks",
        "Manage and configure block devices, Device Mapper, and filesystems",
      ],
      studyLabURL:
        "https://qa.cube.ubuntu.com/courses/course-v1:CUBE+study_labs+2020/courseware/devices/",
      takeURL:
        "https://qa.cube.ubuntu.com/courses/course-v1:CUBE+devices+2020/courseware/2020/start/",
      status: Status.Failed,
    },
    {
      badgeURL: "https://assets.ubuntu.com/v1/30af430c-bash.svg",
      name: "Bash Shell Scripting",
      topics: [
        "Create, check, and test files",
        "Work with logs",
        "Monitor and gather information from other systems",
        "Automate tasks with loops and conditionals",
      ],
      studyLabURL:
        "https://qa.cube.ubuntu.com/courses/course-v1:CUBE+study_labs+2020/courseware/shellscript/",
      takeURL:
        "https://qa.cube.ubuntu.com/courses/course-v1:CUBE+shellscript+2020/courseware/2020/start/",
      status: Status.InProgress,
    },
  ];

  const copyBadgeUrl = (badgeUrl: string) => {
    const el = document.createElement("textarea");
    el.value = badgeUrl;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
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
        {status}
      </>
    </p>
  );

  const renderActions = (
    moduleName: string,
    badgeURL: string,
    studyLabURL: string,
    takeURL: string,
    status: Status
  ) => (
    <div className="u-no-padding--top u-align--right">
      {status === Status.Enrolled ? (
        <>
          <a
            className="p-button--neutral u-no-margin--right"
            href={studyLabURL}
          >
            Prepare
          </a>
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
                `https://www.ubuntu.com/cube.&amp;url=${badgeURL}&amp;` +
                `hashtags=CUBE2020`,
            },
            {
              children: "Copy to clipboard",
              onClick: () => copyBadgeUrl(badgeURL),
            },
          ]}
        />
      ) : (
        <Button appearance={"positive"}>Purchase</Button>
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
        ({ name, badgeURL, topics, studyLabURL, takeURL, status }, index) => {
          return {
            key: index + 1,
            columns: [
              {
                content: <span className="u-text--muted">{index + 1}</span>,
                "aria-label": "Module number",
              },
              {
                content: <img src={badgeURL} alt="" />,
                className: "p-table--cube--grid__module-logo",
                "aria-label": "Badge",
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
                  status
                ),
              },
            ],
          };
        }
      )}
    />
  );
};

export default TableView;
