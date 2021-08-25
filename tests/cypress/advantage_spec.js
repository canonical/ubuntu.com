/// <reference types="cypress" />

context("Advantage", () => {
  beforeEach(() => {
    cy.on("uncaught:exception", () => {
      return false;
    });
  });

  it("should display the modal when pressing 'Buy now'", () => {
    cy.visit("/advantage/subscribe?test_backend=true");
    cy.findByText("Accept all and visit site").click();
    cy.findByText("Complete purchase").should("not.be.visible");
    cy.scrollTo("bottom");
    cy.findByLabelText(/Software and security updates only/).click({
      force: true,
    });
    cy.findByText("Buy now").click();
    cy.findByText("Complete purchase").should("be.visible");
  });
});
