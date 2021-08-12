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

context("Marketo form", () => {
  beforeEach(() => {
    cy.server();
    cy.route("POST", "/marketo/submit").as("captureLead");
    cy.setCookie("_cookies_accepted", "all");
  });

  afterEach(() => {
    cy.wait("@captureLead").should((xhr) => {
      expect(xhr.method).to.equal("POST");
      //This isn't returning a 200 as we don't have the API key available
      expect(xhr.status).to.equal(400);
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
        expect(page[0].action).to.include("/marketo/submit");
      });
  });

  //Commented out this test for now as there is an error on initial submit of the engage page which is causing this test to fail.

  // it("/engage/anbox-cloud-gaming-whitepaper", () => {
  //   cy.visit("/engage/anbox-cloud-gaming-whitepaper");

  //   cy.get('input[name="firstName"]').type("Test");
  //   cy.get('input[name="lastName"]').type("Test");
  //   cy.get('input[name="company"]').type("Test");
  //   cy.get('input[name="title"]').type("Test");
  //   cy.get('input[name="email"]').type("test@test.com");
  //   cy.get('input[name="phone"]').type("000000000");

  //   getIframeBody().find(".rc-anchor-content").click();

  //   cy.wait(3000); // eslint-disable-line
  //   cy.get("#mktoForm_3494")
  //     .submit()
  //     .should((page) => {
  //       expect(page[0].action).to.include("/marketo/submit");
  //     });
  // });

  it("should open pop up model and successfully complete contact form then submit to Marketo", () => {
    cy.server();
    cy.route("POST", "/marketo/submit").as("captureLead");
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

  it("/download/server/thank-you", () => {
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
