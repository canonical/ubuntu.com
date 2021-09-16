import { ValueOf } from "@canonical/react-components";

const errorMessages = {
  ["email already exists"]:
    "Cannot add user. User already exists in your organisation.",
  default: "An unknown error has occurred.",
} as const;

type SubmissionErrorMessageKey = keyof typeof errorMessages;
export type SubmissionErrorMessage = ValueOf<typeof errorMessages>;

export const getErrorMessage = (
  error: SubmissionErrorMessageKey | string = "default"
): SubmissionErrorMessage =>
  Object.keys(errorMessages).includes(error)
    ? errorMessages[error as SubmissionErrorMessageKey]
    : errorMessages.default;

export const validateRequired = (value: string): string | undefined =>
  !value ? "This field is required." : undefined;

export const validateEmail = (value: string): string | undefined =>
  validateRequired(value) ||
  !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? "Must be a valid email."
    : undefined;
