import fetchMock from "jest-fetch-mock";
import intlTelInput from "intl-tel-input";
import setupIntlTelInput from "../intlTelInput";
import { fireEvent } from "@testing-library/dom";

jest.mock("intl-tel-input");
fetchMock.enableMocks();

describe("setupIntlTelInput", () => {
  let phoneInput;
  let mobileInput;
  let errorElement;

  beforeEach(() => {
    document.body.innerHTML = `
    <!DOCTYPE html> 
    <ul>
      <li class="p-list__item">
        <label for="phone">Mobile/cell phone number:</label>
        <div class="iti iti--allow-dropdown">
          <div class="iti__flag-container">
            <div class="iti__selected-flag"></div>
          </div>
          <input id="phone" name="phoneName" maxlength="255" type="tel">
          <input type="hidden" name="phone">
        </div>
      </li>
    </ul>`;

    phoneInput = document.querySelector("input#phone");
    mobileInput = document.querySelector(".iti");
    setupIntlTelInput(phoneInput);
    fetch.resetMocks();
    intlTelInput.mockClear();
  });

  it("imports intlTelInput correctly", () => {
    expect(intlTelInput).toBeDefined();
  });

  it("calls intlTelInput with correct parameters", async () => {
    const expectedOptions = {
      utilsScript: expect.any(String),
      separateDialCode: expect.any(Boolean),
      hiddenInput: expect.any(String),
      initialCountry: expect.any(String),
      geoIpLookup: expect.any(Function),
    };

    fetch.mockResponseOnce(JSON.stringify({ country_code: "gb" }));

    setupIntlTelInput(phoneInput);

    expect(intlTelInput).toBeCalledWith(phoneInput, expectedOptions);
  });

  it("validates phone number correctly", async () => {
    setupIntlTelInput(phoneInput);

    phoneInput.value = "1-2,3.4(5)6/";
    const blurEvent = new Event("blur");
    phoneInput.dispatchEvent(blurEvent);
    expect(mobileInput.parentNode.classList.contains("is-error")).toBeFalsy();

    phoneInput.value = "abcdef";
    phoneInput.dispatchEvent(blurEvent);
    expect(mobileInput.parentNode.classList.contains("is-error")).toBeTruthy();
  });

  it("displays error message for an invalid phone number", () => {
    phoneInput.value = "abcdef";
    fireEvent.blur(phoneInput);

    const errorMsg = document.querySelector(".p-form-validation__message");
    expect(errorMsg).toBeTruthy();
  });
});
