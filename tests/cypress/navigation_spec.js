/// <reference types="cypress" />

context("Navigation", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should select the navigation when clicked", () => {
    cy.get("#download").click();
    cy.get("#download").should("have.class", "is-selected");
  });
});
