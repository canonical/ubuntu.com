import { ActionButton, Button } from "@canonical/react-components";
import React from "react";
import { useFormikContext } from "formik";
import FormikField from "advantage/react/components/FormikField";

type Props = {
  onCloseMenu: () => void;
  loading?: boolean;
  success?: boolean;
};

const RenewalSettingsFields = ({
  loading,
  onCloseMenu,
  success,
}: Props): JSX.Element => {
  const { dirty, handleSubmit, isValid } = useFormikContext();
  return (
    <form onSubmit={handleSubmit}>
      <FormikField
        label="Auto-renewal"
        labelClassName="u-no-margin--bottom"
        name="shouldAutoRenew"
        type="checkbox"
        wrapperClassName="u-sv4"
      />
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

export default RenewalSettingsFields;
