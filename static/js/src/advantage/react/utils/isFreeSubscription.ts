import { UserSubscriptionType } from "advantage/api/enum";
import { UserSubscription } from "advantage/api/types";

export const isFreeSubscription = (subscription?: UserSubscription | null) =>
  !!subscription && subscription?.type === UserSubscriptionType.Free;
