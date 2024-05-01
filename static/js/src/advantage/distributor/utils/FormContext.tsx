import React, { createContext, useState } from "react";
import {
  LTSVersions,
  Product,
  DistributorProductTypes as ProductTypes,
  Durations,
  SLA,
  Support,
  SubscriptionList,
  Currencies,
} from "./utils";

interface FormContext {
  productType: ProductTypes;
  setProductType: React.Dispatch<React.SetStateAction<ProductTypes>>;
  subscriptionList: SubscriptionList[];
  setSubscriptionList: React.Dispatch<React.SetStateAction<SubscriptionList[]>>;
  version: LTSVersions;
  setVersion: React.Dispatch<React.SetStateAction<LTSVersions>>;
  support: Support;
  setSLA: React.Dispatch<React.SetStateAction<SLA>>;
  sla: SLA;
  setSupport: React.Dispatch<React.SetStateAction<Support>>;
  quantity: number | string;
  setQuantity: React.Dispatch<React.SetStateAction<number | string>>;
  duration: Durations;
  setDuration: React.Dispatch<React.SetStateAction<Durations>>;
  currency: Currencies;
  setCurrency: React.Dispatch<React.SetStateAction<Currencies>>;
  product: Product | null;
}

export const defaultValues: FormContext = {
  productType: ProductTypes.physical,
  setProductType: () => {},
  subscriptionList: [],
  setSubscriptionList: () => {},
  version: LTSVersions.focal,
  setVersion: () => {},
  sla: SLA.none,
  setSLA: () => {},
  support: Support.none,
  setSupport: () => {},
  quantity: 1,
  setQuantity: () => {},
  duration: Durations.one,
  setDuration: () => {},
  currency: Currencies.usd,
  setCurrency: () => {},
  product: null,
};

export const FormContext = createContext<FormContext>(defaultValues);

interface FormProviderProps {
  initialSubscriptionList?: SubscriptionList[];
  initialType?: ProductTypes;
  initialVersion?: LTSVersions;
  initialSLA?: SLA;
  initialSupport?: Support;
  initialQuantity?: number | string;
  initialDuration?: Durations;
  initialCurrency?: Currencies;
  children: React.ReactNode;
}

export const FormProvider = ({
  initialSubscriptionList = defaultValues.subscriptionList,
  initialType = defaultValues.productType,
  initialVersion = defaultValues.version,
  initialSLA = defaultValues.sla,
  initialSupport = defaultValues.support,
  initialQuantity = defaultValues.quantity,
  initialDuration = defaultValues.duration,
  initialCurrency = defaultValues.currency,
  children,
}: FormProviderProps) => {
  const localSubscriptionList = localStorage.getItem(
    "distributor-selector-subscriptionList"
  );
  const localProductType = localStorage.getItem(
    "distributor-selector-productType"
  );
  const localVersion = localStorage.getItem("distributor-selector-version");
  const localQuantity = localStorage.getItem("distributor-selector-quantity");
  const localSupport = localStorage.getItem("distributor-selector-support");
  const localSLA = localStorage.getItem("distributor-selector-sla");
  const localDuration = localStorage.getItem("distributor-selector-duration");
  const localCurrency = localStorage.getItem("distributor-selector-currency");

  const [subscriptionList, setSubscriptionList] = useState<SubscriptionList[]>(
    localSubscriptionList
      ? JSON.parse(localSubscriptionList)
      : initialSubscriptionList
  );
  const [productType, setProductType] = useState<ProductTypes>(
    localProductType ? JSON.parse(localProductType) : initialType
  );
  const [version, setVersion] = useState<LTSVersions>(
    localVersion ? JSON.parse(localVersion) : initialVersion
  );
  const [sla, setSLA] = useState<SLA>(
    localSLA ? JSON.parse(localSLA) : initialSLA
  );
  const [support, setSupport] = useState<Support>(
    localSupport ? JSON.parse(localSupport) : initialSupport
  );
  const [quantity, setQuantity] = useState(
    localQuantity ? JSON.parse(localQuantity) : initialQuantity
  );
  const [duration, setDuration] = useState<Durations>(
    localDuration ? JSON.parse(localDuration) : initialDuration
  );
  const [currency, setCurrency] = useState<Currencies>(
    localCurrency ? JSON.parse(localCurrency) : initialCurrency
  );
  const [product, setProduct] = useState<Product | null>(null);

  return (
    <FormContext.Provider
      value={{
        subscriptionList,
        setSubscriptionList,
        productType,
        setProductType,
        version,
        setVersion,
        sla,
        setSLA,
        support,
        setSupport,
        quantity,
        setQuantity,
        duration,
        setDuration,
        product,
        currency,
        setCurrency,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
