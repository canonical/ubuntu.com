/// <reference types="cypress" />

import { getRandomEmail, slowDownResponse as slow } from "../../utils";

Cypress.config("defaultCommandTimeout", 10000);

const ENDPOINTS = {
  calculate: "/account/canonical-ua/purchase/calculate*",
  postPurchase: "/pro/purchase*",
  preview: "/pro/purchase/preview*",
  ensure: "/account/purchase-account*",
  customerInfo: "/account/customer-info*",
  getPurchase: "/account/purchases_v2/*",
};

context("Checkout - Step 1", () => {
  it("guest: it should show correct non-VAT price", () => {
    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();
    cy.selectProducts(2);
    cy.findByRole("button", { name: "Buy now" }).click();

    // Redirected to checkout
    cy.location().should((loc) => {
      expect(loc.pathname).to.equal("/account/checkout");
    });

    cy.wait(2000);

    cy.intercept("POST", ENDPOINTS.calculate).as("calculate");
    cy.fillCountryVAT("AF");
    cy.wait("@calculate");
    cy.get('[data-testid="subtotal"]').should("have.text", "$1,000.00");
  });

  it("guest: it should show correct VAT price", () => {
    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();
    cy.selectProducts(2);
    cy.findByRole("button", { name: "Buy now" }).click();

    // Redirected to checkout
    cy.location().should((loc) => {
      expect(loc.pathname).to.equal("/account/checkout");
    });

    cy.wait(2000);

    cy.intercept("POST", ENDPOINTS.calculate).as("calculate");
    cy.fillCountryVAT("GB", "GB001122334");
    cy.wait("@calculate");
    cy.get('[data-testid="total"]').should("have.text", "$1,200.00");
  });

  it("guest: it should refresh the price on change", () => {
    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();
    cy.selectProducts(2);
    cy.findByRole("button", { name: "Buy now" }).click();

    // Redirected to checkout
    cy.location().should((loc) => {
      expect(loc.pathname).to.equal("/account/checkout");
    });

    cy.wait(2000);

    cy.intercept("POST", ENDPOINTS.calculate).as("calculate");
    cy.fillCountryVAT("GB", "GB001122334");
    cy.wait("@calculate");
    cy.get('[data-testid="total"]').should("have.text", "$1,200.00");

    // Click 1st Edit button
    cy.get(
      ":nth-child(1) > .p-stepped-list__content > .row > .u-align--right > .p-action-button"
    ).click();
    cy.fillCountryVAT("GB");
    cy.wait("@calculate");
    cy.get('[data-testid="total"]').should("have.text", "$1,200.00");

    // Click 1st Edit button
    cy.get(
      ":nth-child(1) > .p-stepped-list__content > .row > .u-align--right > .p-action-button"
    ).click();
    cy.fillCountryVAT("FR");
    cy.wait("@calculate");
    cy.get('[data-testid="total"]').should("have.text", "$1,200.00");

    // Click 1st Edit button
    cy.get(
      ":nth-child(1) > .p-stepped-list__content > .row > .u-align--right > .p-action-button"
    ).click();
    cy.fillCountryVAT("FR", "FR12345678901");
    cy.wait("@calculate");
    cy.get('[data-testid="subtotal"]').should("have.text", "$1,000.00");
  });

  it("user: it should show correct non-VAT price", () => {
    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();
    cy.selectProducts();

    cy.login();
    cy.wait(2000);

    cy.scrollTo("bottom");
    cy.findByRole("button", { name: "Buy now" }).click();

    // Redirected to checkout
    cy.location().should((loc) => {
      expect(loc.pathname).to.equal("/account/checkout");
    });

    cy.wait(2000);

    cy.intercept("POST", ENDPOINTS.preview, slow).as("preview");

    // Click 1st Edit button
    cy.get(
      ":nth-child(1) > .p-stepped-list__content > .row > .u-align--right > .p-action-button"
    ).click();
    cy.findByLabelText("Country/Region:").select("Afghanistan");

    // Click 1st Save button
    cy.get(
      ":nth-child(1) > .p-stepped-list__content > :nth-child(1) > .u-align--right > .p-action-button"
    ).click();
    cy.wait("@preview");

    // Assert
    cy.get('[data-testid="tax"]').should("not.exist");
  });

  it("user: it should show correct VAT price", () => {
    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();
    cy.selectProducts();

    cy.login();
    cy.wait(2000);

    cy.scrollTo("bottom");
    cy.findByRole("button", { name: "Buy now" }).click();

    // Redirected to checkout
    cy.location().should((loc) => {
      expect(loc.pathname).to.equal("/account/checkout");
    });

    cy.wait(2000);

    cy.intercept("POST", ENDPOINTS.preview, slow).as("preview");

    // Click 1st Edit button
    cy.get(
      ":nth-child(1) > .p-stepped-list__content > .row > .u-align--right > .p-action-button"
    ).click();
    cy.findByLabelText("Country/Region:").select(4); // United Kingdom
    cy.findByLabelText("VAT number:").clear().type("GB0033224455");

    // Click 1st Save button
    cy.get(
      ":nth-child(1) > .p-stepped-list__content > :nth-child(1) > .u-align--right > .p-action-button"
    ).click();
    cy.wait("@preview");

    // Assert
    cy.get('[data-testid="tax"]').should("exist");
    cy.get('[data-testid="total"]').should("exist");
  });
});

context("Checkout purchase", () => {
  it("guest: it should start trial", () => {
    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();
    cy.selectProducts();
    cy.scrollTo("bottom");
    cy.findByRole("button", { name: "Buy now" }).click();

    // Redirected to checkout
    cy.location().should((loc) => {
      expect(loc.pathname).to.equal("/account/checkout");
    });

    cy.wait(2000);

    cy.intercept("POST", ENDPOINTS.calculate).as("calculate");
    cy.fillCountryVAT("GB");
    cy.wait("@calculate");

    cy.get('[data-testid="tax"]').should("have.text", "$100.00");
    cy.get('[data-testid="total"]').should("have.text", "$600.00");

    const randomEmail = getRandomEmail();
    cy.fillInEmail(randomEmail);

    cy.fillInCardDetails();
    cy.fillInCustomerInfo();

    cy.findByLabelText("Use free trial month").click({ force: true });

    cy.acceptTerms();
    cy.clickRecaptcha();

    cy.intercept("POST", ENDPOINTS.ensure, slow).as("ensure");
    cy.intercept("POST", ENDPOINTS.customerInfo, slow).as("customerInfo");
    cy.intercept("POST", ENDPOINTS.preview, slow).as("preview");
    cy.intercept("POST", ENDPOINTS.postPurchase, slow).as("postPurchase");
    cy.intercept("GET", ENDPOINTS.getPurchase, slow).as("getPurchase");

    cy.findByRole("button", { name: "Buy" }).click().should("be.disabled");

    cy.wait("@ensure").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.wait("@customerInfo").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.wait("@preview").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.wait("@postPurchase").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.wait("@getPurchase").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });

    cy.url().should("include", "/pro/subscribe/thank-you");
    cy.findByText("Thanks for your purchase");
    cy.findByText(`We’ve sent your invoice to ${randomEmail}`);
  });

  it("guest: it should purchase", () => {
    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();
    cy.selectProducts();
    cy.scrollTo("bottom");
    cy.findByRole("button", { name: "Buy now" }).click();

    // Redirected to checkout
    cy.location().should((loc) => {
      expect(loc.pathname).to.equal("/account/checkout");
    });

    cy.wait(2000);

    cy.intercept("POST", ENDPOINTS.calculate).as("calculate");
    cy.fillCountryVAT();
    cy.wait("@calculate");

    cy.get('[data-testid="subtotal"]').should("have.text", "$500.00");

    const randomEmail = getRandomEmail();
    cy.fillInEmail(randomEmail);

    cy.fillInCardDetails();
    cy.fillInCustomerInfo();

    cy.findByLabelText("Pay now").click({ force: true });

    cy.acceptTerms();
    cy.clickRecaptcha();

    cy.intercept("POST", ENDPOINTS.ensure, slow).as("ensure");
    cy.intercept("POST", ENDPOINTS.customerInfo, slow).as("customerInfo");
    cy.intercept("POST", ENDPOINTS.preview, slow).as("preview");
    cy.intercept("POST", ENDPOINTS.postPurchase, slow).as("postPurchase");
    cy.intercept("GET", ENDPOINTS.getPurchase, slow).as("getPurchase");

    cy.findByRole("button", { name: "Buy" }).click().should("be.disabled");

    cy.wait("@ensure").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.wait("@customerInfo").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.wait("@preview").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.wait("@postPurchase").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.wait("@getPurchase").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });

    cy.url().should("include", "/pro/subscribe/thank-you");
    // The user lands on the thank you page
    cy.findByText("Thanks for your purchase");
    cy.findByText(`We’ve sent your invoice to ${randomEmail}`);
  });

  it("user(logged out): should be able to login and purchase", () => {
    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();
    cy.selectProducts();
    cy.scrollTo("bottom");
    cy.findByRole("button", { name: "Buy now" }).click();

    // Redirected to checkout
    cy.location().should((loc) => {
      expect(loc.pathname).to.equal("/account/checkout");
    });

    cy.wait(2000);

    cy.intercept("POST", ENDPOINTS.calculate).as("calculate");
    cy.fillCountryVAT("GB");
    cy.wait("@calculate");

    cy.findByLabelText("Use free trial month").should("exist");

    // Mimic "Sign in with Ubuntu One" click()
    cy.login();

    // logged in user had already purchased should not have option to trial
    cy.findByLabelText("Use free trial month").should("not.exist");

    // Rest should proceed as a normal login purchase
    cy.wait(2000);
    cy.acceptTerms();
    cy.clickRecaptcha();

    cy.intercept("POST", ENDPOINTS.customerInfo, slow).as("customerInfo");
    cy.intercept("POST", ENDPOINTS.preview, slow).as("preview");
    cy.intercept("POST", ENDPOINTS.postPurchase, slow).as("postPurchase");
    cy.intercept("GET", ENDPOINTS.getPurchase, slow).as("getPurchase");

    cy.findByRole("button", { name: "Buy" }).click().should("be.disabled");

    cy.wait("@customerInfo").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.wait("@preview").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.wait("@postPurchase").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.wait("@getPurchase").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });

    cy.wait(2000);

    cy.url().should("include", "/pro/dashboard");
  });

  it("user: it should purchase", () => {
    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();
    cy.selectProducts();

    cy.login();
    cy.wait(2000);

    cy.scrollTo("bottom");
    cy.findByRole("button", { name: "Buy now" }).click();

    // Redirected to checkout
    cy.location().should((loc) => {
      expect(loc.pathname).to.equal("/account/checkout");
    });

    cy.wait(2000);

    cy.get('[data-testid="tax"]').should("exist");
    cy.get('[data-testid="total"]').should("exist");

    cy.acceptTerms();
    cy.clickRecaptcha();

    cy.intercept("POST", ENDPOINTS.customerInfo, slow).as("customerInfo");
    cy.intercept("POST", ENDPOINTS.preview, slow).as("preview");
    cy.intercept("POST", ENDPOINTS.postPurchase, slow).as("postPurchase");
    cy.intercept("GET", ENDPOINTS.getPurchase, slow).as("getPurchase");

    cy.findByRole("button", { name: "Buy" }).click().should("be.disabled");

    cy.wait("@customerInfo").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.wait("@preview").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.wait("@postPurchase").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.wait("@getPurchase").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });

    cy.wait(2000);

    cy.url().should("include", "/pro/dashboard");
  });
});

context("Checkout purchase errors", () => {
  it("guest: should get card error when purchasing with invalid card and retrying", () => {
    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();
    cy.selectProducts();
    cy.scrollTo("bottom");
    cy.findByRole("button", { name: "Buy now" }).click();

    // Redirected to checkout
    cy.location().should((loc) => {
      expect(loc.pathname).to.equal("/account/checkout");
    });

    cy.wait(2000);

    cy.intercept("POST", ENDPOINTS.calculate).as("calculate");
    cy.fillCountryVAT("GB");
    cy.wait("@calculate");

    cy.get('[data-testid="tax"]').should("have.text", "$100.00");
    cy.get('[data-testid="total"]').should("have.text", "$600.00");

    const randomEmail = getRandomEmail();
    cy.fillInEmail(randomEmail);

    cy.fillInCardDetails("4000000000000002");
    cy.fillInCustomerInfo();

    cy.findByLabelText("Pay now").click({ force: true });

    cy.acceptTerms();
    cy.clickRecaptcha();

    cy.intercept("POST", ENDPOINTS.ensure, slow).as("ensure");
    cy.intercept("POST", ENDPOINTS.customerInfo, slow).as("customerInfo");
    cy.intercept("POST", ENDPOINTS.preview, slow).as("preview");
    cy.intercept("POST", ENDPOINTS.postPurchase, slow).as("postPurchase");
    cy.intercept("GET", ENDPOINTS.getPurchase, slow).as("getPurchase");

    cy.findByRole("button", { name: "Buy" }).click().should("be.disabled");

    cy.wait("@ensure").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.wait("@customerInfo").then((interception) => {
      expect(interception.response.statusCode).to.equal(400);
      expect(interception.response.body).to.have.any.keys("errors");
    });

    cy.scrollTo("top");
    cy.get(".p-notification--negative").should("be.visible");

    // user reattempts
    cy.fillInCardDetails("4242424242424242");
    cy.acceptTerms();
    cy.clickRecaptcha();

    cy.findByRole("button", { name: "Buy" }).click().should("be.disabled");

    cy.wait("@preview").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.wait("@postPurchase").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    cy.wait("@getPurchase").then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });

    cy.url().should("include", "/pro/subscribe/thank-you");
    cy.findByText("Thanks for your purchase");
    cy.findByText(`We’ve sent your invoice to ${randomEmail}`);
  });

  it("user(logged out): cannot purchase with existing account", () => {
    cy.visit("/pro/subscribe");
    cy.acceptCookiePolicy();
    cy.selectProducts();
    cy.scrollTo("bottom");
    cy.findByRole("button", { name: "Buy now" }).click();

    cy.intercept("POST", ENDPOINTS.calculate).as("calculate");
    cy.fillCountryVAT();
    cy.wait("@calculate");

    cy.get('[data-testid="subtotal"]').should("have.text", "$500.00");

    // defaults to Peter's email
    cy.fillInEmail();
    cy.fillInCardDetails();
    cy.fillInCustomerInfo();

    cy.findByLabelText("Pay now").click({ force: true });

    cy.acceptTerms();
    cy.clickRecaptcha();

    cy.intercept("POST", ENDPOINTS.ensure, slow).as("ensure");

    cy.findByRole("button", { name: "Buy" }).click().should("be.disabled");

    cy.wait("@ensure").then((interception) => {
      expect(interception.response.body.message).to.equal(
        "please login to purchase"
      );
    });

    cy.scrollTo("top");
    cy.get(".p-notification--negative").should("be.visible");
  });
});
