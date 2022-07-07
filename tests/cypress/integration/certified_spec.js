/// <reference types="cypress" />

context("Certified search results", () => {
  beforeEach(() => {
    cy.setCookie("_cookies_accepted", "all");
  });

  it("should update results per page when pagination is selected", () => {
    cy.visit("/certified?q=dell");

    cy.findAllByLabelText("Results per page").first().select("40");
    cy.location("href", { timeout: 6000 }).should("include", "limit=40");
    cy.findByText(/results/).should("contain", "40");
  });

  it("should update results when Apply is selected", () => {
    cy.visit("/certified/laptops");

    cy.findByRole("checkbox", { name: /Dell/i }).click({ force: true });
    cy.findByRole("button", { name: /Apply/i }).click();

    cy.location("href", { timeout: 6000 }).should("include", "vendor=Dell");
    cy.findAllByText(/Dell/).should("be.visible");
  });

  it("should clear filters when clear is selected", () => {
    cy.visit("/certified/socs");

    cy.findByRole("checkbox", { name: /20.04 LTS/i }).click({ force: true });
    cy.findByRole("button", { name: /Apply/i }).click();
    cy.findByRole("button", { name: /Clear/i }).click();
    cy.findAllByRole("checkbox").should("not.be.checked");
  });

  it("should keep query string when filters are cleared", () => {
    cy.visit("/certified?q=hp");

    cy.findByRole("checkbox", { name: /20.04 LTS/i }).click({ force: true });
    cy.findByRole("button", { name: /Apply/i }).click();
    cy.findByRole("button", { name: /Clear/i }).click();
    cy.findByPlaceholderText("Search")
      .invoke("val")
      .should("include", "hp");
  });

  it("should take you to seach results page when search bar is used", () => {
    cy.visit("/certified");

    cy.findByPlaceholderText("Search").type("dell{enter}");
    cy.findByText(/results/).should("be.visible");
    cy.findAllByText(/Dell/).should("be.visible");
  });
});
