import React from "react";

type Props = {
  edxUser: string;
  edxRegisterUrl: string;
  hasEnrollments: boolean;
  isLoading: boolean;
};

const MicrocertsFooter = ({
  hasEnrollments,
  edxUser,
  edxRegisterUrl,
  isLoading,
}: Props) => {
  const header = hasEnrollments
    ? "Thank you for joining the beta"
    : "Apply for beta access";

  const body = hasEnrollments
    ? "Canonical are grateful for your participation. We look forward to " +
      "hearing your feedback."
    : "Canonical are seeking participants from the community for the CUBE " +
      "beta test. If you would like to be considered for the beta, please " +
      "enter your information in the form below. Canonical will reach out " +
      "to you if you are selected.";

  return (
    <>
      {isLoading ? (
        <section className="p-strip--square-suru has-cube is-slanted--top-right u-align--center">
          <i className="p-icon--spinner u-animation--spin is-light"></i>
        </section>
      ) : (
        <section className="p-strip--square-suru has-cube is-slanted--top-right">
          <div className="u-fixed-width">
            <h2>{header}</h2>
            <p>{body}</p>
            {!hasEnrollments && (
              <a
                href="/cube/contact-us"
                className="p-button--positive cube-access js-invoke-modal"
              >
                Apply for access
              </a>
            )}
          </div>
        </section>
      )}
      {!isLoading && !edxUser && (
        <div className="p-modal" id="modal">
          <section className="p-modal__dialog" role="dialog">
            <header className="p-modal__header">
              <h2 className="p-modal__title" id="modal-title">
                edX Account
              </h2>
            </header>
            <p>
              In order to use CUBE you will need to create an account with edX.
              By clicking the button below you are accepting the{" "}
              <a
                href="/legal/terms-and-policies/cube-terms"
                target="_blank"
                rel="noopener noreferrer"
              >
                terms of service
              </a>{" "}
              and an account will be created for you.
            </p>
            <footer className="p-modal__footer">
              <a
                className="p-button p-button--positive u-no-margin--bottom"
                href={edxRegisterUrl}
              >
                Accept and register
              </a>
            </footer>
          </section>
        </div>
      )}
    </>
  );
};

export default MicrocertsFooter;
