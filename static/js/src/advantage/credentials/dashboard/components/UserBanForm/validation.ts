import { object, string, date, boolean } from "yup";

export const userBanSchema = object({
  email: string().email("Invalid email").required("Required"),
  expiresAt: date().nullable().typeError("Invalid datetime"),
  reason: string().required("Required"),
  blocked: boolean().default(true).required("Required"),
});
