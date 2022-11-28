/// <reference types="cypress" />

import { getRandomEmail } from "../../utils";

Cypress.config("defaultCommandTimeout", 10000);

const slowDownResponse = (req) => {
  req.on("response", (res) => {
    // throttle the response to reduce test flakiness
    // this makes the UI loading & disabled states appear for longer
    res.setThrottle(100);
  });
};

const fillInCardDetails = () => {
  cy.get("#card-element").within(() => {
    return cy
      .getWithinIframe(`[placeholder="Card number"]`)
      .type("4242424242424242");
  });

  cy.get("#card-element").within(() => {
    return cy.getWithinIframe(`[placeholder="MM / YY"]`).type("1230");
  });

  cy.get("#card-element").within(() => {
    return cy.getWithinIframe(`[placeholder="CVC"]`).type("123");
  });

  cy.get("#card-element").within(() => {
    return cy.getWithinIframe(`[placeholder="ZIP"]`).type("12345");
  });
};

const fillInUserDetails = (email) => {
  cy.findByLabelText("Email my receipt to:").type(email, { force: true });
  cy.findByLabelText("Name:").type("Test Name", { force: true });
  cy.findByLabelText("Organisation:").type("Abbey Road Studios");
  cy.findByLabelText("Address:").type("Abbey Road");
  cy.findByLabelText("Postal code:").type("NW8 9AY");
  cy.findByLabelText("Country/Region:").select("Austria");
  cy.findByLabelText("City:").type("London");
};

const completeFirstStep = (email = Cypress.env("UBUNTU_USERNAME")) => {
  cy.wait(2000)
  fillInCardDetails();
  fillInUserDetails(email);
  cy.clickRecaptcha();
  cy.findByRole("button", { name: "Next step" }).click();
};

context("/pro/subscribe", () => {
  it("should display the modal when pressing 'Buy now'", () => {
    cy.visit("/pro/subscribe");
    cy.findByText("Accept all and visit site").click();
    cy.findByRole("dialog").should("not.exist");
    cy.scrollTo("bottom");
    cy.findByRole("button", { name: "Buy now" }).click();
    cy.findByRole("dialog").should("be.visible");
    cy.findByText("Cancel").click();
  });

  it("should be able to start a free trial", () => {
    const randomEmail = getRandomEmail();

    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();

    cy.findByRole("dialog").should("not.exist");
    cy.scrollTo("bottom");
    cy.findByRole("button", { name: "Buy now" }).click();
    cy.findByRole("dialog").should("be.visible");

    // fill in the form
    completeFirstStep(randomEmail);

    // wait for request to be sent
    cy.intercept("POST", "/account/purchase-account*").as("purchaseAccount");
    cy.intercept("POST", "/account/customer-info*").as("customerInfo");
    cy.intercept("POST", "/pro/subscribe/preview*").as("preview");

    // assert that a matching request has been made
    cy.wait("@purchaseAccount");
    cy.wait("@customerInfo");
    cy.wait("@preview");

    // test for contents of 2nd step
    cy.findByText("$600.00");

    cy.findByText("Use free trial month").click();
    cy.findByLabelText(/I agree to the Ubuntu Pro service terms/).click({
      // Need to use { force: true } because the actual input element (radio button)
      // that the label is for is invisible (we use our own styles)
      // and cypress complains (it would usually indicate an issue, in our case it's intentional).
      force: true,
    });
    cy.findByLabelText(/I agree to the Ubuntu Pro description/).click({
      force: true,
    });

    cy.intercept("POST", "/pro/subscribe*", slowDownResponse).as("trial");

    cy.findByRole("button", { name: "Buy" })
      .click()
      .should("be.disabled");

    // The trial call is made
    cy.wait("@trial").then((interception) => {
      expect(interception.request.body.trialling).to.be.true;
    });

    // The user lands on the thank you page
    cy.findByText("Thanks for your purchase");
    cy.findByText(`We’ve sent your invoice to ${randomEmail}`);
  });

  it("should be able to buy a subscription", () => {
    const randomEmail = getRandomEmail();

    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();
    cy.findByRole("dialog").should("not.exist");
    cy.scrollTo("bottom");
    cy.findByRole("button", { name: "Buy now" }).click();
    cy.findByRole("dialog").should("be.visible");

    // fill in the form
    completeFirstStep(randomEmail);

    // wait for request to be sent
    cy.intercept("POST", "/account/purchase-account*").as("purchaseAccount");
    cy.intercept("POST", "/account/customer-info*").as("customerInfo");
    cy.intercept("POST", "/pro/subscribe/preview*").as("preview");

    // assert that a matching request has been made
    cy.wait("@purchaseAccount");
    cy.wait("@customerInfo");
    cy.wait("@preview");

    // test for contents of 2nd step
    cy.findByText("$600.00");

    cy.findByText("Pay now").click();
    cy.findByLabelText(/I agree to the Ubuntu Pro service terms/).click({
      // Need to use { force: true } because the actual input element (radio button)
      // that the label is for is invisible (we use our own styles)
      // and cypress complains (it would usually indicate an issue, in our case it's intentional).
      force: true,
    });
    cy.findByLabelText(/I agree to the Ubuntu Pro description/).click({
      force: true,
    });

    cy.intercept("POST", "/pro/subscribe*", slowDownResponse).as(
      "purchase"
    );
    cy.intercept("GET", "/account/purchases/*").as("pendingPurchase");

    cy.findByRole("button", { name: "Buy" })
      .click()
      .should("be.disabled");

    // The purchase call is made
    cy.wait("@purchase").then((interception) => {
      expect(interception.request.body.trialling).to.be.undefined;
    });

    cy.wait("@pendingPurchase");

    // The user lands on the thank you page
    cy.findByText("Thanks for your purchase");
    cy.findByText(`We’ve sent your invoice to ${randomEmail}`);
  });

  it.skip("redirects logged-in user to /pro on after successful purchase", () => {
    cy.intercept("POST", "/pro/subscribe*").as("purchase");
    cy.intercept("GET", "/pro/purchases/*").as("pendingPurchase");

    cy.login();
    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();

    cy.scrollTo("bottom");
    cy.findByText("Software and security updates only").click();
    cy.findByText("Buy now").click();
    cy.findByRole("dialog").should("be.visible");

    cy.findByLabelText(/I agree to the Ubuntu Advantage service terms/).click({
      force: true,
    });
    cy.findByRole("button", { name: "Buy" }).click();

    cy.wait("@purchase");
    cy.wait("@pendingPurchase");

    cy.url().should("include", "/pro");
  });
});
