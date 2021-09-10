import React from "react";
import { RadioInput, Row, Col } from "@canonical/react-components";
import { formatter } from "../../renderers/form-renderer";
import { add, format } from "date-fns";
import usePreview from "../APICalls/usePreview";

const DATE_FORMAT = "dd MMMM yyyy";

type Props = {
  isUsingFreeTrial: boolean;
  setIsUsingFreeTrial: React.Dispatch<React.SetStateAction<boolean>>;
};

const FreeTrialRadio = ({ isUsingFreeTrial, setIsUsingFreeTrial }: Props) => {
  const { data: preview } = usePreview();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUsingFreeTrial(e.target.value === "useFreeTrial");
  };

  return (
    <Row>
      <Col size={11} emptyLarge={2}>
        {isUsingFreeTrial && (
          <>
            <p>
              <strong>Your free trial ends: </strong>
              {format(
                add(new Date(), {
                  months: 1,
                }),
                DATE_FORMAT
              )}{" "}
              after which time you will be charged{" "}
              {formatter.format(preview?.total / 100)}
            </p>
            <p>
              You can cancel your subscription before your free trial ends in
              your UA Dashboard
            </p>
          </>
        )}
        <div
          className="p-form p-form--inline"
          style={{ marginBottom: "1.1rem" }}
          role="group"
          onChange={handleChange}
        >
          <RadioInput
            name="freeTrial"
            value="useFreeTrial"
            label="Use free trial month"
            defaultChecked={true}
          />
          <RadioInput
            name="freeTrial"
            value="payNow"
            label="Pay now"
            defaultChecked={false}
          />
        </div>
      </Col>
    </Row>
  );
};

export default FreeTrialRadio;
