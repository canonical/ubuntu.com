import React, { useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { setupAppLayoutExamples } from "./utils";

const Sidebar = () => {
  const location = useLocation();

  useEffect(() => {
    setupAppLayoutExamples();
  }, []);

  const links = useMemo(() => {
    return [
      {
        to: "/exams",
        label: "Exams",
        icon: "p-icon--machines",
        isActive: location.pathname === "/exams",
      },
      {
        to: "/keys",
        label: "Keys",
        icon: "p-icon--units",
        isActive: location.pathname === "/keys",
      },
    ];
  }, [location.pathname]);

  const handleClickDashboard = () => {
    window.open("/credentials", "_blank");
  };

  return (
    <>
      <div className="l-navigation-bar">
        <div className="p-panel is-dark">
          <div className="p-panel__header">
            <a className="p-panel__logo" href="/credentials" target="_blank">
              <img
                className="p-panel__logo-icon"
                src="https://assets.ubuntu.com/v1/7144ec6d-logo-jaas-icon.svg"
                alt=""
                width="24"
                height="24"
              />
              <img
                className="p-panel__logo-name is-fading-when-collapsed"
                src="https://assets.ubuntu.com/v1/2e04d794-logo-jaas.svg"
                alt="JAAS"
                height="16"
              />
            </a>
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
              <div
                onClick={handleClickDashboard}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.2rem",
                  margin: "1rem 0rem",
                  cursor: "pointer",
                }}
              >
                <img
                  src="https://assets.ubuntu.com/v1/82818827-CoF_white.svg"
                  width={20}
                  height={"auto"}
                />
                <p
                  className="p-heading--5"
                  style={{ padding: "0rem", margin: "0rem" }}
                >
                  Credentials
                </p>
              </div>
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
