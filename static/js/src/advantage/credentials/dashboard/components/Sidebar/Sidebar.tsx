import React from "react";

const Sidebar = () => {
  return (
    <>
      <header className="l-navigation">
        <div className="l-navigation__drawer">
          <div className="p-panel is-dark">
            <div className="p-panel__header is-sticky">
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
                    <li className="p-side-navigation__item--title">
                      <a className="p-side-navigation__link" href="#">
                        <span className="p-side-navigation__label">
                          Title that is a link
                        </span>
                      </a>
                    </li>
                    <li className="p-side-navigation__item">
                      <a className="p-side-navigation__link" href="#">
                        <i className="p-icon--information is-light p-side-navigation__icon"></i>
                        <span className="p-side-navigation__label">
                          <span className="p-side-navigation__label">
                            First level link
                          </span>
                        </span>
                      </a>
                    </li>
                    <li className="p-side-navigation__item">
                      <a className="p-side-navigation__link" href="#">
                        <i className="p-icon--help is-light p-side-navigation__icon"></i>
                        <span className="p-side-navigation__label">
                          First level link with status
                        </span>
                        <div className="p-side-navigation__status">
                          <i className="p-icon--error is-light"></i>
                        </div>
                      </a>
                    </li>
                    <li className="p-side-navigation__item has-active-child">
                      <a className="p-side-navigation__link" href="#">
                        <i className="p-icon--user is-light p-side-navigation__icon"></i>
                        <span className="p-side-navigation__label">
                          Link with children
                        </span>
                      </a>
                      <ul className="p-side-navigation__list">
                        <li className="p-side-navigation__item">
                          <a className="p-side-navigation__link" href="#">
                            <span className="p-side-navigation__label">
                              Second level link
                            </span>
                            <div className="p-side-navigation__status">
                              <i className="p-icon--warning is-light"></i>
                            </div>
                          </a>
                        </li>
                        <li className="p-side-navigation__item">
                          <span className="p-side-navigation__text">
                            <span className="p-side-navigation__label">
                              Second level text
                            </span>
                          </span>
                        </li>
                        <li className="p-side-navigation__item">
                          <a className="p-side-navigation__link" href="#">
                            <span className="p-side-navigation__label">
                              Second level link with children
                            </span>
                          </a>
                          <ul className="p-side-navigation__list">
                            <li className="p-side-navigation__item">
                              <span className="p-side-navigation__text">
                                <span className="p-side-navigation__label">
                                  Third level text
                                </span>
                              </span>
                            </li>
                            <li className="p-side-navigation__item">
                              <a className="p-side-navigation__link" href="#">
                                <span className="u-truncate p-side-navigation__label">
                                  Third level link with label that is truncated
                                  because it's long long long long long
                                </span>
                                <div className="p-side-navigation__status">
                                  <span className="p-status-label--caution">
                                    In progress
                                  </span>
                                </div>
                              </a>
                            </li>
                            <li className="p-side-navigation__item">
                              <a
                                className="p-side-navigation__link"
                                aria-current="page"
                                href="#"
                              >
                                <span className="p-side-navigation__label">
                                  Third level active link
                                </span>
                              </a>
                            </li>
                            <li className="p-side-navigation__item">
                              <a className="p-side-navigation__link" href="#">
                                <span className="p-side-navigation__label">
                                  Third level link with status
                                </span>
                                <div className="p-side-navigation__status">
                                  <i className="p-icon--success is-light"></i>
                                </div>
                              </a>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                    <li className="p-side-navigation__item">
                      <span className="p-side-navigation__text">
                        <i className="p-icon--collapse is-light p-side-navigation__icon"></i>
                        <span className="p-side-navigation__label">
                          First level item that is not a link
                        </span>
                      </span>
                    </li>
                    <li className="p-side-navigation__item">
                      <a className="p-side-navigation__link" href="#">
                        <span className="p-side-navigation__label">
                          First level link with a label
                        </span>
                        <div className="p-side-navigation__status">
                          <span className="p-status-label--positive">New</span>
                        </div>
                      </a>
                    </li>
                    <li className="p-side-navigation__item">
                      <a className="p-side-navigation__link" href="#">
                        <i className="p-icon--search is-light p-side-navigation__icon"></i>
                        <span className="p-side-navigation__label">
                          First level link with a label is long and wraps wraps
                          wraps wraps wraps wraps
                        </span>
                        <div className="p-side-navigation__status">
                          <span className="p-status-label--information">
                            Updated
                          </span>
                        </div>
                      </a>
                    </li>
                    <li className="p-side-navigation__item">
                      <a className="p-side-navigation__link" href="#">
                        <span className="u-truncate p-side-navigation__label">
                          First level link with label that is truncated because
                          it's long long long long long long long
                        </span>
                        <div className="p-side-navigation__status">
                          <span className="p-status-label--information">
                            Validated
                          </span>
                        </div>
                      </a>
                    </li>
                  </ul>
                  <ul className="p-side-navigation__list is-fading-when-collapsed">
                    <li className="p-side-navigation__item--title">
                      <span className="p-side-navigation__text">
                        Title that is not a link
                      </span>
                    </li>
                    <li className="p-side-navigation__item">
                      <span className="p-side-navigation__text">
                        First level text
                      </span>
                    </li>
                    <li className="p-side-navigation__item">
                      <span className="p-side-navigation__text">
                        Text item with children
                      </span>
                      <ul className="p-side-navigation__list">
                        <li className="p-side-navigation__item">
                          <a className="p-side-navigation__link" href="#">
                            Second level link
                          </a>
                        </li>
                        <li className="p-side-navigation__item">
                          <span className="p-side-navigation__text">
                            Second level text
                          </span>
                        </li>
                        <li className="p-side-navigation__item">
                          <span className="p-side-navigation__text">
                            Second level text with children
                          </span>
                          <ul className="p-side-navigation__list">
                            <li className="p-side-navigation__item">
                              <span className="p-side-navigation__text">
                                Third level text
                              </span>
                            </li>
                            <li className="p-side-navigation__item">
                              <a
                                className="p-side-navigation__link is-active"
                                href="#"
                              >
                                Third level active item that is long and wraps
                                wraps wraps wraps wraps wraps
                              </a>
                            </li>
                            <li className="p-side-navigation__item">
                              <a className="p-side-navigation__link" href="#">
                                <span className="u-truncate">
                                  Third level link that is truncated because
                                  it's long long long long long long long
                                </span>
                              </a>
                            </li>
                            <li className="p-side-navigation__item">
                              <a className="p-side-navigation__link" href="#">
                                Third level link
                              </a>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                    <li className="p-side-navigation__item">
                      <span className="p-side-navigation__text">
                        First level item that is not a link
                      </span>
                    </li>
                    <li className="p-side-navigation__item">
                      <a className="p-side-navigation__link" href="#">
                        First level link
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </header>
      <header className="l-navigation">
        <div className="l-navigation-bar">
          <div className="p-panel is-dark">
            <div className="p-panel__header">
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
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Sidebar;
