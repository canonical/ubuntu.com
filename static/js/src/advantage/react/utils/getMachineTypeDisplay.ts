import { UserSubscriptionMachineType } from "advantage/api/enum";
import { UserSubscription } from "advantage/api/types";

export const getMachineTypeDisplay = (
  machineType: UserSubscription["machine_type"]
) => {
  switch (machineType) {
    case UserSubscriptionMachineType.Virtual:
      return "Virtual";
    case UserSubscriptionMachineType.Physical:
      return "Physical";
    case UserSubscriptionMachineType.Desktop:
      return "Desktop";
    default:
      return machineType;
  }
};
