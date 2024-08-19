import React, { useContext } from "react";
import classNames from "classnames";
import { Col, Select, Row } from "@canonical/react-components";
import { FormContext } from "advantage/distributor/utils/FormContext";
import { Durations } from "advantage/distributor/utils/utils";

const Duration = () => {
  const { duration, setDuration } = useContext(FormContext);

  const handleDurationChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setDuration(Number(event.target.value) as Durations);
    localStorage.setItem(
      "distributor-selector-duration",
      JSON.stringify(Number(event.target.value) as Durations),
    );
  };

  return (
    <div
      className={classNames({
        row: true,
      })}
      data-testid="wrapper"
    >
      <Row>
        <Col size={1}>
          <Select
            name="distributor-duration"
            value={duration}
            options={[
              {
                label: "1 year",
                value: Durations.one,
              },
              {
                label: "2 years",
                value: Durations.two,
              },
              {
                label: "3 years",
                value: Durations.three,
              },
            ]}
            onChange={handleDurationChange}
            className="distributor-select"
          />
        </Col>
      </Row>
    </div>
  );
};

export default Duration;
