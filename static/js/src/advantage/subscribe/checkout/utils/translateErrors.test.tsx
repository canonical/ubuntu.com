import { getNotificationMessage } from "./translateErrors";
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

  test("unknown error", () => {
    const error = new Error("unknown_error");
    const result = getNotificationMessage(error);

    expect(result.title).toBe("Payment processing error");
    expect(result.description).toBeTruthy();
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
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
});
