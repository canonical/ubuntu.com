import { ValueOf } from "@canonical/react-components";

export const errorMessages = {
  ["email already exists"]:
    "Cannot add user. User already exists in your organisation.",
  ["cannot remove last verified admin from account"]:
    "Cannot remove last verified admin from account",
  ["network failure"]: "Network failure. Please try again.",
  ["account not found"]: "Account not found",
  ["user already belongs to another account"]:
    "User already belongs to another account",
  ["unknown"]: "An unknown error has occurred.",
} as const;

type SubmissionErrorMessageKey = keyof typeof errorMessages;
export type SubmissionErrorMessage = ValueOf<typeof errorMessages>;

export const _getErrorMessage = (error: Error): SubmissionErrorMessage => {
  if (error?.message?.match?.(/^account (.*) not found$/)) {
    return errorMessages["account not found"];
  }
  return (
    errorMessages[
      Object.keys(errorMessages).find((message) =>
        error.message.includes?.(message)
      ) as SubmissionErrorMessageKey
    ] || errorMessages.unknown
  );
};

export const getErrorMessage = (error: unknown): SubmissionErrorMessage =>
  error instanceof Error ? _getErrorMessage(error) : errorMessages.unknown;

export const validateRequired = (value: string): string | undefined =>
  !value ? "This field is required." : undefined;

export const validateEmail = (value: string): string | undefined =>
  validateRequired(value) ||
  !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? "Must be a valid email."
    : undefined;
