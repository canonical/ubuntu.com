import React from "react";

const FeatureSwitch = ({
  children,
  isDisabled = false,
  isChecked,
  handleOnChange,
}: {
  children: React.ReactNode;
  isDisabled?: boolean;
  isChecked: boolean;
  handleOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <label className="p-checkbox">
      <input
        disabled={isDisabled}
        type="checkbox"
        className="p-checkbox__input"
        checked={isChecked}
        onChange={handleOnChange}
      />
      <span className="p-checkbox__label">{children}</span>
    </label>
  );
};

export default FeatureSwitch;
