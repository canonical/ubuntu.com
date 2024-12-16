import React, { createContext, useEffect, useMemo, useState } from "react";
import {
  ChannelProduct,
  DistributorProductTypes as ProductTypes,
  Support,
  SLA,
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
} from "./utils";
import { Offer, OfferItem } from "advantage/offers/types";
import { UserSubscriptionMarketplace } from "advantage/api/enum";

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
  channelProductList: ProductListings;
  setChannelProductList: React.Dispatch<React.SetStateAction<ProductListings>>;
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
  channelProductList: {},
  setChannelProductList: () => {},
};

export const FormContext = createContext<FormContext>(defaultValues);

interface FormProviderProps {
  initialSubscriptionList?: SubscriptionItem[];
  initialType?: ProductTypes;
  initialDuration?: Durations;
  initialCurrency?: Currencies;
  initialOffer?: Offer;
  initialTechnicalUserContact?: TechnicalUserContact;
  initialChannelProductList?: ProductListings;
  children: React.ReactNode;
}

export const FormProvider = ({
  initialSubscriptionList = defaultValues.subscriptionList,
  initialType = defaultValues.productType,
  initialDuration = defaultValues.duration,
  initialCurrency = defaultValues.currency,
  initialTechnicalUserContact = defaultValues.technicalUserContact,
  initialChannelProductList = defaultValues.channelProductList,
  children,
}: FormProviderProps) => {
  const localSubscriptionList = localStorage.getItem(
    DISTRIBUTOR_SELECTOR_KEYS.SUBSCRIPTION_LIST,
  );
  const localProductType = localStorage.getItem(
    DISTRIBUTOR_SELECTOR_KEYS.PRODUCT_TYPE,
  );
  const localDuration = localStorage.getItem(
    DISTRIBUTOR_SELECTOR_KEYS.DURATION,
  );
  const localCurrency = localStorage.getItem(
    DISTRIBUTOR_SELECTOR_KEYS.CURRENCY,
  );
  const localTechnicalUserContact = localStorage.getItem(
    DISTRIBUTOR_SELECTOR_KEYS.TECHNICAL_USER_CONTACT,
  );
  const localOffer = localStorage.getItem(DISTRIBUTOR_SELECTOR_KEYS.OFFER_DATA);

  const [subscriptionList, setSubscriptionList] = useState<SubscriptionItem[]>(
    localSubscriptionList
      ? JSON.parse(localSubscriptionList)
      : initialSubscriptionList,
  );
  const [productType, setProductType] = useState<ProductTypes>(
    localProductType ? JSON.parse(localProductType) : initialType,
  );
  const [duration, setDuration] = useState<Durations>(
    localDuration ? JSON.parse(localDuration) : initialDuration,
  );
  const [technicalUserContact, setTechnicalUserContact] =
    useState<TechnicalUserContact>(
      localTechnicalUserContact
        ? JSON.parse(localTechnicalUserContact)
        : initialTechnicalUserContact,
    );
  const [currency, setCurrency] = useState<Currencies>(
    localCurrency ? JSON.parse(localCurrency) : initialCurrency,
  );
  const [products, setProducts] = useState<ChannelProduct[] | null>(null);
  const [offer, setOffer] = useState<Offer | null>(
    localOffer ? JSON.parse(localOffer) : null,
  );
  const [channelProductList, setChannelProductList] = useState<ProductListings>(
    initialChannelProductList,
  );

  const updatedChannelProductList = useMemo(() => {
    const rawChannelProductListings = window.channelProductList;
    const offerExclusiveGroup = offer?.exclusion_group || "";
    const updatedChannelProductList: ProductListings = {};

    const getDuration = (effectiveDays: number | undefined): number | null => {
      if (effectiveDays === 365) return 1;
      if (effectiveDays === 730) return 2;
      if (effectiveDays === 1095) return 3;
      return null;
    };

    const updateProductListing = (listing: any) => {
      const {
        id,
        price,
        currency,
        product,
        marketplace,
        exclusion_group,
        effective_days,
      } = listing;

      const duration = getDuration(effective_days);
      const newName =
        `${product?.id}-${duration}y-channel-${currency}`.toLowerCase();

      updatedChannelProductList[newName] = {
        id: newName,
        longId: id,
        name: newName,
        price: {
          value: price,
          currency: currency,
        },
        productID: product?.id as ValidProductID,
        productName: product?.name,
        marketplace: marketplace as UserSubscriptionMarketplace,
        exclusion_group: exclusion_group || "",
        effective_days,
      };
    };

    if (rawChannelProductListings) {
      Object.values(rawChannelProductListings).forEach((listing: any) => {
        const { exclusion_group = "" } = listing;

        // Add listings whose exclusion_group matches offerExclusiveGroup
        if (offerExclusiveGroup === exclusion_group) {
          updateProductListing(listing);
        }
      });
    }

    return updatedChannelProductList;
  }, [offer, window.channelProductList]);

  useEffect(() => {
    setChannelProductList(updatedChannelProductList);
    localStorage.setItem(
      DISTRIBUTOR_SELECTOR_KEYS.PRODUCT_LISTING,
      JSON.stringify(updatedChannelProductList),
    );
  }, [updatedChannelProductList]);

  const filteredProducts = useMemo(() => {
    const productIds: ValidProductID[] = subscriptionList.map((subscription) =>
      getProductId(
        subscription.type as ProductTypes,
        subscription.support as Support,
        subscription.sla as SLA,
      ),
    );
    const validproducts: string[] = productIds.map(
      (productId: ValidProductID) =>
        `${productId}-${duration}y-channel-${currency}`,
    );
    return validproducts.map(
      (validproduct) => channelProductList[validproduct],
    );
  }, [duration, currency, subscriptionList, channelProductList]);

  useEffect(() => {
    setProducts(filteredProducts);
  }, [filteredProducts]);

  useEffect(() => {
    if (!offer) return;

    setSubscriptionItems(
      offer.items,
      subscriptionList,
      setSubscriptionList,
      setCurrency,
      setDuration,
    );
  }, [offer]);

  const setSubscriptionItems = (
    items: OfferItem[],
    subscriptionList: SubscriptionItem[] | null,
    setSubscriptionList: (list: SubscriptionItem[]) => void,
    setCurrency: (currency: Currencies) => void,
    setDuration: (duration: Durations) => void,
  ) => {
    const preSetItems: SubscriptionItem[] = [];
    let preSetCurrency: Currencies | null = null;
    let preSetDuration: Durations | null = null;

    if (subscriptionList?.length === 0 && items.length > 0) {
      items.forEach((item) => {
        const preSetItem = getPreSelectedItem(item);
        if (preSetItem) {
          preSetItems.push(preSetItem);
        }

        preSetCurrency = preSetCurrency || getPreCurrency(item);
        preSetDuration = preSetDuration || getPreDuration(item);
      });

      // Update subscription list
      if (preSetItems.length > 0) {
        setSubscriptionList(preSetItems);
        localStorage.setItem(
          DISTRIBUTOR_SELECTOR_KEYS.SUBSCRIPTION_LIST,
          JSON.stringify(preSetItems),
        );
      }

      // Update currency
      if (preSetCurrency) {
        setCurrency(preSetCurrency);
        localStorage.setItem(
          DISTRIBUTOR_SELECTOR_KEYS.CURRENCY,
          JSON.stringify(preSetCurrency),
        );
      }

      // Update duration
      if (preSetDuration) {
        setDuration(preSetDuration);
        localStorage.setItem(
          DISTRIBUTOR_SELECTOR_KEYS.DURATION,
          JSON.stringify(preSetDuration),
        );
      }
    }
  };

  useEffect(() => {
    if (!localTechnicalUserContact) {
      setTechnicalUserContact({
        name: offer?.technical_contact_name,
        email: offer?.technical_contact_email,
      } as TechnicalUserContact);
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
        channelProductList,
        setChannelProductList,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
