import React, { createContext, useEffect, useMemo, useState } from "react";
import {
  ChannelProduct,
  DistributorProductTypes as ProductTypes,
  Durations,
  SubscriptionItem,
  Currencies,
  getProductId,
  ValidProductID,
  getPreSelectedItem,
  getPreCurrency,
  getPreDuration,
  TechnicalUserContact,
  ProductListings,
  DISTRIBUTOR_SELECTOR_KEYS,
  getLocalStorageItem,
} from "./utils";
import { Offer } from "advantage/offers/types";

interface FormContext {
  productType: ProductTypes;
  setProductType: React.Dispatch<React.SetStateAction<ProductTypes>>;
  subscriptionList: SubscriptionItem[];
  setSubscriptionList: React.Dispatch<React.SetStateAction<SubscriptionItem[]>>;
  duration: Durations;
  setDuration: React.Dispatch<React.SetStateAction<Durations>>;
  currency: Currencies;
  setCurrency: React.Dispatch<React.SetStateAction<Currencies>>;
  technicalUserContact: TechnicalUserContact;
  setTechnicalUserContact: React.Dispatch<
    React.SetStateAction<TechnicalUserContact>
  >;
  products: ChannelProduct[] | null;
  offer: Offer | null;
  setOffer: React.Dispatch<React.SetStateAction<Offer | null>>;
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
  technicalUserContact: {
    name: "",
    email: "",
  },
  products: null,
  setTechnicalUserContact: () => {},
  offer: null,
  setOffer: () => {},
};

export const FormContext = createContext<FormContext>(defaultValues);

interface FormProviderProps {
  initialSubscriptionList?: SubscriptionItem[];
  initialType?: ProductTypes;
  initialDuration?: Durations;
  initialCurrency?: Currencies;
  initialOffer?: Offer | null;
  initialTechnicalUserContact?: TechnicalUserContact;
  initialChannelProductList?: ProductListings;
  children: React.ReactNode;
}

export const FormProvider = ({
  initialSubscriptionList = defaultValues.subscriptionList,
  initialType = defaultValues.productType,
  initialDuration = defaultValues.duration,
  initialOffer = defaultValues.offer,
  initialCurrency = defaultValues.currency,
  initialTechnicalUserContact = defaultValues.technicalUserContact,
  children,
}: FormProviderProps) => {
  const [subscriptionList, setSubscriptionList] = useState<SubscriptionItem[]>(
    getLocalStorageItem(
      DISTRIBUTOR_SELECTOR_KEYS.SUBSCRIPTION_LIST,
      initialSubscriptionList,
    ),
  );
  const [productType, setProductType] = useState<ProductTypes>(
    getLocalStorageItem(DISTRIBUTOR_SELECTOR_KEYS.PRODUCT_TYPE, initialType),
  );
  const [duration, setDuration] = useState<Durations>(
    getLocalStorageItem(DISTRIBUTOR_SELECTOR_KEYS.DURATION, initialDuration),
  );
  const [currency, setCurrency] = useState<Currencies>(
    getLocalStorageItem(DISTRIBUTOR_SELECTOR_KEYS.CURRENCY, initialCurrency),
  );
  const [technicalUserContact, setTechnicalUserContact] =
    useState<TechnicalUserContact>(
      getLocalStorageItem(
        DISTRIBUTOR_SELECTOR_KEYS.TECHNICAL_USER_CONTACT,
        initialTechnicalUserContact,
      ),
    );
  const [products, setProducts] = useState<ChannelProduct[] | null>(null);
  const [offer, setOffer] = useState<Offer | null>(
    getLocalStorageItem(DISTRIBUTOR_SELECTOR_KEYS.OFFER_DATA, initialOffer),
  );
  const [channelProductList, setChannelProductList] = useState<ProductListings>(
    {},
  );

  const updatedChannelProductList = useMemo(() => {
    if (!offer) return {};

    const rawChannelProductListings = window.channelProductList || {};
    const offerExclusiveGroup = offer?.exclusion_group || "";
    const updatedListings: ProductListings = {};

    const getDurationYears = (effectiveDays?: number): number | null =>
      effectiveDays === 365
        ? 1
        : effectiveDays === 730
          ? 2
          : effectiveDays === 1095
            ? 3
            : null;

    Object.values(rawChannelProductListings).forEach((listing: any) => {
      if (listing.exclusion_group === offerExclusiveGroup) {
        const { id, price, currency, product, effective_days } = listing;
        const duration = getDurationYears(effective_days);
        const newName =
          `${product?.id}-${duration}y-channel-${currency}`.toLowerCase();

        updatedListings[newName] = {
          id: newName,
          longId: id,
          name: newName,
          price: { value: price, currency },
          productID: product?.id as ValidProductID,
          productName: product?.name,
          marketplace: listing.marketplace,
          exclusion_group: listing.exclusion_group || "",
          effective_days,
        };
      }
    });

    return updatedListings;
  }, [offer, window.channelProductList]);

  useEffect(() => {
    if (offer) {
      setChannelProductList(updatedChannelProductList);
      localStorage.setItem(
        DISTRIBUTOR_SELECTOR_KEYS.PRODUCT_LISTING,
        JSON.stringify(updatedChannelProductList),
      );
    }
  }, [updatedChannelProductList, offer]);

  const filteredProducts = useMemo(() => {
    const productIds = subscriptionList.map((subscription) =>
      getProductId(subscription.type, subscription.support, subscription.sla),
    );

    const validProducts = productIds.map(
      (productId) => `${productId}-${duration}y-channel-${currency}`,
    );

    return validProducts
      .map((id) => channelProductList[id])
      .filter((product) => !!product);
  }, [duration, currency, subscriptionList, channelProductList]);

  useEffect(() => {
    setProducts(filteredProducts);
  }, [filteredProducts]);

  useEffect(() => {
    if (!offer) return;

    const preSetItems: SubscriptionItem[] = [];
    let preSetCurrency: Currencies | null = null;
    let preSetDuration: Durations | null = null;

    if (subscriptionList.length === 0 && offer.items.length > 0) {
      offer.items.forEach((item) => {
        const preSetItem = getPreSelectedItem(item);
        if (preSetItem) preSetItems.push(preSetItem);

        preSetCurrency = preSetCurrency || getPreCurrency(item);
        preSetDuration = preSetDuration || getPreDuration(item);
      });

      if (preSetItems.length > 0) {
        setSubscriptionList(preSetItems);
        localStorage.setItem(
          DISTRIBUTOR_SELECTOR_KEYS.SUBSCRIPTION_LIST,
          JSON.stringify(preSetItems),
        );
      }
      if (preSetCurrency) {
        setCurrency(preSetCurrency);
        localStorage.setItem(
          DISTRIBUTOR_SELECTOR_KEYS.CURRENCY,
          JSON.stringify(preSetCurrency),
        );
      }
      if (preSetDuration) {
        setDuration(preSetDuration);
        localStorage.setItem(
          DISTRIBUTOR_SELECTOR_KEYS.DURATION,
          JSON.stringify(preSetDuration),
        );
      }
    }
  }, [offer]);

  useEffect(() => {
    if ((!technicalUserContact.name || !technicalUserContact.email) && offer) {
      setTechnicalUserContact({
        name: offer.technical_contact_name || "",
        email: offer.technical_contact_email || "",
      });
    }
  }, [offer]);

  return (
    <FormContext.Provider
      value={{
        subscriptionList,
        setSubscriptionList,
        productType,
        setProductType,
        duration,
        setDuration,
        currency,
        setCurrency,
        products,
        offer,
        setOffer,
        technicalUserContact,
        setTechnicalUserContact,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
