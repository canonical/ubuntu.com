import { Field, useFormikContext } from "formik";
import { Col, Input, Row } from "@canonical/react-components";
import { FormValues } from "../../utils/types";

const AdditionalNotes = () => {
  const { values, setValues } = useFormikContext<FormValues>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, poNumber: e.target.value });
  };

  return (
    <Row>
      <Col size={12}>
        <Field
          name="additionalNotes"
          id="additionalNotes"
          as={Input}
          placeholder="Ex: Internal reference number"
          type="text"
          onChange={handleChange}
        />
      </Col>
    </Row>
  );
};

export default AdditionalNotes;
