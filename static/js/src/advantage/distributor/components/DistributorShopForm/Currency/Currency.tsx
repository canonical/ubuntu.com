import React, { useContext } from "react";
import classNames from "classnames";
import { Row, Col, Select } from "@canonical/react-components";
import { FormContext } from "advantage/distributor/utils/FormContext";
import {
  Currencies,
  DISTRIBUTOR_SELECTOR_KEYS,
} from "advantage/distributor/utils/utils";

const Currency = () => {
  const { currency, setCurrency } = useContext(FormContext);

  const handleCurrencyChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setCurrency(event.target.value as Currencies);
    localStorage.setItem(
      DISTRIBUTOR_SELECTOR_KEYS.CURRENCY,
      JSON.stringify(event.target.value as Currencies),
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
            value={currency}
            name="distributor-currency"
            options={[
              {
                label: "USD",
                value: Currencies.usd,
              },
              {
                label: "GBP",
                value: Currencies.gbp,
              },
              {
                label: "EUR",
                value: Currencies.eur,
              },
            ]}
            onChange={handleCurrencyChange}
            className="distributor-select"
          />
        </Col>
      </Row>
    </div>
  );
};

export default Currency;
