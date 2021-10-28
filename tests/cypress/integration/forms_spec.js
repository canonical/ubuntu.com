/// <reference types="cypress" />
import { standardFormUrls } from "../utils";

context("Marketo forms", () => {
  beforeEach(() => {
    cy.intercept(
      { method: "POST", url: "/marketo/submit" },
      {
        headers: {
          "Client Id": Cypress.env("MARKETO_CLIENT_ID"),
          "Client Secret": Cypress.env("MARKETO_CLIENT_SECRET"),
          "Authorized User": Cypress.env("MARKETO_AUTHORISED_USER"),
          "Token": Cypress.env("MARKETO_TOKEN"),
        },
      }
    ).as("captureLead");
  });

  afterEach(() => {
    cy.wait("@captureLead").then(({ request, response }) => {
      expect(request.method).to.equal("POST");
      expect(response.statusCode).to.equal(200);
    });
  });

  it("should check each contact form on /contact-us pages with standard form", () => {
    cy.visit("/");
    cy.acceptCookiePolicy();
    standardFormUrls.forEach(url => {
      cy.visit(url);
      cy.findByLabelText(/First name:/).type("Test");
      cy.findByLabelText(/Last name:/).type("Test");
      cy.findByLabelText(/Email address:/).type("test@test.com");          
      cy.findByLabelText(/Mobile\/cell phone number:/).type("07777777777");
      cy.findByLabelText(/Country:/).select("Colombia");
      cy.findByLabelText(/Company name:/).type("Test");
      cy.findByLabelText(/Job title:/).type("test", {
        force: true,
      });
      cy.findByLabelText(/What would you like to talk to us about?/).type("test test test test");
      cy.findByLabelText(/I agree to receive information/).click({
          force: true
      });
      cy.findByText(/Submit/).click({
        force: true,
      });
      cy.findByText(/Thank you/).should("be.visible");
    });
  });

  it("should check contact form on /blender/contact-us", () => {
    cy.visit("/blender/contact-us");
    cy.acceptCookiePolicy();
    cy.findByLabelText(/Tell us about your project/).type("test test test test");
    cy.findByLabelText(/First name:/).type("Test");
    cy.findByLabelText(/Last name:/).type("Test");
    cy.findByLabelText(/Company name:/).type("Test");
    cy.findByLabelText(/Email address:/).type("test@test.com");     
    cy.findByLabelText(/Mobile\/cell phone number:/).type("07777777777");
    cy.findByLabelText(/I agree to receive information/).click({
        force: true
    });
    cy.findByText(/Let’s discuss/).click();
    cy.findByText("Thank you").should("be.visible");
  });

  it("should check contact form on /cube/contact-us", () => {
    cy.visit("/cube/contact-us");
    cy.acceptCookiePolicy();
    cy.findByLabelText(/First name:/).type("Test");
    cy.findByLabelText(/Last name:/).type("Test");
    cy.findByLabelText(/Work email:/).type("test@test.com");     
    cy.findByLabelText(/Current employer:/).type("Test");
    cy.findByLabelText(/Job role:/).select("Education");
    cy.findByLabelText(/What is your experience with Ubuntu?/).select("None or very minimal experience");
    cy.findByLabelText(/Does your workplace require Ubuntu?/).click({
        force: true
    });
    cy.findByLabelText(/Which microcert are you most interested in taking?/).select("Ubuntu System Architecture");
    cy.findByLabelText(/Why do you want CUBE certification?/).type("test test test test ");
    cy.findByLabelText(/I agree to receive information/).click({
        force: true
    });
    cy.findByText(/Submit/).click();
    cy.findByText("Thank you").should("be.visible");
  });
});
