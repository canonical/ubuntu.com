import { RadioInput } from "@canonical/react-components";
import React from "react";

type Props<T> = {
  name: string;
  value: T;
  selectedValue: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  radioLabel?: string;
  children?: React.ReactNode;
};

const RadioCard = <T extends string>({
  name,
  value,
  selectedValue,
  handleChange,
  disabled = false,
  radioLabel,
  children,
}: Props<T>) => {
  const checked = selectedValue === value;

  return (
    <div
      className={`p-card--radio ${checked ? "is-selected" : ""} ${
        disabled ? "u-disable" : ""
      }`}
    >
      <label className="p-radio u-align-text--center">
        <input
          className="p-radio__input"
          autoComplete="off"
          type="radio"
          aria-labelledby={`${name}-label`}
          name={name}
          value={value}
          checked={checked}
          onChange={handleChange}
        />
        <span className="p-radio__label" id={`${name}-label`}>
          {children}
          {radioLabel ? (
            <RadioInput label={radioLabel} checked={checked} />
          ) : null}
        </span>
      </label>
    </div>
  );
};

export default RadioCard;
