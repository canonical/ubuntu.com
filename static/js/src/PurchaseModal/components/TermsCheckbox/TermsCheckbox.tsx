import React from "react";
import { Row, Col, CheckboxInput } from "@canonical/react-components";

type Props = {
  label: React.ReactNode;
  setTermsChecked: React.Dispatch<React.SetStateAction<boolean>>;
};

const TermsCheckbox = ({ label, setTermsChecked }: Props) => {
  return (
    <Row className="u-no-padding">
      <Col size={12}>
        <CheckboxInput
          name="TermsCheckbox"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setTermsChecked(e.target.checked);
          }}
          label={label}
        />
      </Col>
    </Row>
  );
};

export default TermsCheckbox;
