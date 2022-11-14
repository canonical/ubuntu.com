/// <reference types="cypress" />
import {
  standardFormUrls,
  interactiveForms,
  formsWithEmailTestId,
} from "../utils";

beforeEach(() => {
  cy.intercept({
    method: "POST",
    url: "/marketo/submit",
  }).as("captureLead");
});

afterEach(() => {
  cy.wait("@captureLead").then(({ request, response }) => {
    expect(request.method).to.equal("POST");
    expect(response.statusCode).to.equal(302);
  });
});

context("Static marketo forms", () => {
  it("should check each contact form on /contact-us pages with standard form", () => {
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
      cy.findByText(/Submit/).click({ force: true });
      cy.findByRole("heading", { name: /Thank you/ });
    });
  });

  it("should check contact form on /blender/contact-us", () => {
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
    cy.findByLabelText(/I agree to receive information/).click({ force: true });
    cy.findByText(/Let’s discuss/).click();
    cy.findByRole("heading", { name: /Thank you/ });
  });

  it("should check contact form on /credentials/sign-up", () => {
    cy.visit("/credentials/sign-up");
    cy.acceptCookiePolicy();
    cy.findByLabelText(/First name:/).type("Test");
    cy.findByLabelText(/Last name:/).type("Test");
    cy.findByLabelText(/What is your native language?/).select("English");
    cy.findByLabelText(/What is your Employment level?/).select("Senior");
    cy.findByLabelText(/Choose the closest category corresponding to your current occupation:/).select("Software");
    cy.findByLabelText(/What is your motivation to certify your Linux and Ubuntu skills?/).select("Personal growth");
    cy.findByLabelText(/When was the last time you had academic or training experience with Linux\/Ubuntu?/).select("Never");
    cy.findByLabelText(/How long have you used\/worked with Ubuntu?/).select("Never");
    cy.findByLabelText(/When was the last time you had professional experience with Ubuntu?/).select("Never");
    cy.findByLabelText(/I agree to receive information/).click({
      force: true,
    });
    cy.findByText(/Submit/).click();
    cy.findByRole("heading", { name: /Thank you/ });
  });
});

context("Interactive marketo forms", () => {
  it(
    "should check each interactive contact modal",
    { scrollBehavior: "center" },
    () => {
      cy.visit("/");
      cy.acceptCookiePolicy();

      interactiveForms.forEach((form) => {
        cy.visit(form.url);
        cy.findByTestId("interactive-form-link").click();
        cy.findByRole("dialog").within(() => {
          for (let i = 0; i < form.noOfPages - 1; i++) {
            cy.findByRole("link", { name: /Next/ }).click();
          }
          form.inputs.forEach((input) => {
            cy.findByLabelText(input[0]).type(input[1]);
          });
          cy.findByText(form.submitBtn).click();
        });
        cy.url().should("include", "#success");
      });
    }
  );

  // wrote separate test for some pages as there are same email inputs in the modal and in the page.
  it(
    "should check interactive contact modal With Email TestId",
    { scrollBehavior: "center" },
    () => {
      cy.visit("/");
      cy.acceptCookiePolicy();

      formsWithEmailTestId.forEach((form) => {
        cy.visit(form.url);
        cy.findByTestId("interactive-form-link").click();

        cy.findByRole("dialog").within(() => {
          for (let i = 0; i < form.noOfPages - 1; i++) {
            cy.findByRole("link", { name: /Next/ }).click();
          }
          form.inputs.forEach((input) => {
            cy.findByLabelText(input[0]).type(input[1]);
          });
          cy.findByTestId("form-email").type("test@gmail.com");
          cy.findByText(form.submitBtn).click();
        });

        cy.url().should("include", "#success");
      });
    }
  );

  // wrote separate test for /robotics page as cypress couldn't find the job title input field by label text
  it(
    "should check interactive contact modal on /robotics",
    { scrollBehavior: "center" },
    () => {
      cy.visit("/robotics");
      cy.acceptCookiePolicy();
      cy.findByTestId("interactive-form-link").click();
      cy.findByRole("link", { name: /Next/ }).click();
      cy.findByLabelText(/First name/).type("Test");
      cy.findByLabelText(/Last name:/).type("Test");
      cy.findByLabelText(/Company:/).type("Test");
      cy.findByTestId("form-jobTitle").type("Test");
      cy.findByTestId("form-email").type("test@test.com");
      cy.findByLabelText(/Phone number:/).type("07777777777");
      cy.findByText(/Let's discuss/).click();
      cy.url().should("include", "#success");
    }
  );

  // wrote separate test for /kubernetes and /kubernetes/managed page as cypress couldn't find the job title input field by label text
  it(
    "should check interactive contact modal on /kubernetes",
    { scrollBehavior: "center" },
    () => {
      cy.visit("/kubernetes");
      cy.acceptCookiePolicy();
      cy.findByTestId("interactive-form-link").click();
      cy.findByLabelText(/First name/).type("Test");
      cy.findByLabelText(/Last name:/).type("Test");
      cy.findByLabelText(/Company name:/).type("Test");
      cy.findByTestId("form-jobTitle").type("Test");
      cy.findByLabelText(/Work email:/).type("test@test.com");
      cy.findByLabelText(/Mobile\/cell phone number:/).type("07777777777");
      cy.findByText(/Let's discuss/).click();
      cy.url().should("include", "#success");
    }
  );

  // wrote separate test for /download/iot/intel-iotg as cypress couldn't find the job title input field by label text
  it(
    "should check interactive contact modal on /download/iot/intel-iotg",
    { scrollBehavior: "center" },
    () => {
      cy.visit("/download/iot/intel-iotg");
      cy.acceptCookiePolicy();
      cy.findByTestId("interactive-form-link").click();
      cy.findByLabelText(/Tell us more about your project/).type("Test");
      cy.findByRole("link", { name: /Next/ }).click();
      cy.findByLabelText(/First name/).type("Test");
      cy.findByLabelText(/Last name:/).type("Test");
      cy.findByLabelText(/Company:/).type("Test");
      cy.findByTestId("form-jobTitle").type("Test");
      cy.findByTestId("form-email").type("test@test.com");
      cy.findByLabelText(/Mobile\/cell phone number:/).type("07777777777");
      cy.findByText(/Let's discuss/).click();
      cy.url().should("include", "#success");
    }
  );

  it(
    "should check interactive contact modal on /kubernetes/managed",
    { scrollBehavior: "center" },
    () => {
      cy.visit("/kubernetes/managed");
      cy.acceptCookiePolicy();
      cy.findByTestId("interactive-form-link").click();
      cy.findByLabelText(/First name/).type("Test");
      cy.findByLabelText(/Last name:/).type("Test");
      cy.findByLabelText(/Company name:/).type("Test");
      cy.findByTestId("form-jobTitle").type("Test");
      cy.findByLabelText(/Work email:/).type("test@test.com");
      cy.findByLabelText(/Mobile\/cell phone number:/).type("07777777777");
      cy.findByText(/Let's discuss/).click();
      cy.url().should("include", "#success");
    }
  );

  // wrote separate test for /openstack/pricing-calculator page as there are same submit text in the form and in the page
  it(
    "should check interactive contact modal on /openstack/pricing-calculator",
    { scrollBehavior: "center" },
    () => {
      cy.visit("/openstack/pricing-calculator");
      cy.acceptCookiePolicy();
      cy.findByTestId("interactive-form-link").click();
      cy.findByLabelText(/First name/).type("Test");
      cy.findByLabelText(/Last name:/).type("Test");
      cy.findByLabelText(/Company name:/).type("Test");
      cy.findByLabelText(/Job title:/).type("Test");
      cy.findByLabelText(/Work email:/).type("test@gmail.com");
      cy.findByLabelText(/Mobile\/cell phone number:/).type("07777777777");
      cy.findByTestId("form-submit").click();
      cy.url().should("include", "#success");
    }
  );

  // wrote separate test for /automotive page as it is an interactive single-paged form
  it("should check interactive contact modal on /automotive", () => {
    cy.visit("/automotive");
    cy.acceptCookiePolicy();
    cy.findByTestId("interactive-form-link").click();
    cy.findByLabelText(/First name/).type("Test");
    cy.findByLabelText(/Last name:/).type("Test");
    cy.findByLabelText(/Email address:/).type("test@gmail.com");
    cy.findByLabelText(/Phone number:/).type("07777777777");
    cy.findByText(/Let's discuss/).click();
    cy.url().should("include", "#success");
  });
});

context("engage forms", () => {
  it("should check forms on engage pages", () => {
    cy.visit("/engage/dockerandros");
    cy.acceptCookiePolicy();
    cy.findByLabelText(/First name:/).type("Test");
    cy.findByLabelText(/Last name:/).type("Test");
    cy.findByLabelText(/Work email:/).type("test@test.com");
    cy.findByLabelText(/Company name:/).type("Test");
    cy.findByLabelText(/Job title:/).type("test", {
      force: true,
    });
    cy.findByLabelText(/Mobile\/cell phone number:/).type("07777777777");
    cy.findByLabelText(/I agree to receive information/).click({
      force: true,
    });
    cy.findByText(/Download the whitepaper/).click();
    cy.findByRole("heading", { name: /Thank you/ });
  });
});
