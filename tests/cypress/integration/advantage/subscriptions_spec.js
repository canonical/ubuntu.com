/// <reference types="cypress" />

context("/pro/dashboard", () => {
  it("header links work correctly", () => {
    const links = [
      {
        name: "Buy new subscription",
        href: "/pro/subscribe",
      },
      { name: "Invoices", href: "/account/invoices" },
      { name: "Payment methods", href: "/account/payment-methods" },
    ];

    cy.login();
    cy.visit("/pro/dashboard");
    cy.acceptCookiePolicy();

    links.forEach(({ name, href }) => {
      cy.findByRole("link", { name }).click();
      cy.url().should("include", href);
      cy.visit("/pro/dashboard");
    });
  });

  it("free personal token is at the bottom of the list", () => {
    cy.login();
    cy.visit("/pro/dashboard");
    cy.acceptCookiePolicy();

    cy.get("[data-test=subscription-card-content] h5")
      .last()
      .should("have.text", "Free Personal Token");
  });

  it.skip("sends a correct request when resizing a subscription", () => {
    cy.login();
    cy.visit("/pro");
    cy.acceptCookiePolicy();

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

  it.skip("prevents a user from creating disallowed combinations of features", () => {
    cy.login();

    cy.visit("/pro");
    cy.acceptCookiePolicy();
    cy.findByLabelText("FIPS").should("be.disabled");
    cy.findByLabelText("Livepatch").should("be.checked").click({ force: true });
    cy.findByLabelText("FIPS").should("not.be.disabled");

    cy.findByLabelText("FIPS").click({ force: true });
    cy.findByLabelText("Livepatch").should("be.disabled");
  });

  it.skip("saves changes to feature settings successfully", () => {
    cy.login();

    cy.visit("/pro");
    cy.acceptCookiePolicy();

    cy.findByLabelText("Livepatch").should("be.checked").click({ force: true });

    cy.findByRole("button", { name: "Save" }).click();
    cy.reload();

    cy.findByLabelText("Livepatch")
      .should("not.be.checked")
      .click({ force: true });

    cy.findByRole("button", { name: "Save" }).click();

    cy.findByRole("button", { name: "Save" }).should("not.exist");
  });
});
