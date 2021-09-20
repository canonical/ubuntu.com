import "@testing-library/cypress/add-commands";

Cypress.Commands.add("acceptCookiePolicy", () => {
  cy.findByText("Accept all and visit site").click();
});
