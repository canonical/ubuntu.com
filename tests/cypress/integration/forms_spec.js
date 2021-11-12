/// <reference types="cypress" />
import { standardFormUrls } from "../utils";
import { interactiveForms } from "../utils";

context("Marketo forms", () => {
  // beforeEach(() => {
  //   cy.intercept({
  //     method: "POST",
  //     url: "/marketo/submit",
  //   }).as("captureLead");
  // });

  // afterEach(() => {
  //   cy.wait("@captureLead").then(({ request, response }) => {
  //     expect(request.method).to.equal("POST");
  //     expect(response.statusCode).to.equal(302);
  //   });
  // });

  it.skip("should check each contact form on /contact-us pages with standard form", () => {
    cy.visit("/");
    cy.acceptCookiePolicy();
    standardFormUrls.forEach((url) => {
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
      cy.findByLabelText(/What would you like to talk to us about?/).type(
        "test test test test"
      );
      cy.findByLabelText(/I agree to receive information/).click({
        force: true,
      });
      cy.findByText(/Submit/).click({
        force: true,
      });
      cy.findAllByText(/Thank you/).should("be.visible");
    });
  });

  it.skip("should check contact form on /blender/contact-us", () => {
    cy.visit("/blender/contact-us");
    cy.acceptCookiePolicy();
    cy.findByLabelText(/Tell us about your project/).type(
      "test test test test"
    );
    cy.findByLabelText(/First name:/).type("Test");
    cy.findByLabelText(/Last name:/).type("Test");
    cy.findByLabelText(/Company name:/).type("Test");
    cy.findByLabelText(/Email address:/).type("test@test.com");
    cy.findByLabelText(/Mobile\/cell phone number:/).type("07777777777");
    cy.findByLabelText(/I agree to receive information/).click({
      force: true,
    });
    cy.findByText(/Let’s discuss/).click();
    cy.findAllByText(/Thank you/).should("be.visible");
  });

  it.skip("should check contact form on /cube/contact-us", () => {
    cy.visit("/cube/contact-us");
    cy.acceptCookiePolicy();
    cy.findByLabelText(/First name:/).type("Test");
    cy.findByLabelText(/Last name:/).type("Test");
    cy.findByLabelText(/Work email:/).type("test@test.com");
    cy.findByLabelText(/Current employer:/).type("Test");
    cy.findByLabelText(/Job role:/).select("Education");
    cy.findByLabelText(/What is your experience with Ubuntu?/).select(
      "None or very minimal experience"
    );
    cy.findByLabelText(/Does your workplace require Ubuntu?/).click({
      force: true,
    });
    cy.findByLabelText(
      /Which microcert are you most interested in taking?/
    ).select("Ubuntu System Architecture");
    cy.findByLabelText(/Why do you want CUBE certification?/).type(
      "test test test test "
    );
    cy.findByLabelText(/I agree to receive information/).click({
      force: true,
    });
    cy.findByText(/Submit/).click();
    cy.findAllByText(/Thank you/).should("be.visible");
  });

  it("should check each interactive contact modal", () => {
    cy.visit("/openstack");
    cy.acceptCookiePolicy();
    interactiveForms.forEach((form) => {
      cy.visit(form.url);
      cy.findByTestId("interactive-form").click();
      cy.wait(3000);
      cy.scrollTo('bottom');
      cy.findByRole(/Next/).click({ multiple: true });
    //   cy.findByRole("link", { name: /Next/ }).click({ multiple: true });
    //   cy.findAllByText(/Next/).click({ multiple: true });
      form.inputs.forEach((input) => {
        cy.scrollTo('top');
        cy.findByLabelText(input[0]).type(input[1]);
      });
      cy.findByLabelText(/I agree to receive information/).click({
        force: true,
      });
      cy.findByText(form.submitBtn).click();
      cy.findByText(/Your submission was sent successfully!/).should(
        "be.visible"
      );
    });
  });
});

//Remeber to write another test for CUBE and advantage
