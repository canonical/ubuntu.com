/// <reference types="cypress" />

import { getRandomEmail, slowDownResponse } from "../../utils";

Cypress.config("defaultCommandTimeout", 10000);

context("/pro/subscribe VAT checks", () => {
  it("It should show correct non-VAT price", () => {
    cy.visit("/pro/subscribe")
    cy.acceptCookiePolicy()
    cy.selectProducts(2)
    cy.findByRole("button", { name: "Buy now" }).click()

    cy.intercept("POST", "/account/canonical-ua/purchase/calculate*").as("calculate")

    cy.findByLabelText("Country/Region:").select("Afghanistan")
    cy.findByRole("button", { name: "Save" }).click()
    cy.wait("@calculate")
    cy.get('[data-testid="subtotal"]').should("have.text", "$1,000.00")
  })

  it("It should show correct VATed price", () => {
    cy.visit("/pro/subscribe")
    cy.acceptCookiePolicy()
    cy.selectProducts(2)
    cy.findByRole("button", { name: "Buy now" }).click()

    cy.intercept("POST", "/account/canonical-ua/purchase/calculate*").as("calculate")

    cy.findByLabelText("Country/Region:").select(4)  // United Kingdom
    cy.findByLabelText("VAT number:").type("GB 123 1234 12 123")
    cy.findByRole("button", { name: "Save" }).click()
    cy.wait("@calculate")
    cy.get('[data-testid="total"]').should("have.text", "$1,200.00")
  });

  it("It should refresh the price by adding and removing the price", () => {
    cy.visit("/pro/subscribe")
    cy.acceptCookiePolicy()
    cy.selectProducts(2)
    cy.findByRole("button", { name: "Buy now" }).click()

    cy.intercept("POST", "/account/canonical-ua/purchase/calculate*").as("calculate")

    cy.findByLabelText("Country/Region:").select(4)  // United Kingdom
    cy.findByLabelText("VAT number:").type("GB 123 1234 12 123")
    cy.findByRole("button", { name: "Save" }).click()
    cy.wait("@calculate")
    cy.get('[data-testid="total"]').should("have.text", "$1,200.00")

    cy.findByRole("button", { name: "Edit" }).click()
    cy.findByLabelText("Country/Region:").select(4)  // United Kingdom
    cy.findByLabelText("VAT number:").clear()
    cy.findByRole("button", { name: "Save" }).click()
    cy.wait("@calculate")
    cy.get('[data-testid="total"]').should("have.text", "$1,200.00")

    cy.findByRole("button", { name: "Edit" }).click()
    cy.findByLabelText("Country/Region:").select(1)  // France
    cy.findByLabelText("VAT number:").clear()
    cy.findByRole("button", { name: "Save" }).click()
    cy.wait("@calculate")
    cy.get('[data-testid="total"]').should("have.text", "$1,200.00")

    cy.findByRole("button", { name: "Edit" }).click()
    cy.findByLabelText("Country/Region:").select(1)  // France
    cy.findByLabelText("VAT number:").clear().type("FR 123 1234 12 123")
    cy.findByRole("button", { name: "Save" }).click()
    cy.wait("@calculate")
    cy.get('[data-testid="subtotal"]').should("have.text", "$1,000.00")
  })
})

context("/pro/subscribe modal", () => {
  it("should display the modal when pressing 'Buy now'", () => {
    cy.visit("/pro/subscribe")
    cy.acceptCookiePolicy()
    cy.selectProducts()
    cy.get(".checkout-container").should("not.exist")
    cy.scrollTo("bottom")
    cy.findByRole("button", { name: "Buy now" }).click()
    cy.get(".checkout-container").should("be.visible")
    cy.findByRole("button", { name: "Cancel" }).click()
    cy.get(".checkout-container").should("not.exist")
  })
})

context("/pro/subscribe trial", () => {
  it("should show trial badge", () => {
    cy.visit("/pro/subscribe")
    cy.acceptCookiePolicy()
    cy.selectProducts()
    cy.scrollTo("bottom")
    cy.get("#summary-section").contains("Free trial available").should('be.visible')
    cy.findByRole("button", { name: "Buy now" }).click()
    cy.get(".checkout-container").scrollTo('bottom')
    cy.findByText("Use free trial month").should('be.visible')
  });

  it("should not show trial badge", () => {
    cy.visit("/pro/subscribe")
    cy.acceptCookiePolicy()
    cy.selectProducts(1, "desktop", "uaia", "advanced")
    cy.scrollTo("bottom")
    cy.get("#summary-section").contains("Free trial available").should("not.exist")
    cy.findByRole("button", { name: "Buy now" }).click()
    cy.get(".checkout-container").scrollTo('bottom')
    cy.findByText("Use free trial month").should('not.exist')
  });

  it.skip("should be able to start trial", () => {
    cy.visit("/pro/subscribe")
    cy.acceptCookiePolicy()
    cy.selectProducts()
    cy.scrollTo("bottom")
    cy.findByRole("button", { name: "Buy now" }).click()

    cy.intercept("POST", "/account/canonical-ua/purchase/calculate*").as("calculate")
    cy.fillCountryVAT("GB", "GB 123 1234 12 123")
    cy.wait("@calculate")

    cy.clickRecaptcha();

    const randomEmail = getRandomEmail()
    cy.fillInEmail(randomEmail)

    cy.fillInCardDetails();
    cy.fillInCustomerInfo();

    cy.findByLabelText("Use free trial month").click({ force: true });

    cy.acceptTerms();

    cy.intercept("POST", "/pro/purchase*", slowDownResponse).as("trial");

    cy.findByRole("button", { name: "Buy" })
      .click()
      .should("be.disabled");

    // ToDo: Trial request does not receive `products` property
    cy.wait("@trial").then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
    });

    cy.url().should("include", "/pro/subscribe/thank-you");
    cy.findByText("Thanks for your purchase");
    cy.findByText(`We’ve sent your invoice to ${randomEmail}`);
  });
})

context("/pro/subscribe guest purchase", () => {
  it.skip("should be able to purchase", () => {
    cy.visit("/pro/subscribe")
    cy.acceptCookiePolicy()
    cy.selectProducts()
    cy.scrollTo("bottom")
    cy.findByRole("button", { name: "Buy now" }).click()

    cy.intercept("POST", "/account/canonical-ua/purchase/calculate*").as("calculate")
    cy.fillCountryVAT()
    cy.wait("@calculate")

    cy.clickRecaptcha();

    cy.get('[data-testid="subtotal"]').should("have.text", "$500.00")

    const randomEmail = getRandomEmail()
    cy.fillInEmail(randomEmail)

    cy.fillInCardDetails();
    cy.fillInCustomerInfo();

    cy.findByLabelText("Pay now").click({ force: true });

    cy.acceptTerms();

    cy.intercept("POST", "/pro/purchase*", slowDownResponse).as("purchase");
    cy.intercept("GET", "/account/purchases_v2/*").as("pendingPurchase");
    cy.findByRole("button", { name: "Buy" }).click().should("be.disabled");
    cy.wait("@purchase").then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
    });
    cy.wait("@pendingPurchase")
    cy.wait(2000)

    cy.url().should("include", "/pro/subscribe/thank-you");
    // The user lands on the thank you page
    cy.findByText("Thanks for your purchase");

    // ToDo: Fix email address not getting received
    cy.findByText(`We’ve sent your invoice to ${randomEmail}`);
  });
})

context("/pro/subscribe logged out purchase", () => {
  it.skip("should be able to login and purchase", () => {
    cy.visit("/pro/subscribe")
    cy.acceptCookiePolicy()
    cy.selectProducts()
    cy.scrollTo("bottom")
    cy.findByRole("button", { name: "Buy now" }).click()

    cy.intercept("POST", "/account/canonical-ua/purchase/calculate*").as("calculate")
    cy.fillCountryVAT("GB", "GB 123 1234 12 123")
    cy.wait("@calculate")

    cy.clickRecaptcha();

    // Mimic "Sign in with Ubuntu One" click()
    cy.login();

    // ToDo: Checkout should be loaded on refresh
    // ToDo: VAT and county should be loaded with values before login
    cy.get(".checkout-container").should("be.visible")

    // Rest should proceed as a normal login purchase
    cy.wait(2000)
    cy.clickRecaptcha();
    cy.acceptTerms();

    cy.intercept("POST", "/pro/purchase*", slowDownResponse).as("purchase");
    cy.intercept("GET", "/account/purchases_v2/*").as("pendingPurchase");
    cy.findByRole("button", { name: "Buy" }).click().should("be.disabled");
    cy.wait("@purchase").then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
    });
    cy.wait("@pendingPurchase")
    cy.wait(2000)

    cy.url().should("include", "/pro/dashboard");
  });
})

context("/pro/subscribe logged in purchase", () => {
  it("should to do logged in purchase", () => {
    cy.login();
    cy.visit("/pro/subscribe")
    cy.acceptCookiePolicy()
    cy.selectProducts()
    cy.scrollTo("bottom")
    cy.findByRole("button", { name: "Buy now" }).click()
    cy.wait(2000)

    // ToDo: Fix VAT pre-fill then add check for it to be there

    cy.clickRecaptcha();

    // We do not check for price as it might be pro-rata'ed

    cy.acceptTerms();

    cy.intercept("POST", "/pro/purchase*", slowDownResponse).as("purchase");
    cy.intercept("GET", "/account/purchases_v2/*").as("pendingPurchase");
    cy.findByRole("button", { name: "Buy" }).click().should("be.disabled");
    cy.wait("@purchase").then((interception) => {
      cy.log(interception.response)
      expect(interception.response.statusCode).to.equal(200)
    });
    cy.wait("@pendingPurchase")
    cy.wait(2000)

    cy.url().should("include", "/pro/dashboard");
  });
})

context("/pro/subscribe errors", () => {
  it("should get card error when purchasing with invalid card and retrying", () => {
    cy.visit("/pro/subscribe")
    cy.acceptCookiePolicy()
    cy.selectProducts()
    cy.scrollTo("bottom")
    cy.findByRole("button", { name: "Buy now" }).click()

    cy.intercept("POST", "/account/canonical-ua/purchase/calculate*").as("calculate")
    cy.fillCountryVAT()
    cy.wait("@calculate")

    cy.clickRecaptcha();

    cy.get('[data-testid="subtotal"]').should("have.text", "$500.00")

    const randomEmail = getRandomEmail()
    cy.fillInEmail(randomEmail)

    cy.fillInCardDetails("4000000000000002");
    cy.fillInCustomerInfo();

    cy.findByLabelText("Pay now").click({ force: true });

    cy.acceptTerms();

    cy.intercept("POST", "/pro/purchase*", slowDownResponse).as("purchase");
    cy.intercept("POST", "/pro/purchase/preview*", slowDownResponse).as("preview");
    cy.findByRole("button", { name: "Buy" }).click().should("be.disabled");

    cy.wait("@preview").then((interception) => {
      expect(interception.response.statusCode).to.equal(400)
      expect(interception.response.body).to.have.any.keys('errors')
    });

    // ToDo: Surface a nice error message to the user
    cy.get('.checkout-container').scrollTo('top')
    cy.get(".p-notification--negative").should("be.visible")

    // user reattempts
    cy.fillInCardDetails("4242424242424242");
    cy.clickRecaptcha();

    cy.findByRole("button", { name: "Buy" }).click().should("be.disabled");

    cy.intercept("POST", "/pro/purchase/preview*", slowDownResponse).as("preview2");
    cy.intercept("POST", "/pro/purchase*", slowDownResponse).as("purchase2");

    cy.wait("@preview2").then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
    });

    cy.wait("@purchase2").then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
    });

    cy.url().should("include", "/pro/subscribe/thank-you");
    // The user lands on the thank you page
    cy.findByText("Thanks for your purchase");

    // ToDo: Fix email address not getting received
    cy.findByText(`We’ve sent your invoice to ${randomEmail}`);
  });

  it("cannot purchase with logged out existing account", () => {
    cy.visit("/pro/subscribe")
    cy.acceptCookiePolicy()
    cy.selectProducts()
    cy.scrollTo("bottom")
    cy.findByRole("button", { name: "Buy now" }).click()

    cy.intercept("POST", "/account/canonical-ua/purchase/calculate*").as("calculate")
    cy.fillCountryVAT()
    cy.wait("@calculate")

    cy.clickRecaptcha();

    cy.get('[data-testid="subtotal"]').should("have.text", "$500.00")

    // defaults to Peter's email
    cy.fillInEmail()
    cy.fillInCardDetails();
    cy.fillInCustomerInfo();

    cy.findByLabelText("Pay now").click({ force: true });

    cy.acceptTerms();

    cy.intercept("POST", "/pro/purchase/preview*", slowDownResponse).as("preview");
    cy.findByRole("button", { name: "Buy" }).click().should("be.disabled");
    cy.wait("@preview").then((interception) => {
      expect(interception.response.statusCode).to.equal(401)
      expect(interception.response.body.errors).to.equal("please login to purchase")
    });

    // because preview fails pruchase endpoint does not happen

    // ToDo: Surface a nice error message to the user
    cy.get('.checkout-container').scrollTo('top')
    cy.get(".p-notification--negative").should("be.visible")
  })
})
