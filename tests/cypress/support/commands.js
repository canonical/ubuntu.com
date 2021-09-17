import "@testing-library/cypress/add-commands";

Cypress.Commands.add("acceptCookiePolicy", () => {
  cy.findByText("Accept all and visit site").click();
});

Cypress.Commands.add("createTestEmailAccount", () => {

})

Cypress.Commands.add("createUbuntuOneAccount", ({email, userName = `cypress-${Math.random().toString(36).substr(2, 10)}`, password }) => {
  cy.visit("https://ubuntu.com/login");
  cy.findByLabelText("Please type your email:").type(email);
  cy.findByLabelText("I don’t have an Ubuntu One account").click();
  cy.findByLabelText("Choose password").type(password);
  cy.findByLabelText(/Full name/).type
  cy.findByLabelText(/Username/).type(userName);
  cy.findByLabelText(/Choose password/).type(password)
  cy.findByLabelText(/Re-type password/).type(password)
  cy.findByLabelText(/I have read and accept/).click()
  cy.findByRole("button", { name: "Create account" }).click();
});

Cypress.Commands.add("login", (email, password) => {
    if (!cy.url().includes(/ubuntu.com\/login/)) {
        cy.visit("https://ubuntu.com/login");
    } 
    cy.findByLabelText("Please type your email:").type(email);
    cy.findByLabelText("Choose password").type(password);
    cy.findByRole("button", { name: "Log in"}).click();
    cy.keyboard.type("{enter}");
    cy.findByText("Accept all and visit site").click();
    });
