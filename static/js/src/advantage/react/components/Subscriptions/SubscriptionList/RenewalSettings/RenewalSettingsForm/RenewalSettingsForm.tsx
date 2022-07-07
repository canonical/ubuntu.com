import React, { ReactNode } from "react";

import { ActionButton, Button } from "@canonical/react-components";
import { useFormikContext } from "formik";

type Props = {
  onCloseMenu: () => void;
  loading?: boolean;
  success?: boolean;
  children?: ReactNode;
};

export const RenewalSettingsForm = ({
  loading,
  onCloseMenu,
  success,
  children,
}: Props): JSX.Element => {
  const { dirty, handleSubmit, isValid } = useFormikContext();
  return (
    <form onSubmit={handleSubmit}>
      {children}
      <p>
        <small>
          * Taxes and/or balance credits are not included in this price and may
          apply at renewal time.
        </small>
      </p>
      <div className="u-align--right">
        <Button
          appearance="neutral"
          className="u-no-margin--bottom"
          data-test="cancel-button"
          onClick={onCloseMenu}
          type="button"
        >
          Cancel changes
        </Button>
        <ActionButton
          appearance="positive"
          className="u-no-margin--bottom"
          disabled={!dirty || !isValid}
          loading={loading}
          success={success}
          type="submit"
        >
          Save changes
        </ActionButton>
      </div>
    </form>
  );
};

export default RenewalSettingsForm;
