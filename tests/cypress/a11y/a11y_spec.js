/// <reference types="cypress" />

function terminalLog(violations) {
  cy.task(
    "log",
    `${violations.length} accessibility violation${
      violations.length === 1 ? "" : "s"
    } ${violations.length === 1 ? "was" : "were"} detected`
  );
  // pluck specific keys to keep the table readable
  const violationData = violations.map(
    ({ id, impact, description, nodes }) => ({
      id,
      impact,
      description,
      nodes: nodes.length,
    })
  );

  cy.task("table", violationData);
}

context("a11y", () => {
  it("/pro has no detectable a11y violations on load", () => {
    cy.visit("/pro");
    cy.injectAxe();
    cy.acceptCookiePolicy();
    cy.checkA11y("#main-content", null, terminalLog);
  });
});
