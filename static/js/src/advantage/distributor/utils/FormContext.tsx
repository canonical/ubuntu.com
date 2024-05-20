import React, { createContext, useEffect, useState } from "react";
import {
  DistributorProductTypes as ProductTypes,
  Support,
  SLA,
  Durations,
  SubscriptionItem,
  Currencies,
  getProductName,
  ValidProductName,
} from "./utils";

interface FormContext {
  productType: ProductTypes;
  setProductType: React.Dispatch<React.SetStateAction<ProductTypes>>;
  subscriptionList: SubscriptionItem[];
  setSubscriptionList: React.Dispatch<React.SetStateAction<SubscriptionItem[]>>;
  duration: Durations;
  setDuration: React.Dispatch<React.SetStateAction<Durations>>;
  currency: Currencies;
  setCurrency: React.Dispatch<React.SetStateAction<Currencies>>;
  product: ValidProductName[] | null;
}

export const defaultValues: FormContext = {
  productType: ProductTypes.physical,
  setProductType: () => {},
  subscriptionList: [],
  setSubscriptionList: () => {},
  duration: Durations.one,
  setDuration: () => {},
  currency: Currencies.usd,
  setCurrency: () => {},
  product: null,
};

export const FormContext = createContext<FormContext>(defaultValues);

interface FormProviderProps {
  initialSubscriptionList?: SubscriptionItem[];
  initialType?: ProductTypes;
  initialDuration?: Durations;
  initialCurrency?: Currencies;
  children: React.ReactNode;
}

export const FormProvider = ({
  initialSubscriptionList = defaultValues.subscriptionList,
  initialType = defaultValues.productType,
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
  const localDuration = localStorage.getItem("distributor-selector-duration");
  const localCurrency = localStorage.getItem("distributor-selector-currency");

  const [subscriptionList, setSubscriptionList] = useState<SubscriptionItem[]>(
    localSubscriptionList
      ? JSON.parse(localSubscriptionList)
      : initialSubscriptionList
  );
  const [productType, setProductType] = useState<ProductTypes>(
    localProductType ? JSON.parse(localProductType) : initialType
  );
  const [duration, setDuration] = useState<Durations>(
    localDuration ? JSON.parse(localDuration) : initialDuration
  );
  const [currency, setCurrency] = useState<Currencies>(
    localCurrency ? JSON.parse(localCurrency) : initialCurrency
  );
  const [product, setProduct] = useState<ValidProductName[] | null>(null);

  useEffect(() => {
    const product = subscriptionList.map((subscription) =>
      getProductName(
        subscription.type as ProductTypes,
        subscription.support as Support,
        subscription.sla as SLA
      )
    );
    setProduct(product);
  }, [productType, duration, currency, subscriptionList]);

  return (
    <FormContext.Provider
      value={{
        subscriptionList,
        setSubscriptionList,
        productType,
        setProductType,
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
