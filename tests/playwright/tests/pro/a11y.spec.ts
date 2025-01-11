import { test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { acceptCookiePolicy } from '../../helpers/commands';

test.describe('a11y', () => {
  test('/pro has no detectable a11y violations on load', async ({ page }) => {
    await page.goto('/pro');
    await acceptCookiePolicy(page);

    const results = await new AxeBuilder({ page }).analyze();

    const violations = results.violations;

    console.log(`${violations.length} accessibility violation${violations.length === 1 ? '' : 's'} ${violations.length === 1 ? 'was' : 'were'} detected`);
    

    const tableData = violations.map(violation => {
      return {
        ID: violation.id,
        Impact: violation.impact,
        Description: violation.description,
        Nodes: violation.nodes.length
      };
    });
    
    console.table(tableData, ['ID', 'Impact', 'Description', 'Nodes']);
  })
})