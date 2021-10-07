/// <reference types="cypress" />

context("a11y", () => {
  it("/advantage has no detectable a11y violations on load", () => {
    cy.visit("/advantage");
    cy.injectAxe();
    cy.checkA11y();
  });
});
