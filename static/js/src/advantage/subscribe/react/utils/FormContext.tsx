import React, { createContext, useEffect, useState } from "react";
import {
  Features,
  getProduct,
  IoTDevices,
  isMonthlyAvailable,
  LTSVersions,
  Periods,
  Product,
  ProductTypes,
  ProductUsers,
  SLA,
  Support,
} from "./utils";
import { PRO_SELECTOR_KEYS } from "advantage/distributor/utils/utils";

interface FormContext {
  productUser: ProductUsers;
  setProductUser: React.Dispatch<React.SetStateAction<ProductUsers>>;
  productType: ProductTypes;
  setProductType: React.Dispatch<React.SetStateAction<ProductTypes>>;
  version: LTSVersions;
  setVersion: React.Dispatch<React.SetStateAction<LTSVersions>>;
  feature: Features;
  setFeature: React.Dispatch<React.SetStateAction<Features>>;
  support: Support;
  setSLA: React.Dispatch<React.SetStateAction<SLA>>;
  sla: SLA;
  setSupport: React.Dispatch<React.SetStateAction<Support>>;
  quantity: number | string;
  setQuantity: React.Dispatch<React.SetStateAction<number | string>>;
  product: Product | null;
  period: Periods;
  setPeriod: React.Dispatch<React.SetStateAction<Periods>>;
  iotDevice: IoTDevices;
  setIoTDevice: React.Dispatch<React.SetStateAction<IoTDevices>>;
}

export const defaultValues: FormContext = {
  productUser: ProductUsers.organisation,
  setProductUser: () => {},
  productType: ProductTypes.physical,
  setProductType: () => {},
  version: LTSVersions.focal,
  setVersion: () => {},
  feature: Features.pro,
  setFeature: () => {},
  sla: SLA.none,
  setSLA: () => {},
  support: Support.none,
  setSupport: () => {},
  quantity: 1,
  setQuantity: () => {},
  period: Periods.yearly,
  setPeriod: () => {},
  product: null,
  iotDevice: IoTDevices.classic,
  setIoTDevice: () => {},
};

export const FormContext = createContext<FormContext>(defaultValues);

interface FormProviderProps {
  initialUser?: ProductUsers;
  initialType?: ProductTypes;
  initialVersion?: LTSVersions;
  initialFeature?: Features;
  initialSLA?: SLA;
  initialSupport?: Support;
  initialQuantity?: number | string;
  initialPeriod?: Periods;
  initialIoTDevice?: IoTDevices;
  children: React.ReactNode;
}

export const FormProvider = ({
  initialUser = defaultValues.productUser,
  initialType = defaultValues.productType,
  initialVersion = defaultValues.version,
  initialFeature = defaultValues.feature,
  initialSLA = defaultValues.sla,
  initialSupport = defaultValues.support,
  initialQuantity = defaultValues.quantity,
  initialPeriod = defaultValues.period,
  initialIoTDevice = defaultValues.iotDevice,
  children,
}: FormProviderProps) => {
  const localProductUser = localStorage.getItem(PRO_SELECTOR_KEYS.PRODUCT_USER);
  const localProductType = localStorage.getItem(PRO_SELECTOR_KEYS.PRODUCT_TYPE);
  const localVersion = localStorage.getItem(PRO_SELECTOR_KEYS.VERSION);
  const localQuantity = localStorage.getItem(PRO_SELECTOR_KEYS.QUANTITY);
  const localFeature = localStorage.getItem(PRO_SELECTOR_KEYS.FEATURE);
  const localSupport = localStorage.getItem(PRO_SELECTOR_KEYS.SUPPORT);
  const localSLA = localStorage.getItem(PRO_SELECTOR_KEYS.SLA);
  const localPeriod = localStorage.getItem(PRO_SELECTOR_KEYS.PERIOD);
  const localIoTDevice = localStorage.getItem(PRO_SELECTOR_KEYS.IOT_DEVICE);

  const [productUser, setProductUser] = useState<ProductUsers>(
    localProductUser ? JSON.parse(localProductUser) : initialUser,
  );
  const [productType, setProductType] = useState<ProductTypes>(
    localProductType ? JSON.parse(localProductType) : initialType,
  );
  const [version, setVersion] = useState<LTSVersions>(
    localVersion ? JSON.parse(localVersion) : initialVersion,
  );
  const [feature, setFeature] = useState<Features>(
    localFeature ? JSON.parse(localFeature) : initialFeature,
  );
  const [sla, setSLA] = useState<SLA>(
    localSLA ? JSON.parse(localSLA) : initialSLA,
  );
  const [support, setSupport] = useState<Support>(
    localSupport ? JSON.parse(localSupport) : initialSupport,
  );
  const [quantity, setQuantity] = useState(
    localQuantity ? JSON.parse(localQuantity) : initialQuantity,
  );
  const [period, setPeriod] = useState<Periods>(
    localPeriod ? JSON.parse(localPeriod) : initialPeriod,
  );
  const [product, setProduct] = useState<Product | null>(null);
  const [iotDevice, setIoTDevice] = useState<IoTDevices>(
    localIoTDevice ? JSON.parse(localIoTDevice) : initialIoTDevice,
  );

  useEffect(() => {
    if (support === Support.none) {
      setSLA(SLA.none);
    }
    if (support !== Support.none && sla === SLA.none) {
      setSLA(SLA.weekday);
    }
  }, [support, sla]);

  useEffect(() => {
    if (version === LTSVersions.xenial) {
      setSupport(Support.none);
    }
  }, [version, support]);

  useEffect(() => {
    if (feature === Features.infra) {
      if (support === Support.full) {
        setSupport(Support.none);
      }
    }
  }, [feature, support]);

  useEffect(() => {
    if (productType === ProductTypes.desktop) {
      if (support === Support.infra) {
        setSupport(Support.none);
      }
    }
  }, [productType, support]);

  useEffect(() => {
    if (productType === ProductTypes.desktop) {
      setFeature(Features.pro);
    }
  }, [productType, feature, version]);

  useEffect(() => {
    const product = getProduct(productType, feature, support, sla, period);
    if (
      productType === ProductTypes.iotDevice &&
      iotDevice === IoTDevices.core
    ) {
      setProduct(null);
    } else {
      setProduct(window.productList[product] ?? null);
    }
  }, [feature, productType, sla, support, period, iotDevice]);

  useEffect(() => {
    if (!isMonthlyAvailable(product)) {
      setPeriod(Periods.yearly);
    }
  }, [product]);

  return (
    <FormContext.Provider
      value={{
        productUser,
        setProductUser,
        productType,
        setProductType,
        version,
        setVersion,
        feature,
        setFeature,
        sla,
        setSLA,
        support,
        setSupport,
        quantity,
        setQuantity,
        period,
        setPeriod,
        product,
        iotDevice,
        setIoTDevice,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
