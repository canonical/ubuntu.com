/// <reference types="cypress" />

import { getTestURL } from "../../utils";

context("/advantage", () => {
  it("header links work correctly", () => {
    const links = [
      {
        name: "Buy new subscription",
        href: "/advantage/subscribe",
      },
      { name: "Invoices", href: "/account/invoices" },
      { name: "Payment methods", href: "/account/payment-methods" },
    ];

    cy.login();

    cy.visit(getTestURL("/advantage"));
    cy.acceptCookiePolicy();

    links.forEach(({ name, href }) => {
      cy.findByRole("link", { name }).click();
      cy.url().should("include", href);
      cy.visit(getTestURL("/advantage"));
    });
  });

  it("free personal token is at the bottom of the list", () => {
    cy.login();

    cy.visit(getTestURL("/advantage"));
    cy.acceptCookiePolicy();
    cy.get("[data-test=subscription-card-content] h5")
      .last()
      .should("have.text", "Free Personal Token");
  });
});
