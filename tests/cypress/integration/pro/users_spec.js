/// <reference types="cypress" />
import { getRandomEmail } from "../../utils";

context("/pro/users", () => {
  it("adds and deletes a user correctly", () => {
    cy.login();

    const email = getRandomEmail();

    cy.visit("/pro/users");
    cy.acceptCookiePolicy();

    cy.findByRole("button", { name: /Add new user/ }).click();
    cy.findByLabelText("Name").type("Angela");
    cy.findByLabelText("Users’ email address").type(email);
    cy.findByLabelText("Role").select("technical");
    cy.findByRole("button", { name: "Add new user" }).click();
    cy.findByText(/User added successfully/).should("exist");

    // check that search works correctly
    cy.findByRole("searchbox", { name: "Search for users" }).type(email);
    cy.findAllByLabelText("email").should("have.length", 1);
    cy.findByText(email).should("exist");

    cy.findByLabelText(`Edit user ${email}`).click();
    cy.findByLabelText("delete").click();
    cy.findByRole("button", { name: "Yes, remove user" }).click();

    cy.findByText(/User deleted/).should("exist");
    cy.findByText(email).should("not.exist");
  });
});
