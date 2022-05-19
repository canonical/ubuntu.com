import React, { useState, createContext } from "react";
import { ProductTypes, LTSVersions, Support } from "./utils";

interface FormContext {
  type: ProductTypes;
  setType: React.Dispatch<React.SetStateAction<ProductTypes>>;
  version: LTSVersions;
  setVersion: React.Dispatch<React.SetStateAction<LTSVersions>>;
  support: Support;
  setSupport: React.Dispatch<React.SetStateAction<Support>>;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
}

const defaultValues: FormContext = {
  type: ProductTypes.physical,
  setType: () => {},
  version: LTSVersions.bionic,
  setVersion: () => {},
  support: Support.essential,
  setSupport: () => {},
  quantity: 1,
  setQuantity: () => {},
};

export const FormContext = createContext<FormContext>(defaultValues);

interface FormProviderProps {
  children: React.ReactNode;
}

export const FormProvider = ({ children }: FormProviderProps) => {
  const [type, setType] = useState<ProductTypes>(defaultValues.type);
  const [version, setVersion] = useState<LTSVersions>(defaultValues.version);
  const [support, setSupport] = useState<Support>(defaultValues.support);
  const [quantity, setQuantity] = useState(1);

  return (
    <FormContext.Provider
      value={{
        type,
        setType,
        version,
        setVersion,
        support,
        setSupport,
        quantity,
        setQuantity,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
