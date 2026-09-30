// spec: specs/saucedemo-checkout-test-plan.md (section 6)
const { test, expect } = require('@playwright/test');
const {
  URLS, setupInfo, fillInformation, restartCheckout, attachFailureContext, knownBug,
} = require('./helpers');

test.describe('Checkout Error Handling (AC5)', () => {
  // SETUP-INFO: every test starts on the information page with two items in the cart.
  test.beforeEach(async ({ page }) => {
    await setupInfo(page);
  });

  test.afterEach(attachFailureContext);

  // Continue ends in one of two states: an error on the information page, or the overview page.
  // Waiting for either one avoids fixed timeouts and lets the row assertions run without retrying.
  async function submitAndWaitForOutcome(page) {
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('error').or(page.getByTestId('finish'))).toBeVisible();
  }

  // Runs every data row and reports all rows that were wrongly accepted (soft assertions).
  async function expectRowsRejected(page, rows) {
    for (const [index, row] of rows.entries()) {
      await test.step(`Row ${index + 1}: ${JSON.stringify(row)}`, async () => {
        // 1. Perform SETUP-INFO (beforeEach for the first row, a fresh form for later rows).
        if (index > 0) await restartCheckout(page);

        // 2. Enter the values from the data row and click Continue.
        await fillInformation(page, row);
        await submitAndWaitForOutcome(page);
        expect.soft(await page.getByTestId('error').isVisible(), `row ${index + 1}: a validation error is displayed`).toBe(true);
        expect.soft(page.url(), `row ${index + 1}: user stays on the information page`).toContain(URLS.info);
      });
    }
  }

  test('TC-18: Whitespace-only values are rejected',
    knownBug('BUG-02: Checkout information fields validate only for empty values'),
    async ({ page }) => {
      await expectRowsRejected(page, [
        { firstName: ' ', lastName: ' ', postalCode: ' ' },
        { firstName: '   ', lastName: 'Doe', postalCode: '12345' },
      ]);
    });

  test('TC-19: Special characters and digits in name fields are rejected',
    knownBug('BUG-02: Checkout information fields validate only for empty values'),
    async ({ page }) => {
      await expectRowsRejected(page, [
        { firstName: '@#$%^&*', lastName: '!<>?/|', postalCode: '12345' },
        { firstName: '12345', lastName: '67890', postalCode: '12345' },
      ]);
    });

  test('TC-20: Invalid Zip/Postal Code values are rejected',
    knownBug('BUG-02: Checkout information fields validate only for empty values'),
    async ({ page }) => {
      await expectRowsRejected(page, [
        { firstName: 'John', lastName: 'Doe', postalCode: '~`+=' },
        { firstName: 'John', lastName: 'Doe', postalCode: '-1' },
      ]);
    });

  test('TC-21: Minimum-length values are accepted', async ({ page }) => {
    // 1. Perform SETUP-INFO (beforeEach).
    // 2. Enter J, D, 1 and click Continue.
    await fillInformation(page, { firstName: 'J', lastName: 'D', postalCode: '1' });
    await page.getByTestId('continue').click();
    await expect(page).toHaveURL(URLS.overview);
    await expect(page.getByTestId('error')).toHaveCount(0);
  });

  test('TC-22: Very long values', async ({ page }) => {
    // 1. Perform SETUP-INFO (beforeEach).
    // 2. Enter the three 256-character values.
    const long = { firstName: 'A'.repeat(256), lastName: 'B'.repeat(256), postalCode: '9'.repeat(256) };
    await fillInformation(page, long);
    await expect(page.getByTestId('firstName')).toHaveValue(long.firstName);
    await expect(page.getByTestId('lastName')).toHaveValue(long.lastName);
    await expect(page.getByTestId('postalCode')).toHaveValue(long.postalCode);
    // Layout check: long values must not make the page scroll horizontally.
    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflows, 'page has no horizontal overflow').toBe(false);

    // 3. Click Continue.
    // The story defines no length limit, so either outcome is acceptable: overview or a validation error.
    await submitAndWaitForOutcome(page);
  });

  test('TC-23: Legitimate international names and postal codes are accepted', async ({ page }) => {
    const rows = [
      { firstName: 'José', lastName: 'Müller-Østergård', postalCode: 'SW1A 1AA' },
      { firstName: 'Mary', lastName: "O'Brien", postalCode: '12345' },
    ];

    for (const [index, row] of rows.entries()) {
      await test.step(`Row ${index + 1}: ${row.firstName} ${row.lastName}`, async () => {
        // 1. Perform SETUP-INFO (beforeEach for the first row, a fresh form for later rows).
        if (index > 0) await restartCheckout(page);

        // 2. Enter the values from the data row and click Continue.
        await fillInformation(page, row);
        await page.getByTestId('continue').click();
        await expect(page).toHaveURL(URLS.overview);
        await expect(page.getByTestId('error')).toHaveCount(0);
      });
    }
  });

  test('TC-24: Enter key submits the information form',
    knownBug('BUG-03: Pressing Enter in the information form cancels checkout'),
    async ({ page }) => {
      // 1. Perform SETUP-INFO (beforeEach).
      // 2. Enter John, Doe, 12345.
      await fillInformation(page, { firstName: 'John', lastName: 'Doe', postalCode: '12345' });
      await expect(page.getByTestId('postalCode')).toHaveValue('12345');

      // 3. With focus in the Zip field, press Enter.
      await page.getByTestId('postalCode').press('Enter');
      await expect(page).toHaveURL(URLS.overview);
    });

  test('TC-25: Script input is not executed', async ({ page }) => {
    // Any JavaScript dialog means the input was executed.
    const dialogs = [];
    page.on('dialog', async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });

    // 1. Perform SETUP-INFO (beforeEach).
    // 2. Enter the test data and click Continue.
    await fillInformation(page, { firstName: '<script>alert(1)</script>', lastName: 'Doe', postalCode: '12345' });
    await submitAndWaitForOutcome(page);
    expect(dialogs, 'no JavaScript dialog appeared').toEqual([]);

    // 3. Check the resulting page: a validation error, or a normal overview with no injected content.
    await expect(page.locator('script', { hasText: 'alert(1)' })).toHaveCount(0);
    await expect(page.locator('#root')).not.toContainText('alert(1)');
  });
});
