/// <reference types="cypress" />

import { getTestURL } from "../../utils";

context("/advantage", () => {
  beforeEach(() => {
    cy.login();
    cy.visit(getTestURL("/advantage"));
    cy.acceptCookiePolicy();
  });

  it("header links work correctly", () => {
    const links = [
      {
        name: "Buy new subscription",
        href: "/advantage",
      },
      { name: "Invoices", href: "/account/invoices" },
      { name: "Payment methods", href: "/account/payment-methods" },
    ];

    links.forEach(({ name, href }) => {
      cy.findByRole("link", { name }).click();
      cy.url().should("include", href);
      cy.visit(getTestURL("/advantage"));
    });
  });

  it("free personal token is at the bottom of the list", () => {
    cy.get("[data-test=subscription-card-content] h5")
      .last()
      .should("have.text", "Free Personal Token");
  });

  it("sends a correct request when resizing a subscription", () => {
    cy.intercept("POST", "advantage/subscribe*", {}).as("subscribe");

    cy.get("[data-test=card-machines]")
      .first()
      .click()
      .invoke("text")
      .then((numberOfMachines) => {
        const newNumberOfMachines = Number(numberOfMachines) + 1;
        cy.findByRole("button", { name: "Edit subscription…" }).click();
        cy.findByLabelText("Number of machines").should(
          "have.value",
          numberOfMachines
        );

        cy.findByRole("button", { name: "Resize" }).should("be.disabled");
        cy.findByLabelText("Number of machines")
          .type("{uparrow}")
          .trigger("change");
        cy.findByRole("button", { name: "Resize" }).click();

        cy.wait("@subscribe").then((interception) => {
          expect(interception.request.body.products).to.have.length(1);
          expect(interception.request.body.resizing).to.equal(true);
          expect(interception.request.body.products[0].quantity).to.equal(
            newNumberOfMachines
          );
        });
      });
  });
});
