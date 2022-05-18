import React from "react";

type Props<T> = {
  name: string;
  value: T;
  selectedValue: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
};

const RadioCard = <T extends string>({
  name,
  value,
  selectedValue,
  handleChange,
  children,
}: Props<T>) => (
  <div
    className={`p-card--radio ${
      selectedValue === value ? "is-selected" : null
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
        checked={selectedValue === value}
        onChange={handleChange}
      />
      <span className="p-radio__label" id={`${name}-label`}>
        {children}
      </span>
    </label>
  </div>
);

export default RadioCard;
