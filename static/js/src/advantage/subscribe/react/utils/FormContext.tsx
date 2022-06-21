import React, { useState, createContext, useEffect } from "react";
import {
  ProductTypes,
  LTSVersions,
  Support,
  Product,
  Features,
  Periods,
  isMonthlyAvailable,
  shouldShowApps,
} from "./utils";

interface FormContext {
  productType: ProductTypes;
  setProductType: React.Dispatch<React.SetStateAction<ProductTypes>>;
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

export const defaultValues: FormContext = {
  productType: ProductTypes.physical,
  setProductType: () => {},
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
  initialType?: ProductTypes;
  initialVersion?: LTSVersions;
  initialFeature?: Features;
  initialSupport?: Support;
  initialPeriod?: Periods;
  children: React.ReactNode;
}

export const FormProvider = ({
  initialType = defaultValues.productType,
  initialVersion = defaultValues.version,
  initialFeature = defaultValues.feature,
  initialSupport = defaultValues.support,
  initialPeriod = defaultValues.period,
  children,
}: FormProviderProps) => {
  const [productType, setProductType] = useState<ProductTypes>(initialType);
  const [version, setVersion] = useState<LTSVersions>(initialVersion);
  const [feature, setFeature] = useState<Features>(initialFeature);
  const [support, setSupport] = useState<Support>(initialSupport);
  const [quantity, setQuantity] = useState(1);
  const [period, setPeriod] = useState<Periods>(initialPeriod);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (version === LTSVersions.trusty || version === LTSVersions.xenial) {
      if (support !== Support.unset) {
        setSupport(Support.essential);
      }
    }
  }, [version, support]);

  useEffect(() => {
    if (productType === ProductTypes.desktop && feature === Features.apps) {
      setSupport(Support.essential);
    }

    if (productType === ProductTypes.desktop && feature === Features.pro) {
      setFeature(defaultValues.feature);
    }
  }, [productType, feature]);

  useEffect(() => {
    if (feature === Features.apps && productType === ProductTypes.physical) {
      // @ts-expect-error The product ID for apps products is missing the type if it's physical ¯\_(ツ)_/¯
      setProduct(window.productList[`${feature}-${support}-${period}`] ?? null);
    } else {
      setProduct(
        window.productList[`${feature}-${support}-${productType}-${period}`] ??
          null
      );
    }
  }, [feature, productType, support, period]);

  useEffect(() => {
    if (!isMonthlyAvailable(product)) {
      setPeriod(Periods.yearly);
    }
    if (!shouldShowApps()) {
      setFeature(Features.infra);
    }
  }, [product]);

  return (
    <FormContext.Provider
      value={{
        productType,
        setProductType,
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
