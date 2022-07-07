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
    <label className="p-subscription-switch">
      <input
        disabled={isDisabled}
        type="checkbox"
        className="p-switch__input"
        checked={isChecked}
        onChange={handleOnChange}
      />
      <span className="p-switch__slider p-subscription-switch__slider"></span>
      {children}
    </label>
  );
};

export default FeatureSwitch;
