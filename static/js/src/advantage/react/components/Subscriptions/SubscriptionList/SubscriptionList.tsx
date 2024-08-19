import type { ReactNode } from "react";
import { Spinner } from "@canonical/react-components";
import {
  UserSubscriptionMachineType,
  UserSubscriptionMarketplace,
  UserSubscriptionType,
} from "advantage/api/enum";
import { useUserSubscriptions } from "advantage/react/hooks";
import {
  selectFreeSubscription,
  selectUASubscriptions,
  selectBlenderSubscriptions,
} from "advantage/react/hooks/useUserSubscriptions";
import { sortSubscriptionsByStartDate } from "advantage/react/utils";
import { sendAnalyticsEvent } from "advantage/react/utils/sendAnalyticsEvent";
import { SelectedId } from "../Content/types";

import ListCard from "./ListCard";
import ListGroup from "./ListGroup";
import type { UserSubscription } from "advantage/api/types";

const dummySubs: UserSubscription[] = [
  {
    account_id: "aAAue9JbQiMtnnmtzsFPAPD88aXCIRS-ZX7za_PeY-h8",
    contract_id: "cAMYwgMQ1KA1WIw98RzhzTblyzzuhef4PvXmlRlAyorE",
    currency: "USD",
    current_number_of_machines: 13,
    end_date: new Date("2025-08-13T05:45:39Z"),
    entitlements: [],
    id: "yearly||aAAue9JbQiMtnnmtzsFPAPD88aXCIRS-ZX7za_PeY-h8||cAMYwgMQ1KA1WIw98RzhzTblyzzuhef4PvXmlRlAyorE||sAGgme0Lwk3zjQ97yzy0DFdMVK3jZlHBpOOEyd_5TnQk",
    listing_id: "lADMts0AWOPPhtiDf5wM6GtKItqyQ5ZK5UT5uCGprbqE",
    machine_type: UserSubscriptionMachineType.Desktop,
    marketplace: UserSubscriptionMarketplace.CanonicalUA,
    max_tracking_reached: false,
    number_of_active_machines: 0,
    number_of_machines: 15,
    period: null,
    price: 450000,
    product_name: "Ubuntu Pro Desktop + Support (24/7)",
    renewal_id: null,
    start_date: new Date("2024-08-13T08:25:10Z"),
    statuses: {
      has_access_to_support: true,
      has_access_to_token: true,
      has_pending_purchases: false,
      is_cancellable: true,
      is_cancelled: false,
      is_downsizeable: false,
      is_expired: false,
      is_expiring: true,
      is_in_grace_period: false,
      is_renewable: false,
      is_renewal_actionable: false,
      is_renewed: true,
      is_subscription_active: true,
      is_subscription_auto_renewing: true,
      is_trialled: false,
      is_upsizeable: false,
      should_present_auto_renewal: false,
    },
    subscription_id: "sAGgme0Lwk3zjQ97yzy0DFdMVK3jZlHBpOOEyd_5TnQk",
    type: UserSubscriptionType.Legacy,
  },
  {
    account_id: "aAAue9JbQiMtnnmtzsFPAPD88aXCIRS-ZX7za_PeY-h8",
    contract_id: "cAMYwgMQ1KA1WIw98RzhzTblyzzuhef4PvXmlRlAyorE",
    currency: "USD",
    current_number_of_machines: 13,
    end_date: new Date("2025-08-13T05:45:39Z"),
    entitlements: [],
    id: "yearly||aAAue9JbQiMtnnmtzsFPAPD88aXCIRS-ZX7za_PeY-h8||cAMYwgMQ1KA1WIw98RzhzTblyzzuhef4PvXmlRlAyorE||sAGgme0Lwk3zjQ97yzy0DFdMVK3jZlHBpOOEyd_5TnQk",
    listing_id: "lADMts0AWOPPhtiDf5wM6GtKItqyQ5ZK5UT5uCGprbqE",
    machine_type: UserSubscriptionMachineType.Desktop,
    marketplace: UserSubscriptionMarketplace.CanonicalUA,
    max_tracking_reached: false,
    number_of_active_machines: 0,
    number_of_machines: 15,
    period: null,
    price: 450000,
    product_name: "Ubuntu Pro Desktop + Support (24/7)",
    renewal_id: null,
    start_date: new Date("2024-08-13T08:25:10Z"),
    statuses: {
      has_access_to_support: true,
      has_access_to_token: true,
      has_pending_purchases: false,
      is_cancellable: true,
      is_cancelled: false,
      is_downsizeable: false,
      is_expired: false,
      is_expiring: false,
      is_in_grace_period: false,
      is_renewable: false,
      is_renewal_actionable: false,
      is_renewed: true,
      is_subscription_active: true,
      is_subscription_auto_renewing: true,
      is_trialled: false,
      is_upsizeable: false,
      should_present_auto_renewal: false,
    },
    subscription_id: "sAGgme0Lwk3zjQ97yzy0DFdMVK3jZlHBpOOEyd_5TnQk",
    type: UserSubscriptionType.Legacy,
  },
  {
    account_id: "aAAue9JbQiMtnnmtzsFPAPD88aXCIRS-ZX7za_PeY-h8",
    contract_id: "cAMYwgMQ1KA1WIw98RzhzTblyzzuhef4PvXmlRlAyorE",
    currency: "USD",
    current_number_of_machines: 13,
    end_date: new Date("2025-08-13T05:45:39Z"),
    entitlements: [],
    id: "yearly||aAAue9JbQiMtnnmtzsFPAPD88aXCIRS-ZX7za_PeY-h8||cAMYwgMQ1KA1WIw98RzhzTblyzzuhef4PvXmlRlAyorE||sAGgme0Lwk3zjQ97yzy0DFdMVK3jZlHBpOOEyd_5TnQk",
    listing_id: "lADMts0AWOPPhtiDf5wM6GtKItqyQ5ZK5UT5uCGprbqE",
    machine_type: UserSubscriptionMachineType.Desktop,
    marketplace: UserSubscriptionMarketplace.CanonicalUA,
    max_tracking_reached: false,
    number_of_active_machines: 0,
    number_of_machines: 15,
    period: null,
    price: 450000,
    product_name: "Ubuntu Pro Desktop + Support (24/7)",
    renewal_id: null,
    start_date: new Date("2024-08-13T08:25:10Z"),
    statuses: {
      has_access_to_support: true,
      has_access_to_token: true,
      has_pending_purchases: false,
      is_cancellable: true,
      is_cancelled: false,
      is_downsizeable: false,
      is_expired: false,
      is_expiring: false,
      is_in_grace_period: true,
      is_renewable: false,
      is_renewal_actionable: false,
      is_renewed: true,
      is_subscription_active: true,
      is_subscription_auto_renewing: true,
      is_trialled: false,
      is_upsizeable: false,
      should_present_auto_renewal: false,
    },
    subscription_id: "sAGgme0Lwk3zjQ97yzy0DFdMVK3jZlHBpOOEyd_5TnQk",
    type: UserSubscriptionType.Legacy,
  },
  {
    account_id: "aAAue9JbQiMtnnmtzsFPAPD88aXCIRS-ZX7za_PeY-h8",
    contract_id: "cAMYwgMQ1KA1WIw98RzhzTblyzzuhef4PvXmlRlAyorE",
    currency: "USD",
    current_number_of_machines: 13,
    end_date: new Date("2025-08-13T05:45:39Z"),
    entitlements: [],
    id: "yearly||aAAue9JbQiMtnnmtzsFPAPD88aXCIRS-ZX7za_PeY-h8||cAMYwgMQ1KA1WIw98RzhzTblyzzuhef4PvXmlRlAyorE||sAGgme0Lwk3zjQ97yzy0DFdMVK3jZlHBpOOEyd_5TnQk",
    listing_id: "lADMts0AWOPPhtiDf5wM6GtKItqyQ5ZK5UT5uCGprbqE",
    machine_type: UserSubscriptionMachineType.Desktop,
    marketplace: UserSubscriptionMarketplace.CanonicalUA,
    max_tracking_reached: false,
    number_of_active_machines: 0,
    number_of_machines: 15,
    period: null,
    price: 450000,
    product_name: "Ubuntu Pro Desktop + Support (24/7)",
    renewal_id: null,
    start_date: new Date("2024-08-13T08:25:10Z"),
    statuses: {
      has_access_to_support: true,
      has_access_to_token: true,
      has_pending_purchases: false,
      is_cancellable: true,
      is_cancelled: false,
      is_downsizeable: false,
      is_expired: true,
      is_expiring: false,
      is_in_grace_period: false,
      is_renewable: false,
      is_renewal_actionable: false,
      is_renewed: true,
      is_subscription_active: true,
      is_subscription_auto_renewing: true,
      is_trialled: false,
      is_upsizeable: false,
      should_present_auto_renewal: false,
    },
    subscription_id: "sAGgme0Lwk3zjQ97yzy0DFdMVK3jZlHBpOOEyd_5TnQk",
    type: UserSubscriptionType.Legacy,
  },
];

type Props = {
  selectedId?: SelectedId;
  onSetActive: (token: SelectedId) => void;
};

const SubscriptionList = ({ selectedId, onSetActive }: Props) => {
  const { data: freeSubscription, isLoading: isLoadingFree } =
    useUserSubscriptions({
      select: selectFreeSubscription,
    });
  const { data: uaSubscriptionsData = [], isLoading: isLoadingUA } =
    useUserSubscriptions({
      select: selectUASubscriptions,
    });
  const { data: blenderSubscriptionsData = [], isLoading: isLoadingBlender } =
    useUserSubscriptions({
      select: selectBlenderSubscriptions,
    });

  if (isLoadingFree || isLoadingUA || isLoadingBlender) {
    return <Spinner />;
  }
  // Sort the subscriptions so that the most recently started subscription is first.
  const sortedUASubscriptions = sortSubscriptionsByStartDate(
    uaSubscriptionsData.concat(dummySubs),
  );

  const groupedUASubscriptions = sortedUASubscriptions.reduce(
    (prev, current) => {
      const sub = (
        <ListCard
          data-test="ua-subscription"
          isSelected={selectedId === current.id}
          key={current.id}
          onClick={() => {
            sendAnalyticsEvent({
              eventCategory: "Advantage",
              eventAction: "subscription-change",
              eventLabel: "ua subscription clicked",
            });
            onSetActive(current.id);
          }}
          subscription={current}
        />
      );

      if (
        current.type === UserSubscriptionType.KeyActivated ||
        current.type === UserSubscriptionType.Legacy
      ) {
        prev.nonEditable.push(sub);
      } else {
        prev.editable.push(sub);
      }

      return prev;
    },
    {
      editable: [] as ReactNode[],
      nonEditable: [] as ReactNode[],
    },
  );

  const sortedBlenderSubscriptions = sortSubscriptionsByStartDate(
    blenderSubscriptionsData,
  );

  const blenderSubscriptions = sortedBlenderSubscriptions.map(
    (subscription) => (
      <ListCard
        data-test="blender-subscription"
        isSelected={selectedId === subscription.id}
        key={subscription.id}
        onClick={() => {
          sendAnalyticsEvent({
            eventCategory: "Advantage",
            eventAction: "subscription-change",
            eventLabel: "blender subscription clicked",
          });
          onSetActive(subscription.id);
        }}
        subscription={subscription}
      />
    ),
  );

  const hasActiveSubscription = (subscriptions: UserSubscription[]) => {
    const now = Date.now();
    return subscriptions.some(({ start_date, end_date }) => {
      if (start_date && end_date) {
        const startDate = new Date(start_date).getTime();
        const endDate = new Date(end_date).getTime();
        return startDate <= now && endDate >= now;
      }
      return false;
    });
  };

  const showFreeSubscription = !hasActiveSubscription(sortedUASubscriptions);

  return (
    <div className="p-subscriptions__list p-card" style={{ overflow: "unset" }}>
      {groupedUASubscriptions.editable.length ? (
        <ListGroup
          data-test="ua-subscriptions-group"
          title="Self-Service"
          marketplace={UserSubscriptionMarketplace.CanonicalUA}
        >
          {groupedUASubscriptions.editable}
        </ListGroup>
      ) : null}

      {groupedUASubscriptions.nonEditable.length ? (
        <ListGroup
          data-test="ua-subscriptions-group"
          selfServiceable={false}
          title="Custom"
          subtitle="These subscriptions cannot be edited online."
          marketplace={UserSubscriptionMarketplace.CanonicalUA}
        >
          {groupedUASubscriptions.nonEditable}
        </ListGroup>
      ) : null}

      {sortedBlenderSubscriptions.length ? (
        <ListGroup
          data-test="blender-subscriptions-group"
          title="Blender"
          marketplace={UserSubscriptionMarketplace.Blender}
        >
          {blenderSubscriptions}
        </ListGroup>
      ) : null}

      {freeSubscription && showFreeSubscription ? (
        <ListGroup
          title="Free personal token"
          marketplace={UserSubscriptionMarketplace.Free}
        >
          <ListCard
            data-test="free-subscription"
            isSelected={selectedId === freeSubscription.id}
            onClick={() => {
              onSetActive(freeSubscription.id);
              sendAnalyticsEvent({
                eventCategory: "Advantage",
                eventAction: "subscription-change",
                eventLabel: "free subscription clicked",
              });
            }}
            subscription={freeSubscription}
          />
        </ListGroup>
      ) : null}
    </div>
  );
};

export default SubscriptionList;
