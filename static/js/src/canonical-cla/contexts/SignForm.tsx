import React, { createContext } from "react";
import { QueryParamConfig, useQueryParam } from "use-query-params";
import { AgreementType, AgreementTypes } from "../utils/constants";

type SignFormContext = {
  step: "sign" | "success";
  agreementType?: AgreementType;

  changeStep: (step: SignFormContext["step"]) => void;
  changeAgreementType: (
    agreementType: SignFormContext["agreementType"],
  ) => void;
};

export const SignFormContext = createContext<SignFormContext | null>(null);

/**
 * Cast the value of the query param to an element of the given list of values.
 */
function ConstListParam<T extends string>(
  list: readonly T[] | T[],
  defaultValue: T | undefined = undefined,
): QueryParamConfig<string | undefined, T | undefined> {
  return {
    encode: (value) => value,
    decode: (value) =>
      list.includes(value as T) ? (value as T) : defaultValue,
  };
}

type Props = {
  children: React.ReactNode;
};

export const SignFormProvider = ({ children }: Props) => {
  const [step, setStep] = useQueryParam(
    "step",
    ConstListParam(["sign", "success"], "sign"),
  );
  const [agreementType, setAgreementType] = useQueryParam(
    "type",
    ConstListParam(AgreementTypes),
  );

  const changeStep = (step: SignFormContext["step"]) => {
    if (step === "sign") {
      setAgreementType(undefined);
    }
    setStep(step);
  };

  return (
    <SignFormContext.Provider
      value={{
        step: step as SignFormContext["step"],
        agreementType: agreementType as AgreementType,

        changeStep,
        changeAgreementType: setAgreementType,
      }}
    >
      {children}
    </SignFormContext.Provider>
  );
};

export const useSignForm = () => {
  const context = React.useContext(SignFormContext);
  if (context === null) {
    throw new Error("useSignForm must be used within a SignFormProvider");
  }
  return context;
};
