/// <reference types="cypress" />
import { getTestURL } from "./utils";

const getRandomEmail = () =>
  `${Math.random().toString(36).substr(2, 10)}@canonical.com`;
          
context("Advantage", () => {
  it("adds and deletes a user correctly", () => {
    const username = Cypress.env("UBUNTU_USERNAME");
    const password = Cypress.env("UBUNTU_PASSWORD");

    cy.task("login", { username, password }).then(
      async (user) => {
        cy.log(user.cookies);
        user.cookies.forEach(({ name, value }) => {
          cy.setCookie(name, value);
        });
      }
    );

    const email = getRandomEmail();

    cy.visit(getTestURL("/advantage/users"));
    cy.acceptCookiePolicy();

    cy.findByRole("button", { name: /Add new user/ }).click();
    cy.findByLabelText("Name").type("Angela");
    cy.findByLabelText("Users’ email address").type(email);
    cy.findByLabelText("Role").select("technical");
    cy.findByRole("button", { name: "Add new user" }).click();
    cy.findByText(/User added successfully/).should("exist");
    cy.findByText(email).should("exist");

    cy.findByLabelText(`Edit user ${email}`).click();
    cy.findByLabelText("delete").click();
    cy.findByRole("button", { name: "Yes, remove user" }).click();

    cy.findByText(/User deleted/).should("exist");
    cy.findByText(email).should("not.exist");
  });
});