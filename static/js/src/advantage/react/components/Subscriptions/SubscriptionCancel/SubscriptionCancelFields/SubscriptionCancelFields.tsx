import { Col, Row } from "@canonical/react-components";
import React, { useEffect } from "react";
import { useFormikContext } from "formik";
import FormikField from "../../../FormikField";

type Props = {
  setIsValid: (isValid: boolean) => void;
  isTrial?: boolean;
};

export type SubscriptionCancelValues = {
  cancel: string;
};

const SubscriptionCancelFields = ({ setIsValid, isTrial }: Props) => {
  const { handleSubmit, isValid } = useFormikContext();

  useEffect(() => {
    setIsValid(isValid);
  }, [isValid]);

  return (
    <form onSubmit={handleSubmit}>
      {isTrial ? (
        <p>If you cancel this trial:</p>
      ) : (
        <p>If you cancel this subscription:</p>
      )}
      <ul>
        <li>No additional charge will be incurred.</li>
        <li>
          The <strong>10 machines</strong> will stop receiving updates and
          services at the end of the billing period.
        </li>
        <li>
          Additional subscriptions purchased directly with Canonical will not be affected.
        </li>
      </ul>
      <p>
        Want help or advice? <a href="/contact-us">Chat with us</a>.
      </p>
      <Row className="u-no-padding--left">
        <Col size={8}>
          <FormikField
            label={
              <>
                Please type <strong>cancel</strong> to confirm.
              </>
            }
            name="cancel"
            type="text"
          />
        </Col>
      </Row>
    </form>
  );
};

export default SubscriptionCancelFields;
