import React, { useState, createContext, useEffect } from "react";
import {
  getProduct,
  ProductTypes,
  LTSVersions,
  Support,
  Product,
  Features,
  Periods,
  SLA,
  isMonthlyAvailable,
  IoTDevices,
} from "./utils";

interface FormContext {
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
  ioTDevice: IoTDevices;
  setIoTDevice: React.Dispatch<React.SetStateAction<IoTDevices>>;
}

export const defaultValues: FormContext = {
  productType: ProductTypes.physical,
  setProductType: () => {},
  version: LTSVersions.jammy,
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
  ioTDevice: IoTDevices.classic,
  setIoTDevice: () => {},
};

export const FormContext = createContext<FormContext>(defaultValues);

interface FormProviderProps {
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
  initialType = defaultValues.productType,
  initialVersion = defaultValues.version,
  initialFeature = defaultValues.feature,
  initialSLA = defaultValues.sla,
  initialSupport = defaultValues.support,
  initialQuantity = defaultValues.quantity,
  initialPeriod = defaultValues.period,
  initialIoTDevice = defaultValues.ioTDevice,
  children,
}: FormProviderProps) => {
  const localProductType = localStorage.getItem("pro-selector-productType");
  const localVersion = localStorage.getItem("pro-selector-version");
  const localQuantity = localStorage.getItem("pro-selector-quantity");
  const localFeature = localStorage.getItem("pro-selector-feature");
  const localSupport = localStorage.getItem("pro-selector-support");
  const localSLA = localStorage.getItem("pro-selector-sla");
  const localPeriod = localStorage.getItem("pro-selector-period");
  const localIoTDevice = localStorage.getItem("pro-selector-iotDevice");

  const [productType, setProductType] = useState<ProductTypes>(
    localProductType ? JSON.parse(localProductType) : initialType
  );
  const [version, setVersion] = useState<LTSVersions>(
    localVersion ? JSON.parse(localVersion) : initialVersion
  );
  const [feature, setFeature] = useState<Features>(
    localFeature ? JSON.parse(localFeature) : initialFeature
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
  const [period, setPeriod] = useState<Periods>(
    localPeriod ? JSON.parse(localPeriod) : initialPeriod
  );
  const [product, setProduct] = useState<Product | null>(null);
  const [ioTDevice, setIoTDevice] = useState<IoTDevices>(
    localIoTDevice ? JSON.parse(localIoTDevice) : initialIoTDevice
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
    if (version === LTSVersions.trusty) {
      setSupport(Support.none);
    }
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
  }, [productType, feature]);

  useEffect(() => {
    const product = getProduct(productType, feature, support, sla, period);
    setProduct(window.productList[product] ?? null);
  }, [feature, productType, sla, support, period]);

  useEffect(() => {
    if (!isMonthlyAvailable(product)) {
      setPeriod(Periods.yearly);
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
        sla,
        setSLA,
        support,
        setSupport,
        quantity,
        setQuantity,
        period,
        setPeriod,
        product,
        ioTDevice,
        setIoTDevice,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
