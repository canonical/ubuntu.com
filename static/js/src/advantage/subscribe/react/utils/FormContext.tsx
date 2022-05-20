import React, { useState, createContext, useEffect } from "react";
import { ProductTypes, LTSVersions, Support, Product } from "./utils";

const products = {
  [ProductTypes.physical]: {
    [Support.essential]: window.productList["uai-essential-physical"],
    [Support.standard]: window.productList["uai-standard-physical"],
    [Support.advanced]: window.productList["uai-advanced-physical"],
  },
  [ProductTypes.virtual]: {
    [Support.essential]: window.productList["uai-essential-virtual"],
    [Support.standard]: window.productList["uai-standard-virtual"],
    [Support.advanced]: window.productList["uai-advanced-virtual"],
  },
  [ProductTypes.desktop]: {
    [Support.essential]: window.productList["uai-essential-desktop"],
    [Support.standard]: window.productList["uai-standard-desktop"],
    [Support.advanced]: window.productList["uai-advanced-desktop"],
  },
  [ProductTypes.aws]: {
    [Support.essential]: null,
    [Support.standard]: null,
    [Support.advanced]: null,
  },
  [ProductTypes.azure]: {
    [Support.essential]: null,
    [Support.standard]: null,
    [Support.advanced]: null,
  },
  [ProductTypes.gcp]: {
    [Support.essential]: null,
    [Support.standard]: null,
    [Support.advanced]: null,
  },
};

interface FormContext {
  type: ProductTypes;
  setType: React.Dispatch<React.SetStateAction<ProductTypes>>;
  version: LTSVersions;
  setVersion: React.Dispatch<React.SetStateAction<LTSVersions>>;
  support: Support;
  setSupport: React.Dispatch<React.SetStateAction<Support>>;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  product: Product | null;
}

const defaultValues: FormContext = {
  type: ProductTypes.physical,
  setType: () => {},
  version: LTSVersions.focal,
  setVersion: () => {},
  support: Support.essential,
  setSupport: () => {},
  quantity: 0,
  setQuantity: () => {},
  product: null,
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
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    setProduct(products[type][support]);
  }, [type, support]);

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
        product,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
