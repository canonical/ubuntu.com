/// <reference types="cypress" />

import { getTestURL } from "./utils";

context("Advantage", () => {
  it("should display the modal when pressing 'Buy now'", () => {
    cy.visit(getTestURL("/advantage/subscribe"));
    cy.findByText("Accept all and visit site").click();
    cy.findByText("Complete purchase").should("not.be.visible");
    cy.scrollTo("bottom");
    cy.findByLabelText(/Software and security updates only/).click({
      // Need to use { force: true } because the actual input element (radio button)
      // that the label is for is invisible (we use our own styles)
      // and cypress complains (it would usually indicate an issue, in our case it's intentional).
      force: true,
    });
    cy.findByText("Buy now").click();
    cy.findByText("Complete purchase").should("be.visible");
  });
});
