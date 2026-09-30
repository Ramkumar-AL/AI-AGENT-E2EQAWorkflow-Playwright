// spec: specs/saucedemo-checkout-test-plan.md (section 6)
const { test, expect } = require('@playwright/test');
const {
  URLS, setupInfo, fillInformation, submitAndWaitForOutcome, expectRowsRejected,
  attachFailureContext, knownBug,
} = require('./helpers');

test.describe('Invalid Checkout Data (AC5)', () => {
  // SETUP-INFO: every test starts on the information page with two items in the cart.
  test.beforeEach(async ({ page }) => {
    await setupInfo(page);
  });

  test.afterEach(attachFailureContext);

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
