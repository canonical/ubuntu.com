import { UserSubscriptionMarketplace } from "advantage/api/enum";
import { UserSubscription } from "advantage/api/types";

export const isBlenderSubscription = (subscription?: UserSubscription | null) =>
  subscription?.marketplace === UserSubscriptionMarketplace.Blender;
