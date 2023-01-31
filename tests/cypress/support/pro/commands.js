import "@testing-library/cypress/add-commands";

Cypress.Commands.add(
  "fillCountryVAT",
  (country = "AU", vat = "", state = "") => {
    cy.findByLabelText("Country/Region:")
      .then(($select) => {
        $select.val(country);
      })
      .parent()
      .trigger("change");
    if (state) {
      cy.findByLabelText("State:").select(state);
    }
    cy.wait(1000);

    cy.get(".checkout-container").then(($form) => {
      if ($form.find("#VATNumber").length > 0) {
        if (vat) {
          cy.findByLabelText("VAT number:").clear().type(vat);
        } else {
          cy.findByLabelText("VAT number:").clear();
        }
      }
    });

    // Click save
    cy.get(".p-stepped-list--detailed > :nth-child(1) button")
      .contains("Save")
      .click();
    cy.wait(2000);
  }
);

Cypress.Commands.add(
  "fillInEmail",
  (email = Cypress.env("UBUNTU_USERNAME")) => {
    cy.findByLabelText("Your email address:").type(email, { force: true });
  }
);

Cypress.Commands.add("fillInCardDetails", (cardNumber = "4242424242424242") => {
  cy.get("#card-element").within(() => {
    return cy
      .getWithinIframe(`[placeholder="Card number"]`)
      .clear({ force: true })
      .type(cardNumber);
  });

  cy.get("#card-element").within(() => {
    return cy.getWithinIframe(`[placeholder="MM / YY"]`).clear().type("1230");
  });

  cy.get("#card-element").within(() => {
    return cy.getWithinIframe(`[placeholder="CVC"]`).clear().type("123");
  });

  cy.get("#card-element").within(() => {
    return cy.getWithinIframe(`[placeholder="ZIP"]`).clear().type("12345");
  });
});

Cypress.Commands.add("fillInCustomerInfo", () => {
  cy.findByLabelText("Name:").type("Joe Doe", { force: true });
  cy.findByLabelText("Organisation:").type("AB Studios");
  cy.findByLabelText("Address:").type("Address Road");
  cy.findByLabelText("Postal code:").type("AB0 0AB");
  cy.findByLabelText("City:").type("Citty");
});

Cypress.Commands.add("fillInCustomerInfo", () => {
  cy.findByLabelText("Name:").type("Joe Doe", { force: true });
  cy.findByLabelText("Organisation:").type("AB Studios");
  cy.findByLabelText("Address:").type("Address Road");
  cy.findByLabelText("Postal code:").type("AB0 0AB");
  cy.findByLabelText("City:").type("Citty");
});

Cypress.Commands.add("acceptTerms", () => {
  cy.findByLabelText(/I agree to the Ubuntu Pro service terms/).click({
    // Need to use { force: true } because the actual input element (radio button)
    // that the label is for is invisible (we use our own styles)
    // and cypress complains (it would usually indicate an issue, in our case it's intentional).
    force: true,
  });
  cy.findByLabelText(/I agree to the Ubuntu Pro description/).click({
    force: true,
  });
});

Cypress.Commands.add(
  "selectProducts",
  (
    quantity = 1,
    machineType = "physical",
    coverage = "uaia",
    supportType = "",
    supportInterval = "Weekday"
  ) => {
    cy.get(`[value='${machineType}']`).check({ force: true });
    cy.get("#quantity-input").clear().type(quantity);
    cy.get(`[value='${coverage}']`).check({ force: true });
    if (supportType) {
      cy.get(`[value='${supportType}']`).check({ force: true });

      if (supportInterval) {
        if (supportInterval == "24/7") {
          supportInterval = "\\32 4\\/7";
        }

        cy.get(`#${supportInterval}`).click();
      }
    }
  }
);
