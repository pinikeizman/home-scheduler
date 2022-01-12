const userToken = Cypress.env("TENBIS_USER_TOKEN");

describe("My First Test", () => {
  it("Does not do much!", () => {
    cy.setCookie("uid", userToken);
    cy.visit(
      "https://www.10bis.co.il/next/restaurants/menu/delivery/26698/%D7%A9%D7%95%D7%A4%D7%A8%D7%A1%D7%9C---%D7%9B%D7%9C%D7%9C-%D7%90%D7%A8%D7%A6%D7%99",
      { headers: { "user-token": userToken }, timeout:10000}
    );
    cy.get("button[aria-label~=100]").click();
    cy.get("button[data-test-id=submitDishBtn]").click();
  });
});
