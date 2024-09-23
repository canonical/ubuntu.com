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
  getLaunchpadProfile,
  loginWithLaunchpad,
  logoutFromLaunchpad,
} from "../utils/api";

/**
 * Shows a login with Launchpad if there is no Launchpad session,
 * otherwise show a list of emails from the user's Launchpad account along with a logout button.
 */
const LaunchpadEmailSelector = () => {
  const validateStoredEmail =
    usePersistedForm<IndividualSignForm>("individual-form")[3];
  const launchpadLoginError = new URLSearchParams(window.location.search).get(
    "launchpad_error",
  );
  const launchpadProfile = useQuery({
    queryKey: ["launchpadProfile"],
    queryFn: getLaunchpadProfile,
  });

  const notLoggedIn = !launchpadProfile.data;
  const onLinkClick: MouseEventHandler<HTMLButtonElement> = (_e) => {
    // add #choose-emails to scroll to the email selection section once the user is redirected back
    window.location.hash = "choose-emails";
  };
  const onLogoutClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    validateStoredEmail((formValues) => {
      formValues.launchpad_email = undefined;
      return formValues;
    });
    onLinkClick(e);
  };

  useEffect(() => {
    if (launchpadProfile.data) {
      validateStoredEmail((formValues) => {
        const selectedLaunchpadEmail = formValues.launchpad_email;
        if (
          selectedLaunchpadEmail &&
          !launchpadProfile.data!.emails.includes(selectedLaunchpadEmail)
        ) {
          formValues.launchpad_email = undefined;
        }
        return formValues;
      });
    }
  }, [launchpadProfile.data]);

  return (
    <>
      {notLoggedIn || launchpadProfile.isLoading ? (
        <div
          className={classNames("u-align--center u-align-text--center", {
            "is-error": !!launchpadLoginError,
          })}
        >
          <Button
            hasIcon
            element="a"
            onClick={onLinkClick}
            href={loginWithLaunchpad()}
            disabled={launchpadProfile.isLoading}
          >
            <>
              <Icon name="launchpad" />
              <span>{launchpadProfile.isLoading ? "Loading..." : "Login"}</span>
            </>
          </Button>
          {launchpadLoginError && (
            <p className="p-form-validation__message">{launchpadLoginError}</p>
          )}
        </div>
      ) : (
        <div>
          <FormikField
            component={Select}
            name="launchpad_email"
            labelClassName="row"
            defaultValue=""
            label={
              <div className="col-4">
                <span>Select Launchpad email </span>
                <Button
                  hasIcon
                  dense
                  element="a"
                  onClick={onLogoutClick}
                  href={logoutFromLaunchpad()}
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
                label: "Choose a Launchpad email",
                value: "",
              },
              ...(launchpadProfile.data?.emails.map((email) => ({
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

export default LaunchpadEmailSelector;
