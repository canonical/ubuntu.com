/// <reference types="cypress" />
import { getNewTestCredentials } from "../utils";

context("login.ubuntu.com", () => {
  beforeEach(() => {
    cy.setCookie("_cookies_accepted", "all");
  });

  it("should allow to create and delete a new account", () => {
    const { email, password, username } = getNewTestCredentials();

    cy.visit("https://login.ubuntu.com/");
    cy.findByLabelText("Please type your email:").type(email);
    cy.findByLabelText(/I don’t have an Ubuntu One account/).click({
      force: true,
    });

    cy.findByLabelText("Full name").type("Test User");
    cy.findByLabelText("Username").type(`${username}{enter}`);

    cy.get("#id_password").focused().type(password, { force: true });

    cy.findByLabelText("Re-type password").type(password, { force: true });

    cy.findByLabelText(/I have read and accept/).click({ force: true });
    cy.findByRole("button", { name: "Create account" }).click();
    cy.findByText(/Your account was created successfully/).should("be.visible");

    cy.findByRole("link", { name: "Permanently delete account" }).click();
    cy.findByLabelText(/Password/).type(password);

    cy.findByRole("button", { name: "Permanently delete account" }).click();
    cy.findByRole("heading", { name: "Account deleted" }).should("be.visible");
  });
});
