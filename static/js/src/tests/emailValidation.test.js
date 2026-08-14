import { fireEvent } from "@testing-library/dom";
import { INVALID_EMAIL_MESSAGE } from "../email-validation.js";

const EMAIL_PATTERN = "^[^ ]+@[^ ]+\\.[a-z]{2,26}$";

const renderForm = () => {
  document.body.innerHTML = `
    <form>
      <ul>
        <li class="p-list__item">
          <label for="email">Email:</label>
          <input required id="email" name="email" maxlength="255" type="email" pattern="${EMAIL_PATTERN}">
        </li>
      </ul>
    </form>`;
  return document.querySelector("input#email");
};

describe("email validation", () => {
  beforeEach(() => {
    renderForm();
  });

  it("displays the standard error message for an invalid email", () => {
    const emailInput = document.querySelector("input#email");
    emailInput.value = "name@examplecom";
    fireEvent.blur(emailInput);

    const errorMsg = document.querySelector(".p-form-validation__message");
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.textContent).toBe(INVALID_EMAIL_MESSAGE);
  });

  it("displays no error message for a valid email", () => {
    const emailInput = document.querySelector("input#email");
    emailInput.value = "name@example.com";
    fireEvent.blur(emailInput);

    expect(document.querySelector(".p-form-validation__message")).toBeNull();
  });

  it("clears a shown error message as soon as the value is edited", () => {
    const emailInput = document.querySelector("input#email");
    emailInput.value = "name@examplecom";
    fireEvent.blur(emailInput);
    expect(document.querySelector(".p-form-validation__message")).toBeTruthy();

    emailInput.value = "name@example.com";
    fireEvent.input(emailInput);

    expect(document.querySelector(".p-form-validation__message")).toBeNull();
  });

  it("applies Vanilla error styling to the field while it is invalid", () => {
    const emailInput = document.querySelector("input#email");
    emailInput.value = "name@examplecom";
    fireEvent.blur(emailInput);

    expect(emailInput.classList).toContain("p-form-validation__input");
    expect(emailInput.parentElement.classList).toContain("p-form-validation");
    expect(emailInput.parentElement.classList).toContain("is-error");

    emailInput.value = "name@example.com";
    fireEvent.input(emailInput);

    expect(emailInput.parentElement.classList).not.toContain("is-error");
  });

  it("links the error message to its own field via aria-describedby", () => {
    const emailInput = document.querySelector("input#email");
    emailInput.value = "name@examplecom";
    fireEvent.blur(emailInput);

    const errorMsg = document.querySelector(".p-form-validation__message");
    expect(errorMsg.id).toBeTruthy();
    expect(emailInput.getAttribute("aria-describedby")).toBe(errorMsg.id);

    emailInput.value = "name@example.com";
    fireEvent.input(emailInput);

    expect(emailInput.hasAttribute("aria-describedby")).toBe(false);
  });

  it("gives each email field on a page its own error message", () => {
    document.body.innerHTML = `
      <form>
        <input id="email" name="email" type="email" pattern="${EMAIL_PATTERN}">
        <input id="confirmEmail" name="confirmEmail" type="email" pattern="${EMAIL_PATTERN}">
      </form>`;
    const first = document.querySelector("input#email");
    const second = document.querySelector("input#confirmEmail");

    first.value = "name@examplecom";
    second.value = "other@examplecom";
    fireEvent.blur(first);
    fireEvent.blur(second);

    const messages = document.querySelectorAll(".p-form-validation__message");
    expect(messages).toHaveLength(2);
    expect(first.getAttribute("aria-describedby")).toBe(messages[0].id);
    expect(second.getAttribute("aria-describedby")).toBe(messages[1].id);
    expect(messages[0].id).not.toBe(messages[1].id);
  });

  it("replaces the browser's own wording on the native validation bubble", () => {
    const emailInput = document.querySelector("input#email");
    emailInput.value = "name@examplecom";
    fireEvent.input(emailInput);

    expect(emailInput.validationMessage).toBe(INVALID_EMAIL_MESSAGE);
  });

  it("stops blocking submission once the email is corrected", () => {
    const emailInput = document.querySelector("input#email");
    emailInput.value = "name@examplecom";
    fireEvent.input(emailInput);

    emailInput.value = "name@example.com";
    fireEvent.input(emailInput);

    expect(emailInput.validationMessage).toBe("");
    expect(emailInput.checkValidity()).toBe(true);
  });

  it("leaves an empty required field to the browser's own required message", () => {
    const emailInput = document.querySelector("input#email");
    emailInput.value = "";
    fireEvent.blur(emailInput);

    expect(emailInput.validationMessage).not.toBe(INVALID_EMAIL_MESSAGE);
    expect(document.querySelector(".p-form-validation__message")).toBeNull();
  });

  it("marks an invalid field inline when submission is attempted", () => {
    const emailInput = document.querySelector("input#email");
    emailInput.value = "name@examplecom";

    // checkValidity() fires the same `invalid` event a submit attempt does.
    expect(emailInput.checkValidity()).toBe(false);

    const errorMsg = document.querySelector(".p-form-validation__message");
    expect(errorMsg).toBeTruthy();
    expect(errorMsg.textContent).toBe(INVALID_EMAIL_MESSAGE);
  });

  it("validates an email field added to the page after load", () => {
    // Modal and generated forms inject their fields long after this module ran.
    const modal = document.createElement("div");
    modal.innerHTML = `<input id="modalEmail" name="email" type="email" pattern="${EMAIL_PATTERN}">`;
    document.body.append(modal);

    const modalEmail = document.querySelector("input#modalEmail");
    modalEmail.value = "name@examplecom";
    fireEvent.blur(modalEmail);

    expect(modalEmail.nextElementSibling?.textContent).toBe(
      INVALID_EMAIL_MESSAGE,
    );
    expect(modalEmail.validationMessage).toBe(INVALID_EMAIL_MESSAGE);
  });
});
