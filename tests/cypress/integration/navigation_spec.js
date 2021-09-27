/// <reference types="cypress" />

context("Navigation", () => {
  beforeEach(() => {
    cy.setCookie("_cookies_accepted", "all");
    cy.visit("/");
    cy.get('nav');
  });

  it("should display the navigation sections when clicked", () => {
    cy.get('nav')
    .findByRole('link', {name: /Download/i}).click();
    cy.findByText(/Xilinx Evaluation kits & SOMs/).should("be.visible");
    cy.get('nav')
    .findByRole('link', {name: /Community/i}).click();
    cy.findByText(/Ubuntu Code of Conduct/).should("be.visible");
    cy.get('nav')
    .findByRole('link', {name: /Developer/i}).click();
    cy.findByText(/Snap documentation/).should("be.visible");
    cy.get('nav')
    .findByRole('link', {name: /Enterprise/i}).click();
    cy.findByText(/What is Kubernetes/).should("be.visible");
  });
});
