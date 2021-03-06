import { signInAsAdmin, restore } from "__support__/cypress";

describe("dashboard", () => {
  before(restore);
  beforeEach(signInAsAdmin);

  it("should have the correct embed snippet", () => {
    cy.visit("/dashboard/1");
    cy.get(".Icon-share").click();
    cy.contains(/Embed this .* in an application/).click();
    cy.contains("Code").click();

    const JS_CODE = new RegExp(
      `// you will need to install via 'npm install jsonwebtoken' or in your package.json

var jwt = require("jsonwebtoken");

var METABASE_SITE_URL = "http://localhost:PORTPORTPORT";
var METABASE_SECRET_KEY = "KEYKEYKEY";
var payload = {
  resource: { dashboard: 1 },
  params: {},
  exp: Math.round(Date.now() / 1000) + (10 * 60) // 10 minute expiration
};
var token = jwt.sign(payload, METABASE_SECRET_KEY);

var iframeUrl = METABASE_SITE_URL + "/embed/dashboard/" + token + "#bordered=true&titled=true";`
        .split("\n")
        .join("")
        .replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
        .replace("KEYKEYKEY", ".*")
        .replace("PORTPORTPORT", ".*"),
    );

    const IFRAME_CODE = `<iframe
    src="{{iframeUrl}}"
    frameborder="0"
    width="800"
    height="600"
    allowtransparency
></iframe>`
      .split("\n")
      .join("");

    cy.get(".ace_content")
      .first()
      .invoke("text")
      .should("match", JS_CODE);
    cy.get(".ace_content")
      .last()
      .should("have.text", IFRAME_CODE);
  });

  it("should update the name and description", () => {
    cy.visit("/dashboard/1");
    // click pencil icon to edit
    cy.get(".Icon-pencil").click();
    // update title
    cy.get(".Header-title input")
      .first()
      .type("{selectall}Orders per year");
    // update desc
    cy.get(".Header-title input")
      .last()
      .type("{selectall}How many orders were placed in each year?");
    cy.contains("Save").click();

    // refresh page and check that title/desc were updated
    cy.visit("/dashboard/1");
    cy.contains("Orders per year")
      .next()
      .trigger("mouseenter");
    cy.contains("How many orders were placed in each year?");

    // reset title/desc
    cy.get(".Icon-pencil").click();
    cy.get(".Header-title input")
      .first()
      .type("{selectall}Orders over time");
    cy.get(".Header-title input")
      .last()
      .clear();
    cy.contains("Save").click();
  });
});
