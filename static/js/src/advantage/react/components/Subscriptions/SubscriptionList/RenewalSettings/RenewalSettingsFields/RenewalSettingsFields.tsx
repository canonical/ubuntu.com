import { ActionButton, Button } from "@canonical/react-components";
import React from "react";
import { useFormikContext } from "formik";
import FormikField from "advantage/react/components/FormikField";

type Props = {
  setMenuOpen: (menuOpen: boolean) => void;
};

const RenewalSettingsFields = ({ setMenuOpen }: Props): JSX.Element => {
  const { handleSubmit } = useFormikContext();
  return (
    <form onSubmit={handleSubmit}>
      <FormikField
        label="Auto-renewal"
        labelClassName="u-no-margin--bottom"
        name="should_auto_renew"
        type="checkbox"
        wrapperClassName="u-sv4"
      />
      <div className="u-align--right">
        <Button
          appearance="neutral"
          className="u-no-margin--bottom"
          data-test="cancel-button"
          onClick={() => setMenuOpen(false)}
          type="button"
        >
          Cancel changes
        </Button>
        <ActionButton appearance="positive" className="u-no-margin--bottom">
          Save changes
        </ActionButton>
      </div>
    </form>
  );
};

export default RenewalSettingsFields;
