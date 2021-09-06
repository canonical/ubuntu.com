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
      { method: "POST", url: "/marketo/submit",},
      { 
          headers: {
          "Client Id": Cypress.env("Client Id"),
          "Client Secret": Cypress.env("Client Secret"),
          "Authorized User": Cypress.env("Authorized User"),
          "Token": Cypress.env("Token"),
        },
      }
    ).as("captureLead");
    cy.setCookie("_cookies_accepted", "all");
  });

  afterEach(() => {
    cy.wait("@captureLead").then(({ request, response }) => {
      expect(request.method).to.equal("POST");
      expect(response.statusCode).to.equal(200);
    });
  });

  it("should successfully complete contact form and submit to Marketo", () => {
    cy.visit("/core/contact-us");

    cy.get('input[name="firstName"]').type("Test");
    cy.get('input[name="lastName"]').type("Test");
    cy.get('input[name="email"]').type("test@test.com");
    cy.get('input[name="phone"]').type("000000000");
    cy.get('select[name="country"]').select("Colombia");
    cy.get('input[name="company"]').type("Test");
    cy.get('input[name="title"]').type("Test");
    cy.get('textarea[name="Comments_from_lead__c"]').type(
      "Test test test test"
    );
    cy.get('label[for="canonicalUpdatesOptIn"]').click();

    getIframeBody().find(".rc-anchor-content").click();

    cy.wait(3000); // eslint-disable-line
    cy.get("#mktoForm_1266")
      .submit()
      .should((page) => {
        expect(page[0].action).to.include("marketo/submit");
      });
    cy.findByText("Thank you").should("be.visible");
  });

  it("/engage/anbox-cloud-gaming-whitepaper", () => {
    //This exception can be removed when this issue is resolved: https://github.com/canonical-web-and-design/web-squad/issues/4345
    cy.on("uncaught:exception", () => {
      return false;
    });
    cy.visit("/engage/anbox-cloud-gaming-whitepaper");

    cy.get('input[name="firstName"]').type("Test");
    cy.get('input[name="lastName"]').type("Test");
    cy.get('input[name="company"]').type("Test");
    cy.get('input[name="title"]').type("Test");
    cy.get('input[name="email"]').type("test@test.com");
    cy.get('input[name="phone"]').type("000000000");

    getIframeBody().find(".rc-anchor-content").click();

    cy.wait(3000); // eslint-disable-line
    cy.get("#mktoForm_3494")
      .submit()
      .should((page) => {
        expect(page[0].action).to.include("/marketo/submit");
      });

    cy.findByText("Thank you").should("be.visible");
  });

  it("should open pop up model and successfully complete contact form then submit to Marketo", () => {
    cy.intercept("POST", "/marketo/submit").as("captureLead");
    cy.visit("/openstack#get-in-touch");
    cy.get(
      ".p-modal__dialog .js-pagination--1 .pagination__link--next"
    ).click();
    cy.get(
      ".p-modal__dialog .js-pagination--2 .pagination__link--next"
    ).click();

    cy.get('input[name="firstName"]').type("Test");
    cy.get('input[name="lastName"]').type("Test");
    cy.get('input[name="email"]').type("test@test.com");
    cy.get('label[for="canonicalUpdatesOptIn"]').click();

    getIframeBody().find(".rc-anchor-content").click();

    cy.wait(3000); // eslint-disable-line
    cy.get("#mktoForm_1251")
      .submit()
      .should((page) => {
        expect(page[0].action).to.include("/marketo/submit");
      });
    cy.get(".p-modal__close").click();
  });

  it("should successfully complete download server", () => {
    cy.visit("/download/server/s390x");

    cy.get('input[name="firstName"]').type("Test");
    cy.get('input[name="lastName"]').type("Test");
    cy.get('input[name="company"]').type("Test");
    cy.get('input[name="email"]').type("test@test.com");
    cy.get('input[name="phone"]').type("07777777777");

    getIframeBody().find(".rc-anchor-content").click();

    cy.wait(3000); // eslint-disable-line
    cy.get("#mktoForm_1400").submit();
  });
});
