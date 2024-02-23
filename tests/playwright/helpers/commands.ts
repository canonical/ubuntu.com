import { Page } from "@playwright/test";

export const getCookies = async ({context}) => {
  await context.addCookies([
    {
      "name": "_cookies_accepted",
      "value": "all",
      "domain": "login.ubuntu.com",
      "path": "/",
      "expires": 1738330111,
    },
    {
      "name": "session",
      "value": ".eJxFjUEOwzAIBL9ScY76AJ96r_oGy3FIimxwFcOhivL3GrVST8Cys3tAMn2iKOWk1CRqKygQ4DsnaC8UWiAcgJyojg-TXHNrhfCm2HXsPHyr1SqJcRgeJJc7uUiLJ-s72u5kbdtgbTZR-2HEaXPGk_zscehs4hAjz7hDWFPtOIFQLv8GOM8PmJhCPQ.ZcOEbg.hdmQV5CSJdmmh2aAL5a3DCCPiP8",
      "domain": "0.0.0.0",
      "path": "/",
      "expires": Date.now() / 1000 + 100000,
    },
  ])
}
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
  await page.locator('#cookie-policy-button-accept').click();
};

export const acceptTerms = async (page: Page) => {
  await page.getByText(/I agree to the Ubuntu Pro service terms/).click();
  await page.getByText(/I agree to the Ubuntu Pro description/).click();
}

export const clickRecaptcha = async (page: Page) => {
  await page.frameLocator('[title="reCAPTCHA"]').getByRole('checkbox', { name: 'I\'m not a robot' }).click({force: true});
}
