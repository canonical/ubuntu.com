import {
  Button,
  FormikField,
  Icon,
  ICONS,
  Select,
} from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import usePersistedForm from "canonical-cla/hooks/usePersistedForm";
import { IndividualSignForm } from "canonical-cla/utils/constants";
import classNames from "classnames";
import { MouseEventHandler, useEffect } from "react";
import {
  getGithubProfile,
  loginWithGithub,
  logoutFromGithub,
} from "../utils/api";

/**
 * Shows a login with GitHub if there is no gitHub session,
 * otherwise show a list of emails from the user's GitHub account along with a logout button.
 */
const GithubEmailSelector = () => {
  const validateStoredEmail =
    usePersistedForm<IndividualSignForm>("individual-form")[3];
  const githubLoginError = new URLSearchParams(window.location.search).get(
    "github_error",
  );
  const githubProfile = useQuery({
    queryKey: ["githubProfile"],
    queryFn: getGithubProfile,
  });

  const notLoggedIn = !githubProfile.data;
  const onLinkClick: MouseEventHandler<HTMLButtonElement> = (_e) => {
    // add #choose-emails to scroll to the email selection section once the user is redirected back
    window.location.hash = "choose-emails";
  };
  const onLogoutClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    validateStoredEmail((formValues) => {
      formValues.github_email = undefined;
      return formValues;
    });
    onLinkClick(e);
  };
  useEffect(() => {
    if (githubProfile.data) {
      validateStoredEmail((formValues) => {
        const selectedGitHubEmail = formValues.github_email;
        if (
          selectedGitHubEmail &&
          !githubProfile.data!.emails.includes(selectedGitHubEmail)
        ) {
          formValues.github_email = undefined;
        }
        return formValues;
      });
    }
  }, [githubProfile.data]);

  return (
    <>
      {notLoggedIn || githubProfile.isLoading ? (
        <div
          className={classNames("u-align--center u-align-text--center", {
            "is-error": !!githubLoginError,
          })}
        >
          {" "}
          <Button
            hasIcon
            element="a"
            onClick={onLinkClick}
            href={loginWithGithub()}
            disabled={githubProfile.isLoading}
          >
            <>
              <Icon name={ICONS.github} className="u-float-left" />
              <span>{githubProfile.isLoading ? "Loading..." : "Login"}</span>
            </>
          </Button>
          {githubLoginError && (
            <p className="p-form-validation__message">{githubLoginError}</p>
          )}
        </div>
      ) : (
        <div>
          <FormikField
            component={Select}
            labelClassName="row"
            name="github_email"
            defaultValue=""
            label={
              <div className="col-4">
                <span>Select GitHub email </span>
                <Button
                  hasIcon
                  dense
                  element="a"
                  onClick={onLogoutClick}
                  href={logoutFromGithub()}
                  className="u-float-right"
                >
                  <>
                    <Icon name={ICONS.close} />
                    <span>Logout</span>
                  </>
                </Button>
              </div>
            }
            options={[
              {
                label: "Choose a GitHub email",
                value: "",
              },
              ...(githubProfile.data?.emails.map((email) => ({
                label: email,
                value: email,
              })) || []),
            ]}
          />
        </div>
      )}
    </>
  );
};

export default GithubEmailSelector;
