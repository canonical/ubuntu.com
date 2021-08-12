/// <reference types="cypress" />

context("Navigation", () => {
  beforeEach(() => {
    cy.setCookie("_cookies_accepted", "all");
    cy.visit("/");
  });

  it("should select the navigation when clicked", () => {
    cy.get("#download").click();
    cy.get("#download").should("have.class", "is-selected");
  });
});
