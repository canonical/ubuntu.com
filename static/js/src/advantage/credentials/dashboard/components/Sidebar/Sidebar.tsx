import { useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { setupAppLayoutExamples } from "./utils";
import { useQuery } from "@tanstack/react-query";
import { getSystemStatuses } from "../../api/queryFns";

const HeadingImage = () => (
  <a
    href="/credentials"
    target="_blank"
    className="p-link--soft"
    style={{
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      margin: "1rem 0rem",
      cursor: "pointer",
    }}
  >
    <img
      src="https://assets.ubuntu.com/v1/82818827-CoF_white.svg"
      width={20}
      height={"auto"}
    />
    <p className="p-heading--5" style={{ padding: "0rem", margin: "0rem" }}>
      Credentials
    </p>
  </a>
);

const Sidebar = () => {
  const location = useLocation();
  const {
    data: statuses,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["systemStatuses"],
    queryFn: getSystemStatuses,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    setupAppLayoutExamples();
  }, []);

  const links = useMemo(() => {
    return [
      {
        to: "/exams/upcoming",
        label: "Exams",
        icon: "p-icon--machines",
        isActive: location.pathname.includes("/exams"),
      },
      {
        to: "/keys/list",
        label: "Keys",
        icon: "p-icon--units",
        isActive: location.pathname.includes("/keys"),
      },
      {
        to: "/credly/issued",
        label: "Credly",
        icon: "p-icon--plans",
        isActive: location.pathname.includes("/credly"),
      },
      {
        to: "/test-taker-stats",
        label: "Test Taker Stats",
        icon: "p-icon--user",
        isActive: location.pathname === "/test-taker-stats",
      },
    ];
  }, [location.pathname]);

  const systemStatus = useMemo(() => {
    const status: {
      [key in "Trueability" | "Contracts" | "Proctor360"]: boolean;
    } = {
      Trueability: false,
      Contracts: false,
      Proctor360: false,
    };

    if (statuses && !isError) {
      const { ta_status, contracts_status, proctor_status } = statuses;
      status["Trueability"] = !ta_status?.error;
      status["Contracts"] = !contracts_status?.error;
      status["Proctor360"] = !proctor_status?.error;
    }
    return status;
  }, [statuses]);

  return (
    <>
      <div className="l-navigation-bar">
        <div className="p-panel is-dark">
          <div className="p-panel__header">
            <HeadingImage />
            <div className="p-panel__controls">
              <span className="p-panel__toggle js-menu-toggle">Menu</span>
            </div>
          </div>
        </div>
      </div>

      <header className="l-navigation is-collapsed">
        <div className="l-navigation__drawer">
          <div className="p-panel is-dark">
            <div className="p-panel__header is-sticky">
              <HeadingImage />
              <div className="p-panel__controls u-hide--large">
                <button className="p-button--base is-dark has-icon u-no-margin u-hide--medium js-menu-close">
                  <i className="is-light p-icon--close"></i>
                </button>
                <button className="p-button--base is-dark has-icon u-no-margin u-hide--small js-menu-pin">
                  <i className="is-light p-icon--pin"></i>
                </button>
              </div>
            </div>
            <div className="p-panel__content">
              <div className="p-side-navigation--icons" id="drawer-icons">
                <nav aria-label="Main">
                  <ul className="p-side-navigation__list">
                    {links.map((link) => (
                      <li key={link.to} className="p-side-navigation__item">
                        <Link
                          aria-current={link.isActive ? "page" : undefined}
                          to={link.to}
                          className="p-side-navigation__link"
                        >
                          <i
                            className={`p-icon ${link.icon} is-light p-side-navigation__icon`}
                          ></i>
                          <span className="p-side-navigation__label">
                            <span className="p-side-navigation__label">
                              {link.label}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                    <li className="p-side-navigation__item has-active-child">
                      <div className="p-side-navigation__link">
                        <i className="p-icon--information is-light p-side-navigation__icon"></i>
                        <span className="p-side-navigation__label">
                          System Status
                        </span>
                      </div>
                      <ul className="p-side-navigation__list">
                        <li className="p-side-navigation__item">
                          <div className="p-side-navigation__link">
                            <span className="p-side-navigation__label">
                              Trueability
                            </span>
                            <div className="p-side-navigation__status">
                              {isLoading ? (
                                <i className="p-icon--spinner u-animation--spin is-light"></i>
                              ) : (
                                <i
                                  className={`p-icon--${
                                    systemStatus["Trueability"]
                                      ? "success"
                                      : "error"
                                  } is-light`}
                                ></i>
                              )}
                            </div>
                          </div>
                        </li>
                        <li className="p-side-navigation__item">
                          <div className="p-side-navigation__link">
                            <span className="p-side-navigation__label">
                              Contracts API
                            </span>
                            <div className="p-side-navigation__status">
                              {isLoading ? (
                                <i className="p-icon--spinner u-animation--spin is-light"></i>
                              ) : (
                                <i
                                  className={`p-icon--${
                                    systemStatus["Contracts"]
                                      ? "success"
                                      : "error"
                                  } is-light`}
                                ></i>
                              )}
                            </div>
                          </div>
                        </li>
                        <li className="p-side-navigation__item">
                          <div className="p-side-navigation__link">
                            <span className="p-side-navigation__label">
                              Proctor 360
                            </span>
                            <div className="p-side-navigation__status">
                              {isLoading ? (
                                <i className="p-icon--spinner u-animation--spin is-light"></i>
                              ) : (
                                <i
                                  className={`p-icon--${
                                    systemStatus["Proctor360"]
                                      ? "success"
                                      : "error"
                                  } is-light`}
                                ></i>
                              )}
                            </div>
                          </div>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Sidebar;
