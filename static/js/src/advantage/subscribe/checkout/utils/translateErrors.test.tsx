import { getNotificationMessage, getCardErrorMessage } from "./translateErrors";
import * as Sentry from "@sentry/react";

jest.mock("@sentry/react");

describe("getNotificationMessage", () => {
  test("insufficient funds", () => {
    const error = new Error("insufficient_funds");
    const result = getNotificationMessage(error);

    expect(result.title).toBe("Insufficient funds");
    expect(result.description).toBeTruthy();
  });

  test("incorrect CVC", () => {
    const error = new Error("incorrect_cvc");
    const result = getNotificationMessage(error);

    expect(result.title).toBe("Incorrect security code");
    expect(result.description).toBeTruthy();
  });

  test("incorrect ZIP", () => {
    const error = new Error("incorrect_zip");
    const result = getNotificationMessage(error);

    expect(result.title).toBe("Postal code doesn’t match");
    expect(result.description).toBeTruthy();
  });

  test("card expired", () => {
    const error = new Error("expired_card");
    const result = getNotificationMessage(error);

    expect(result.title).toBe("Card expired");
    expect(result.description).toBeTruthy();
  });

  test("card declined", () => {
    const error = new Error("card_declined");
    const result = getNotificationMessage(error);

    expect(result.title).toBe("Payment declined");
    expect(result.description).toBeTruthy();
  });

  test("incorrect number", () => {
    const error = new Error("incorrect_number");
    const result = getNotificationMessage(error);

    expect(result.description).toBe(
      "That card number is incorrect. Check the number and try again.",
    );
  });

  test("invalid VAT number", () => {
    const error = new Error("tax_id_invalid");
    const result = getNotificationMessage(error);

    expect(result.description).toBe(
      "That VAT number is invalid. Check the number and try again.",
    );
  });

  test("unvalidated VAT number", () => {
    const error = new Error("tax_id_cannot_be_validated");
    const result = getNotificationMessage(error);

    expect(result.description).toBe(
      "VAT number could not be validated at this time, please try again later or contact customer success if the problem persists.",
    );
  });

  test("unsupported card", () => {
    const error = new Error("card_not_supported");
    const result = getNotificationMessage(error);

    expect(result.description).toBe(
      "That card doesn’t allow this kind of payment. Please contact your card issuer, or try a different card.",
    );
  });

  test("unsupported currency", () => {
    const error = new Error("currency_not_supported");
    const result = getNotificationMessage(error);

    expect(result.description).toBe(
      "That card doesn’t allow payments in this currency. Please contact your card issuer, or try a different card.",
    );
  });

  test("unknown error", () => {
    const error = new Error("unknown_error");
    const result = getNotificationMessage(error);

    expect(result.title).toBe("Payment processing error");
    expect(result.description).toBeTruthy();
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });
});

describe("getCardErrorMessage", () => {
  test("error is null", () => {
    const result = getCardErrorMessage(null);
    expect(result).toBeUndefined();
  });

  test("unknown error", () => {
    const result = getCardErrorMessage({ code: "unknown_code" } as any);
    expect(result).toBeUndefined();
  });

  test("incorrect number", () => {
    const result = getCardErrorMessage({ code: "incorrect_number" } as any);
    expect(result).toBe("Invalid card number, check and re-enter the number.");
  });

  test("incorrect CVC", () => {
    const result = getCardErrorMessage({ code: "incorrect_cvc" } as any);
    expect(result).toBe(
      "That CVC number is incorrect. Check the number and try again.",
    );
  });

  test("incorrect ZIP", () => {
    const result = getCardErrorMessage({ code: "incorrect_zip" } as any);
    expect(result).toBe(
      "The ZIP/postal code is incorrect, check and re-enter the code.",
    );
  });

  test("incorrect expiry", () => {
    const result = getCardErrorMessage({ code: "invalid_expiry_year" } as any);
    expect(result).toBe(
      "That expiry date is incorrect. Check the date and try again.",
    );
  });

  test("tax ID invalid", () => {
    const result = getCardErrorMessage({ code: "tax_id_invalid" } as any);
    expect(result).toBe(
      "That VAT number is invalid. Check the number and try again.",
    );
  });

  test("tax ID cannot be validated", () => {
    const result = getCardErrorMessage({
      code: "tax_id_cannot_be_validated",
    } as any);
    expect(result).toBe(
      "VAT number could not be validated at this time, please try again later or contact customer success if the problem persists.",
    );
  });

  test("card not supported", () => {
    const result = getCardErrorMessage({ code: "card_not_supported" } as any);
    expect(result).toBe(
      "That card doesn’t allow this kind of payment. Please contact your card issuer, or try a different card.",
    );
  });

  test("currency not supported", () => {
    const result = getCardErrorMessage({
      code: "currency_not_supported",
    } as any);
    expect(result).toBe(
      "That card doesn’t allow payments in this currency. Please contact your card issuer, or try a different card.",
    );
  });

  test("expired card", () => {
    const result = getCardErrorMessage({ code: "expired_card" } as any);
    expect(result).toBe("That card has expired. Try a different card.");
  });

  test("testmode decline", () => {
    const result = getCardErrorMessage({ code: "testmode_decline" } as any);
    expect(result).toBe("Test completed.");
  });

  test("card declined", () => {
    const result = getCardErrorMessage({ code: "card_declined" } as any);
    expect(result).toBe(
      "Your card has been declined. Please contact your card issuer, or try a different card.",
    );
  });
});
