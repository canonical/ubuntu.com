import { Page } from "@playwright/test";

export const isExistingField = async (page, fieldName) => {
  const field = page.locator(fieldName);
  return await field.isVisible();
};

export const login = async (page: Page) => {
  // TODO: mocking Login (To intercept "https://login.ubuntu.com/*/+login", proper mock responses are needed)
  
  await acceptCookiePolicy(page);
  await page.fill('input[name="email"]', process.env.PLAYWRIGHT_USER_ID as string) ;
  await page.fill('input[name="password"]', process.env.PLAYWRIGHT_USER_PASSWORD as string);
  await page.click('button[type="submit"]') // Click "Login"
  await page.click('button[type="submit"]') // Click "Yes, log me in"
}

export const selectProducts = async (
  page: Page,
  productUser = "organisation",
  quantity = 2,
  machineType = "physical",
  version = "20.04",
  support = "none"
) => {
  await page.locator(`[value='${productUser}']`).check();
  await page.locator("#quantity-input").fill(`${quantity}`);
  await page.locator(`[value='${machineType}']`).check();
  await page.getByRole('tab', { name: `${version} LTS` }).click();
  await page.getByRole('radio', { name: 'Ubuntu Pro (Infra-only)', exact: true }).check();
  await page.$(`#${support}-label`)
};

export const acceptCookiePolicy = async (
  page: Page,
) => {
  if (await isExistingField(page, '#cookie-policy-button-accept')) {
    await page.locator('#cookie-policy-button-accept').click();
  }
};

export const acceptTerms = async (page: Page) => {
  await page.getByText(/I agree to the Ubuntu Pro service terms/).click();
  await page.getByText(/I agree to the Ubuntu Pro description/).click();
}

export const clickRecaptcha = async (page: Page) => {
  await page.frameLocator('[title="reCAPTCHA"]').getByRole('checkbox', { name: 'I\'m not a robot' }).click({force: true});
}

/**
 * Fills existing fields in the form
 * @param page Current page
 * @param testTextFields List of text fields to fill
 * @param testCheckboxFields List of checkbox/radio fields to fill
 */
export const fillExistingFields = async (page, testTextFields, testCheckboxFields) => {
  for (const { field, value } of testTextFields) {
    if (await isExistingField(page, field)) {
      await page.fill(field, value);
    }
  }
  for (const { field, value } of testCheckboxFields) {
    if (await isExistingField(page, field)) {
      await page.locator(field).check({ force: true });
    }
  }
};