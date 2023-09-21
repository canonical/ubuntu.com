/// <reference types="cypress" />

context("Navigation", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.acceptCookiePolicy();
  });

  it("should display the navigation sections when clicked", () => {
    cy.get('nav')
    .findByRole('link', {name: /Download/i}).click();
    cy.findByRole('link', { name: /AMD Evaluation kits & SOMs/ })
      .should("be.visible");
    cy.get('nav')
    .findByRole('link', {name: /Community/i}).click();
    cy.findByRole("link", { name: /Ubuntu Code of Conduct/ })
      .should("be.visible");
    cy.get('nav')
    .findByRole('link', {name: /Developer/i}).click();
    cy.findByRole("link", { name: /Snap documentation/ })
      .should("be.visible");
    cy.get('nav')
    .findByRole('link', {name: /Enterprise/i}).click();
    cy.findAllByRole('link', {name: /What is Kubernetes/}).first()
      .should("be.visible");
  });
});
