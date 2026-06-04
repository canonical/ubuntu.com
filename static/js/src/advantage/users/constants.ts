import { OptionHTMLAttributes } from "react";

export const userRoleOptions: OptionHTMLAttributes<HTMLOptionElement>[] = [
  {
    label: "Admin",
    value: "admin",
  },
  {
    label: "Technical",
    value: "technical",
  },
  {
    label: "Billing",
    value: "billing",
  },
];
