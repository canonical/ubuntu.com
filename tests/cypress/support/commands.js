import "@testing-library/cypress/add-commands";

Cypress.Commands.add("acceptCookiePolicy", () => {
  cy.findByRole("button", { name: "Accept all and visit site" }).click();
});

Cypress.Commands.add("login", ({ username, password }) => {
  cy.task("login", { username, password }).then(async (user) => {
    user.cookies.forEach(({ name, value }) => {
      cy.setCookie(name, value);
    });
  });
});
