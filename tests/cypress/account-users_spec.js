/// <reference types="cypress" />
const { recurse } = require('cypress-recurse')
import { getTestURL } from "./utils";

const getRandomString = () =>
  `${Math.random().toString(36).substr(2, 10)}`;

context("Advantage", () => {
  it("should display the modal when pressing 'Buy now'", async () => {
      const emailAddress = await cy.task("getUserEmail", null, { timeout: 10000 });
    expect(userEmailAddress).to.be.a("string");

      const password = getRandomString()

    cy.createUbuntuOneAccount(emailAddress, password);

        recurse(
      () => cy.task('getLastEmail'), // Cypress commands to retry
      Cypress._.isObject, // keep retrying until the task returns an object
      {
        timeout: 60000, // retry up to 1 minute
        delay: 5000, // wait 5 seconds between attempts
      },
    )
      .its('html')
      .then((html) => {
        cy.document({ log: false }).invoke({ log: false }, 'write', html)
      })

      cy.getByRole("link", { name: /https:\/\/login.ubuntu.com\/token/}).click()
      
    cy.login()

    cy.visit(getTestURL("/advantage/users"));
    cy.acceptCookiePolicy();
  });
});
