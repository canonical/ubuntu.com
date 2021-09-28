/// <reference types="cypress" />

// Those functions come from https://www.cypress.io/blog/2020/02/12/working-with-iframes-in-cypress/
const getIframeDocument = () => {
  return cy.get(".g-recaptcha iframe").its("0.contentDocument").should("exist");
};

const getIframeBody = () => {
  return getIframeDocument()
    .its("body")
    .should("not.be.undefined")
    .then(cy.wrap);
};

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

  it.skip("should successfully complete contact form and submit to Marketo", () => {
    cy.visit("/core/contact-us");
    cy.acceptCookiePolicy();

    cy.findByLabelText(/First name:/).type("Test");
    cy.findByLabelText(/Last name:/).type("Test");
    cy.findByLabelText(/Email address:/).type("test@test.com");
    cy.findByLabelText(/Mobile\/cell phone number:/).type("07777777777");
    cy.findByLabelText(/Country:/).select("Colombia");
    cy.findByLabelText(/Company:/).type("Test");
    cy.findByLabelText(/Job title:/).type("Test");
    cy.findByLabelText(/What would you like to talk to us about?/).type("Test test test test");
    cy.findByLabelText(/I agree to receive information/).click({
      force: true,
    });

    getIframeBody().find(".rc-anchor-content").click();

    cy.wait(3000); // eslint-disable-line
    cy.findByText(/Submit/).click({
      force: true,
    });
    cy.findByText("Thank you").should("be.visible");
  });

  it("/engage/anbox-cloud-gaming-whitepaper", () => {
    //This exception can be removed when this issue is resolved: https://github.com/canonical-web-and-design/web-squad/issues/4345
    cy.on("uncaught:exception", () => {
      return false;
    });
    cy.visit("/engage/anbox-cloud-gaming-whitepaper");
    cy.acceptCookiePolicy();

    cy.findByLabelText(/First Name:/).type("Test");
    cy.findByLabelText(/Last Name:/).type("Test");
    cy.findByLabelText(/Work email:/).type("test@test.com");
    cy.findByLabelText(/Company Name:/).type("Test");
    cy.findByLabelText(/Job Title/).type("Test");
    cy.findByLabelText(/Mobile\/cell phone number:/).type("07777777777");

    getIframeBody().find(".rc-anchor-content").click();

    cy.wait(3000);
    cy.findByText(/Download the whitepaper/).click({ force: true });
    cy.wait(3000);
    cy.findByText(/Thank you/).should("be.visible");
  });

  it("should open pop up model and successfully complete contact form then submit to Marketo", () => {
    cy.intercept("POST", "/marketo/submit").as("captureLead");
    cy.visit("/openstack#get-in-touch");
    cy.acceptCookiePolicy();

    cy.scrollTo("bottom");
    cy.findByRole('link', {name: /Next/i}).click();
    cy.findByRole('link', {name: /Next/i}).click();

    cy.findByLabelText(/First name:/).type("Test");
    cy.findByLabelText(/Last name:/).type("Test");
    cy.findByLabelText(/Work email:/).type("test@test.com");
    cy.findByLabelText(/Mobile\/cell phone number:/).type("07777777777");
    cy.findByLabelText(/I agree to receive information/).click({
      force: true,
    });

    getIframeBody().find(".rc-anchor-content").click();

    cy.wait(3000);
    cy.findByText(/Let's discuss/).click({
      force: true,
    });
    cy.findByText(/Thank you/).should("be.visible");
    cy.findByLabelText("Close active modal").click();
  });

  it("should successfully complete download server", () => {
    cy.visit("/download/server/s390x");
    cy.acceptCookiePolicy();

    cy.findByLabelText(/First name:/).type("Test");
    cy.findByLabelText(/Last name: /).type("Test");
    cy.findByLabelText(/Company name: /).type("Test");
    cy.findByLabelText(/Email address:/).type("test@test.com");
    cy.findByLabelText(/Mobile\/cell phone number:/).type("07777777777");

    getIframeBody().find(".rc-anchor-content").click();

    cy.wait(3000);
    cy.findByText(/Accept terms and download/).click({ force: true });
    cy.findByText(/Accept all and visit site/).click({ force: true });
    cy.findAllByText(/Download Ubuntu Server/).should("be.visible");
  });
});
