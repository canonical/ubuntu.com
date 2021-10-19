/// <reference types="cypress" />

import { getTestURL, getRandomEmail } from "../utils";

Cypress.config("defaultCommandTimeout", 10000);

context("Advantage", () => {
  it("should display the modal when pressing 'Buy now'", () => {
    cy.visit(getTestURL("/advantage/subscribe"));
    cy.findByText("Accept all and visit site").click();
    cy.findByRole("dialog").should("not.exist");
    cy.scrollTo("bottom");
    cy.findByLabelText(/Software and security updates only/).click({
      // Need to use { force: true } because the actual input element (radio button)
      // that the label is for is invisible (we use our own styles)
      // and cypress complains (it would usually indicate an issue, in our case it's intentional).
      force: true,
    });
    cy.findByText("Buy now").click();
    cy.findByRole("dialog").should("be.visible");
    cy.findByText("Cancel").click();
  });

  it("should be able to start a free trial", () => {
    const randomEmail = getRandomEmail();

    cy.visit("/advantage/subscribe?test_backend=true");
    cy.acceptCookiePolicy();
    cy.findByRole("dialog").should("not.exist");
    cy.scrollTo("bottom");
    cy.findByLabelText(/Software and security updates only/).click({
      force: true,
    });
    cy.findByText("Buy now").click();
    cy.findByRole("dialog").should("be.visible");

    // fill in the form
    // fill in card information
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

    // fill in the rest of the form
    cy.findByLabelText("Email my receipt to:").type(randomEmail);
    cy.findByLabelText("Name:").type("Test Name");
    cy.findByLabelText("Organisation:").type("Abbey Road Studios");
    cy.findByLabelText("Address:").type("Abbey Road");
    cy.findByLabelText("Postal code:").type("NW8 9AY");
    cy.findByLabelText("Country/Region:").select("Austria");
    cy.findByLabelText("City:").type("London");

    cy.clickRecaptcha();
    
    cy.findByRole("button", { name: "Next step" }).click();

    // wait for request to be sent
    cy.intercept("POST", "/advantage/purchase-account*").as("purchaseAccount");
    cy.intercept("POST", "/advantage/customer-info*").as("customerInfo");
    cy.intercept("POST", "/advantage/subscribe/preview*").as("preview");

    // assert that a matching request has been made
    cy.wait("@purchaseAccount");
    cy.wait("@customerInfo");
    cy.wait("@preview");

    // test for contents of 2nd step
    cy.findByText("1 x $225.00");

    cy.findByText("Use free trial month").click();
    cy.findByLabelText(/I agree to the Ubuntu Advantage service terms/).click({
      // Need to use { force: true } because the actual input element (radio button)
      // that the label is for is invisible (we use our own styles)
      // and cypress complains (it would usually indicate an issue, in our case it's intentional).
      force: true,
    });

    cy.intercept("POST", "/advantage/subscribe*").as("trial");

    cy.findByRole("button", { name: "Buy" })
      .should(() => {
        expect(
          JSON.parse(localStorage.getItem("ua-subscribe-state"))
        ).to.have.keys("form", "ui");
      })
      .click()
      .should("be.disabled")
      .should(() => {
        expect(JSON.parse(localStorage.getItem("ua-subscribe-state"))).to.be
          .null;
      });

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

    cy.visit("/advantage/subscribe?test_backend=true");
    cy.acceptCookiePolicy();
    cy.findByRole("dialog").should("not.exist");
    cy.scrollTo("bottom");
    cy.findByLabelText(/Software and security updates only/).click({
      force: true,
    });
    cy.findByText("Buy now").click();
    cy.findByRole("dialog").should("be.visible");

    // fill in the form
    // fill in card information
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

    // fill in the rest of the form
    cy.findByLabelText("Email my receipt to:").type(randomEmail);
    cy.findByLabelText("Name:").type("Test Name");
    cy.findByLabelText("Organisation:").type("Abbey Road Studios");
    cy.findByLabelText("Address:").type("Abbey Road");
    cy.findByLabelText("Postal code:").type("NW8 9AY");
    cy.findByLabelText("Country/Region:").select("Austria");
    cy.findByLabelText("City:").type("London");

    cy.clickRecaptcha();

    cy.findByRole("button", { name: "Next step" }).click();

    // wait for request to be sent
    cy.intercept("POST", "/advantage/purchase-account*").as("purchaseAccount");
    cy.intercept("POST", "/advantage/customer-info*").as("customerInfo");
    cy.intercept("POST", "/advantage/subscribe/preview*").as("preview");

    // assert that a matching request has been made
    cy.wait("@purchaseAccount");
    cy.wait("@customerInfo");
    cy.wait("@preview");

    // test for contents of 2nd step
    cy.findByText("1 x $225.00");

    cy.findByText("Pay now").click();
    cy.findByLabelText(/I agree to the Ubuntu Advantage service terms/).click({
      // Need to use { force: true } because the actual input element (radio button)
      // that the label is for is invisible (we use our own styles)
      // and cypress complains (it would usually indicate an issue, in our case it's intentional).
      force: true,
    });

    cy.intercept("POST", "/advantage/subscribe*").as("purchase");
    cy.intercept("GET", "/advantage/purchases/*").as("pendingPurchase");

    cy.findByRole("button", { name: "Buy" })
      .should(() => {
        expect(
          JSON.parse(localStorage.getItem("ua-subscribe-state"))
        ).to.have.keys("form", "ui");
      })
      .click()
      .should("be.disabled")
      .should(() => {
        expect(JSON.parse(localStorage.getItem("ua-subscribe-state"))).to.be
          .null;
      });

    // The purchase call is made
    cy.wait("@purchase").then((interception) => {
      expect(interception.request.body.trialling).to.be.undefined;
    });

    cy.wait("@pendingPurchase");

    // The user lands on the thank you page
    cy.findByText("Thanks for your purchase");
    cy.findByText(`We’ve sent your invoice to ${randomEmail}`);
  });
});
