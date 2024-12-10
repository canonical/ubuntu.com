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
import { Offer } from "advantage/offers/types";
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
    const offerItems = offer?.items || [];
    const offerQuarter = offer?.exclusion_group || "";
    const updatedChannelProductList: ProductListings = {};

    const extractNameWithoutQuarter = (listing: any) => {
      return listing?.name?.split("-").slice(0, 6).join("-"); // ex: "uai-essential-desktop-1y-channel-eur"
    };

    const updateProductListing = (listing: any) => {
      if (updatedChannelProductList) {
        const {
          name,
          id,
          price,
          currency,
          product,
          marketplace,
          exclusion_group,
        } = listing;

        const nameWithoutQuarter = extractNameWithoutQuarter(listing); // ex: "uai-essential-desktop-1y-channel-eur"

        updatedChannelProductList[nameWithoutQuarter] = {
          id: name, // ex: "uai-essential-desktop-1y-channel-eur-v2"
          longId: id, // ex: "labcdefgskdfalskdjflakwedafdafsdfadsfdaf"
          name: name, // ex: "uai-essential-desktop-1y-channel-eur-v2"
          price: {
            value: price, // ex: 23703
            currency: currency, // ex:"EUR"
          },
          productID: product?.id as ValidProductID, // ex: "uai-advanced-desktop"
          productName: product?.name, // ex: "Ubuntu Pro Desktop + Support (24/7)"
          marketplace: marketplace as UserSubscriptionMarketplace, // ex: "canonical-pro-channel"
          exclusion_group: exclusion_group || "", // ex: "2024Q4"
        };
      }
    };

    const offerKeys = offerItems.map((item) => item.id); // ex: ["lACtSZzXX04SacirJ7ey4AATwJzG7hxeCbnl9EUqXXFo"]

    if (rawChannelProductListings) {
      Object.keys(rawChannelProductListings).forEach((key) => {
        // loop through each product listing
        const listing = rawChannelProductListings[key];
        const nameWithoutQuarter = extractNameWithoutQuarter(listing); // ex: "uai-essential-desktop-1y-channel-eur"
        const quarter = listing?.exclusion_group || ""; // ex: "2024Q4"

        // Add product listings for offers first to updatedChannelProductList
        if (offerKeys.includes(key)) {
          const offerMatchedListing = rawChannelProductListings[key];
          if (offerMatchedListing) {
            updateProductListing(offerMatchedListing);
          }
        }
        // Add all product listings with matched quarter to updatedChannelProductList
        if (
          !(nameWithoutQuarter in updatedChannelProductList) &&
          offerQuarter == quarter
        ) {
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
    const items = offer?.items ?? [];
    if (subscriptionList?.length === 0 && items.length > 0) {
      const preSetItem = getPreSelectedItem(items);

      if (preSetItem && preSetItem?.length > 0) {
        setSubscriptionList(preSetItem as SubscriptionItem[]);
        localStorage.setItem(
          DISTRIBUTOR_SELECTOR_KEYS.SUBSCRIPTION_LIST,
          JSON.stringify(preSetItem as SubscriptionItem[]),
        );
      }

      const preSetCurrency: Currencies = getPreCurrency(items);
      if (preSetCurrency) {
        setCurrency(preSetCurrency as Currencies);
        localStorage.setItem(
          DISTRIBUTOR_SELECTOR_KEYS.CURRENCY,
          JSON.stringify(preSetCurrency as Currencies),
        );
      }

      const preSetDration: Durations = getPreDuration(items);
      if (preSetDration) {
        preSetDration && setDuration(preSetDration as Durations);
        localStorage.setItem(
          DISTRIBUTOR_SELECTOR_KEYS.DURATION,
          JSON.stringify(preSetDration as Durations),
        );
      }
    }
  }, [offer]);

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
