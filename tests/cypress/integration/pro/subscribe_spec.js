/// <reference types="cypress" />

import { getRandomEmail, slowDownResponse } from "../../utils";

Cypress.config("defaultCommandTimeout", 10000);

context("/pro/subscribe", () => {
  it("should redirect to checkout page when pressing 'Buy now'", () => {
    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();
    cy.selectProducts();
    cy.scrollTo("bottom");
    cy.findByRole("button", { name: "Buy now" }).click();

    // Redirected to checkout
    cy.location().should((loc) => {
      expect(loc.pathname).to.equal("/account/checkout");
    });
  });
});

context("/pro/subscribe trial", () => {
  it("should show trial badge", () => {
    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();
    cy.selectProducts();
    cy.scrollTo("bottom");
    cy.get("#summary-section")
      .contains("Free trial available")
      .should("be.visible");
    cy.findByRole("button", { name: "Buy now" }).click();

    // Redirected to checkout
    cy.location().should((loc) => {
      expect(loc.pathname).to.equal("/account/checkout");
    });

    // cy.get(".checkout-container").scrollTo("bottom");
    // cy.findByText("Use free trial month").should("be.visible");
  });

  it("should not show trial badge", () => {
    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();
    cy.selectProducts(1, "desktop", "uaia", "advanced");
    cy.scrollTo("bottom");
    cy.get("#summary-section")
      .contains("Free trial available")
      .should("not.exist");
    cy.findByRole("button", { name: "Buy now" }).click();

    // Redirected to checkout
    cy.location().should((loc) => {
      expect(loc.pathname).to.equal("/account/checkout");
    });

    // cy.get(".checkout-container").scrollTo("bottom");
    // cy.findByText("Use free trial month").should("not.exist");
  });
});
