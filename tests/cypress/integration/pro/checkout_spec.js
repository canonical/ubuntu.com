/// <reference types="cypress" />

import { getRandomEmail, slowDownResponse as slow } from "../../utils";

Cypress.config("defaultCommandTimeout", 10000);

const ENDPOINTS = {
  calculate: "/account/canonical-ua/purchase/calculate*",
  postPurchase: "/pro/purchase*",
  preview: "/pro/purchase/preview*",
  ensure: "/account/purchase-account*",
  customerInfo: "/account/customer-info*",
  getPurchase: "/account/purchases/*",
  postInvoice: "/account/purchases/*/retry*",
};

context("Checkout - Region and taxes", () => {
  it("user: it should show correct non-VAT price", () => {
    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();
    cy.selectProducts();

    cy.login();

    cy.scrollTo("bottom");
    cy.findByRole("button", { name: "Buy now" }).click();

    // Redirected to checkout
    cy.location().should((loc) => {
      expect(loc.pathname).to.equal("/account/checkout");
    });

    cy.wait(2000);

    cy.intercept("POST", ENDPOINTS.preview, slow).as("preview");

    // Click 1st Edit button
    cy.get(
      ":nth-child(1) > .p-stepped-list__content > .row > .u-align--right > .p-action-button"
    ).click();
    cy.findByLabelText("Country/Region:").select("Afghanistan");

    // Click 1st Save button
    cy.get(".u-align--right > :nth-child(2)").click();
    cy.wait("@preview");

    // Assert
    cy.get('[data-testid="tax"]').should("not.exist");
  });

  it("user: it should show correct VAT price", () => {
    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();
    cy.selectProducts();

    cy.login();

    cy.scrollTo("bottom");
    cy.findByRole("button", { name: "Buy now" }).click();

    // Redirected to checkout
    cy.location().should((loc) => {
      expect(loc.pathname).to.equal("/account/checkout");
    });

    cy.wait(2000);

    cy.intercept("POST", ENDPOINTS.preview, slow).as("preview");

    // Click 1st Edit button
    cy.get(
      ":nth-child(1) > .p-stepped-list__content > .row > .u-align--right > .p-action-button"
    ).click();
    cy.findByLabelText("Country/Region:").select(4); // United Kingdom

    // Click 1st Save button
    cy.get(".u-align--right > :nth-child(2)").click();
    cy.wait("@preview");

    // Assert
    cy.get('[data-testid="tax"]').should("exist");
    cy.get('[data-testid="total"]').should("exist");
  });

  it("user: clicks cancel should reset fields", () => {
    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();
    cy.selectProducts();

    cy.login();

    cy.scrollTo("bottom");
    cy.findByRole("button", { name: "Buy now" }).click();

    // Redirected to checkout
    cy.location().should((loc) => {
      expect(loc.pathname).to.equal("/account/checkout");
    });

    cy.wait(2000);

    // Click 1st Edit button
    cy.get(
      ":nth-child(1) > .p-stepped-list__content > .row > .u-align--right > .p-action-button"
    ).click();
    cy.findByLabelText("Country/Region:").select(1); // France
    cy.findByLabelText("VAT number:").clear().type("ABDCDEFG");

    // Click cancel button
    cy.get(
      ":nth-child(1) > .p-stepped-list__content > :nth-child(1) > .u-align--right > :nth-child(1)"
    ).click();

    cy.get('[data-testid="country"]').should("have.text", "United Kingdom");
    cy.get('[data-testid="vat-number"]').should("have.text", "None");

    // Click 1st Edit button
    cy.get(
      ":nth-child(1) > .p-stepped-list__content > .row > .u-align--right > .p-action-button"
    ).click();
    cy.findByLabelText("Country/Region:").select(5); // USA
    cy.findByLabelText("State:").select("Alabama");

    // Click cancel button
    cy.get(
      ":nth-child(1) > .p-stepped-list__content > :nth-child(1) > .u-align--right > :nth-child(1)"
    ).click();

    cy.get('[data-testid="country"]').should("have.text", "United Kingdom");
    cy.get('[data-testid="vat-number"]').should("have.text", "None");

    // Click 1st Edit button
    cy.get(
      ":nth-child(1) > .p-stepped-list__content > .row > .u-align--right > .p-action-button"
    ).click();
    cy.findByLabelText("Country/Region:").select("Canada");
    cy.findByLabelText("Province:").select("Alberta");

    // Click cancel button
    cy.get(
      ":nth-child(1) > .p-stepped-list__content > :nth-child(1) > .u-align--right > :nth-child(1)"
    ).click();

    cy.get('[data-testid="country"]').should("have.text", "United Kingdom");
    cy.get('[data-testid="vat-number"]').should("have.text", "None");
  });
});

context("Checkout - Your information", () => {
  it("user: clicks cancel should reset fields", () => {
    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();
    cy.selectProducts();

    cy.login();

    cy.scrollTo("bottom");
    cy.findByRole("button", { name: "Buy now" }).click();

    // Redirected to checkout
    cy.location().should((loc) => {
      expect(loc.pathname).to.equal("/account/checkout");
    });

    cy.wait(2000);

    // Click 1st Edit button
    cy.get(
      ":nth-child(3) > .p-stepped-list__content > :nth-child(1) > .u-align--right > .p-action-button"
    ).click();

    cy.findByLabelText("Name:").type("Abcd", { force: true });
    cy.findByLabelText("Address:").type("Abcd");
    cy.findByLabelText("City:").type("Abcd");
    cy.findByLabelText("Postal code:").type("Abcd");

    // Click cancel button
    cy.get(
      ":nth-child(3) > .p-stepped-list__content > :nth-child(1) > .u-align--right > :nth-child(1)"
    ).click();

    cy.get('[data-testid="customer-name"]').should("not.have.text", "Abcd");
    cy.get('[data-testid="customer-address"]').should("not.have.text", "Abcd");
    cy.get('[data-testid="customer-city"]').should("not.have.text", "Abcd");
    cy.get('[data-testid="customer-postal-code"]').should(
      "not.have.text",
      "Abcd"
    );
  });
});

context("Checkout purchase", () => {
  it("user: it should purchase", () => {
    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();
    cy.selectProducts();

    cy.login();

    cy.scrollTo("bottom");
    cy.findByRole("button", { name: "Buy now" }).click();

    // Redirected to checkout
    cy.location().should((loc) => {
      expect(loc.pathname).to.equal("/account/checkout");
    });

    cy.wait(2000);

    cy.get('[data-testid="tax"]').should("exist");
    cy.get('[data-testid="total"]').should("exist");

    cy.acceptTerms();
    cy.clickRecaptcha();

    cy.intercept("POST", ENDPOINTS.customerInfo, slow).as("customerInfo");
    cy.intercept("POST", ENDPOINTS.preview, slow).as("preview");
    cy.intercept("POST", ENDPOINTS.postPurchase, slow).as("postPurchase");
    cy.intercept("GET", ENDPOINTS.getPurchase, slow).as("getPurchase");

    cy.findByRole("button", { name: "Buy" }).click();

    cy.wait("@preview").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.wait("@postPurchase").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.wait("@getPurchase").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });

    cy.wait(2000);

    cy.url().should("include", "/pro/dashboard");
  });
});
