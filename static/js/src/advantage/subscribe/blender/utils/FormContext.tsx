import React, { useState, createContext, useEffect } from "react";
import { Support, Product, Periods } from "./utils";

interface FormContext {
  support: Support;
  setSupport: React.Dispatch<React.SetStateAction<Support>>;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  product: Product | null;
  period: Periods;
  setPeriod: React.Dispatch<React.SetStateAction<Periods>>;
}

export const defaultValues: FormContext = {
  support: Support.unset,
  setSupport: () => {},
  quantity: 0,
  setQuantity: () => {},
  period: Periods.yearly,
  setPeriod: () => {},
  product: null,
};

export const FormContext = createContext<FormContext>(defaultValues);

interface FormProviderProps {
  initialSupport?: Support;
  initialPeriod?: Periods;
  children: React.ReactNode;
}

export const FormProvider = ({
  initialSupport = defaultValues.support,
  initialPeriod = defaultValues.period,
  children,
}: FormProviderProps) => {
  const [support, setSupport] = useState<Support>(initialSupport);
  const [quantity, setQuantity] = useState(1);
  const [period, setPeriod] = useState<Periods>(initialPeriod);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    setProduct(
      window.blenderProductList[`blender-support-${support}-${period}`] ?? null
    );
  }, [support, period]);

  return (
    <FormContext.Provider
      value={{
        support,
        setSupport,
        quantity,
        setQuantity,
        period,
        setPeriod,
        product,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
