import React from "react";
import { RadioInput } from "@canonical/react-components";
import classNames from "classnames";

type Props<T> = {
  name: string;
  value: T;
  selectedValue: T;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  radioLabel?: string;
  className?: string;
  dataTestid?: string;
  children?: React.ReactNode;
};

const RadioCard = <T extends string>({
  name,
  value,
  selectedValue,
  handleChange,
  disabled = false,
  radioLabel,
  className,
  dataTestid,
  children,
}: Props<T>) => {
  const checked = selectedValue === value;

  return (
    <div
      className={classNames(className, {
        "p-card--radio": !className,
        "is-selected": checked,
        "u-disable": disabled,
      })}
      data-testid={dataTestid}
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
