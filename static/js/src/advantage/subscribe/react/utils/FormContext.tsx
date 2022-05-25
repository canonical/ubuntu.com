import React, { useState, createContext, useEffect } from "react";
import {
  ProductTypes,
  LTSVersions,
  Support,
  Product,
  Features,
  Periods,
  isMonthlyAvailable,
} from "./utils";

interface FormContext {
  type: ProductTypes;
  setType: React.Dispatch<React.SetStateAction<ProductTypes>>;
  version: LTSVersions;
  setVersion: React.Dispatch<React.SetStateAction<LTSVersions>>;
  feature: Features;
  setFeature: React.Dispatch<React.SetStateAction<Features>>;
  support: Support;
  setSupport: React.Dispatch<React.SetStateAction<Support>>;
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  product: Product | null;
  period: Periods;
  setPeriod: React.Dispatch<React.SetStateAction<Periods>>;
}

const defaultValues: FormContext = {
  type: ProductTypes.physical,
  setType: () => {},
  version: LTSVersions.focal,
  setVersion: () => {},
  feature: Features.infra,
  setFeature: () => {},
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
  children: React.ReactNode;
}

export const FormProvider = ({ children }: FormProviderProps) => {
  const [type, setType] = useState<ProductTypes>(defaultValues.type);
  const [version, setVersion] = useState<LTSVersions>(defaultValues.version);
  const [feature, setFeature] = useState<Features>(defaultValues.feature);
  const [support, setSupport] = useState<Support>(defaultValues.support);
  const [quantity, setQuantity] = useState(1);
  const [period, setPeriod] = useState<Periods>(defaultValues.period);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (version === LTSVersions.trusty || version === LTSVersions.xenial) {
      if (support !== Support.unset) {
        setSupport(Support.essential);
      }
    }
  }, [version, support]);

  useEffect(() => {
    if (type === ProductTypes.desktop && feature === Features.apps) {
      setSupport(Support.essential);
    }

    if (type === ProductTypes.desktop && feature === Features.pro) {
      setFeature(defaultValues.feature);
    }
  }, [type, feature]);

  useEffect(() => {
    if (feature === Features.apps && type === ProductTypes.physical) {
      // @ts-expect-error The product ID for apps products is missing the type if it's physical ¯\_(ツ)_/¯
      setProduct(window.productList[`${feature}-${support}-${period}`]);
    } else {
      setProduct(window.productList[`${feature}-${support}-${type}-${period}`]);
    }
  }, [feature, type, support, period]);

  useEffect(() => {
    if (!isMonthlyAvailable(product)) {
      setPeriod(Periods.yearly);
    }
  }, [product]);

  return (
    <FormContext.Provider
      value={{
        type,
        setType,
        version,
        setVersion,
        feature,
        setFeature,
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
