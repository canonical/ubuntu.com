import { parseForErrorObject } from "../error-handler.js";
import {
  contractsErrorObjects,
  stripeErrorObjects,
} from "./fixtures/error-responses.js";

describe("parseForErrorObject", () => {
  describe("given an insufficient funds error", () => {
    it("should return an appropriate error object", () => {
      expect(
        parseForErrorObject(contractsErrorObjects.insufficientFunds)
      ).toEqual({
        message:
          "That card doesn’t have enough funds to make this payment. Please contact your card issuer, or try a different card.",
        type: "notification",
      });
    });
  });

  describe("given a card declined error", () => {
    it("should return an appropriate error object", () => {
      expect(parseForErrorObject(contractsErrorObjects.cardDeclined)).toEqual({
        message:
          "Your card has been declined. Please contact your card issuer, or try a different card.",
        type: "notification",
      });
    });
  });

  describe("given a card expired error", () => {
    it("should return an appropriate error object", () => {
      expect(parseForErrorObject(contractsErrorObjects.cardExpired)).toEqual({
        message: "That card has expired. Try a different card.",
        type: "notification",
      });

      expect(
        parseForErrorObject(contractsErrorObjects.expiredPaymentMethod)
      ).toEqual({
        message: "That card has expired. Try a different card.",
        type: "notification",
      });

      expect(parseForErrorObject(stripeErrorObjects.expiryIncomplete)).toEqual({
        message: "That expiry date is incorrect. Check the date and try again.",
        type: "card",
      });

      expect(parseForErrorObject(stripeErrorObjects.expiryPast)).toEqual({
        message: "That expiry date is incorrect. Check the date and try again.",
        type: "card",
      });
    });
  });

  describe("given an incorrect CVC error", () => {
    it("should return an appropriate error object", () => {
      expect(parseForErrorObject(contractsErrorObjects.cvcIncorrect)).toEqual({
        message:
          "That CVC number is incorrect. Check the number and try again.",
        type: "card",
      });

      expect(parseForErrorObject(stripeErrorObjects.cvcIncomplete)).toEqual({
        message:
          "That CVC number is incorrect. Check the number and try again.",
        type: "card",
      });
    });
  });

  describe("given a price mismatch error", () => {
    it("should return an error message that guides the user to a support contact", () => {
      expect(parseForErrorObject(contractsErrorObjects.priceMismatch)).toEqual({
        message:
          "Our Sales team will be in touch shortly to finalise this renewal. Your card has not been charged.",
        type: "dialog",
      });
    });
  });

  describe("given an incorrect postal code error", () => {
    it("should return an appropriate error object", () => {
      expect(parseForErrorObject(stripeErrorObjects.zipIncomplete)).toEqual({
        message:
          "That ZIP/postal code is incorrect. Check the code and try again.",
        type: "card",
      });
    });
  });

  describe("given an incomplete card number error", () => {
    it("should return an appropriate error object", () => {
      expect(
        parseForErrorObject(stripeErrorObjects.cardNumberIncomplete)
      ).toEqual({
        message:
          "That card number is incorrect. Check the number and try again.",
        type: "card",
      });
    });
  });

  describe("given an incorrect card number error", () => {
    it("should return an appropriate error object", () => {
      expect(parseForErrorObject(stripeErrorObjects.cardNumberInvalid)).toEqual(
        {
          message:
            "That card number is incorrect. Check the number and try again.",
          type: "card",
        }
      );
    });
  });

  describe("given an invalid VAT number error", () => {
    it("should return an appropriate error object", () => {
      expect(parseForErrorObject(contractsErrorObjects.invalidVat)).toEqual({
        message: "That VAT number is invalid. Check the number and try again.",
        type: "notification",
      });
    });
  });
});
