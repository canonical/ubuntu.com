import React from "react";
import PropTypes from "prop-types";
import { useFormikContext } from "formik";
import { ActionButton } from "@canonical/react-components";
import useStripeCustomerInfo from "../../APICalls/useStripeCustomerInfo";

const PaymentMethodFormButton = ({ isCardValid }) => {
  const { isSubmitting, dirty, isValid, submitForm } = useFormikContext();
  const { data: userInfo } = useStripeCustomerInfo();

  return (
    <ActionButton
      disabled={(!userInfo && !dirty) || !isValid || !isCardValid}
      appearance="positive"
      className="col-small-2 col-medium-2 col-3 u-no-margin"
      style={{ textAlign: "center" }}
      onClick={submitForm}
      loading={isSubmitting}
    >
      Continue
    </ActionButton>
  );
};

PaymentMethodFormButton.propTypes = {
  isCardValid: PropTypes.bool.isRequired,
};

export default PaymentMethodFormButton;
