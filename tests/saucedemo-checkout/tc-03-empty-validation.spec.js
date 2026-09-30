// spec: specs/saucedemo-checkout-test-plan.md (section 5)
const { test, expect } = require('@playwright/test');
const {
  URLS, setupInfo, fillInformation, restartCheckout, attachFailureContext,
} = require('./helpers');

test.describe('Empty Field Validation (AC2)', () => {
  // SETUP-INFO: every test starts on the information page with two items in the cart.
  test.beforeEach(async ({ page }) => {
    await setupInfo(page);
  });

  test.afterEach(attachFailureContext);

  test('TC-11: All fields empty shows a required-field error', async ({ page }) => {
    // 1. Perform SETUP-INFO (beforeEach).
    // 2. Leave all fields empty and click Continue.
    await page.getByTestId('continue').click();
    await expect(page).toHaveURL(URLS.info);

    // 3. Read the error message.
    await expect(page.getByTestId('error')).toHaveText('Error: First Name is required');
  });

  test('TC-12: First Name empty', async ({ page }) => {
    // 1. Perform SETUP-INFO (beforeEach).
    // 2. Enter Last Name and Zip. Leave First Name empty.
    await fillInformation(page, { firstName: '', lastName: 'Doe', postalCode: '12345' });
    await expect(page.getByTestId('lastName')).toHaveValue('Doe');
    await expect(page.getByTestId('postalCode')).toHaveValue('12345');

    // 3. Click Continue.
    await page.getByTestId('continue').click();
    await expect(page).toHaveURL(URLS.info);
    await expect(page.getByTestId('error')).toHaveText('Error: First Name is required');
  });

  test('TC-13: Last Name empty', async ({ page }) => {
    // 1. Perform SETUP-INFO (beforeEach).
    // 2. Enter First Name and Zip. Leave Last Name empty.
    await fillInformation(page, { firstName: 'John', lastName: '', postalCode: '12345' });
    await expect(page.getByTestId('firstName')).toHaveValue('John');
    await expect(page.getByTestId('postalCode')).toHaveValue('12345');

    // 3. Click Continue.
    await page.getByTestId('continue').click();
    await expect(page).toHaveURL(URLS.info);
    await expect(page.getByTestId('error')).toHaveText('Error: Last Name is required');
  });

  test('TC-14: Zip/Postal Code empty', async ({ page }) => {
    // 1. Perform SETUP-INFO (beforeEach).
    // 2. Enter First Name and Last Name. Leave Zip empty.
    await fillInformation(page, { firstName: 'John', lastName: 'Doe', postalCode: '' });
    await expect(page.getByTestId('firstName')).toHaveValue('John');
    await expect(page.getByTestId('lastName')).toHaveValue('Doe');

    // 3. Click Continue.
    await page.getByTestId('continue').click();
    await expect(page).toHaveURL(URLS.info);
    await expect(page.getByTestId('error')).toHaveText('Error: Postal Code is required');
  });

  test('TC-15: Error reports the first missing field when several are empty', async ({ page }) => {
    const rows = [
      { firstName: 'John', lastName: '', postalCode: '', error: 'Error: Last Name is required' },
      { firstName: '', lastName: 'Doe', postalCode: '', error: 'Error: First Name is required' },
      { firstName: '', lastName: '', postalCode: '12345', error: 'Error: First Name is required' },
    ];

    for (const [index, row] of rows.entries()) {
      await test.step(`Row ${index + 1}: expect "${row.error}"`, async () => {
        // 1. Perform SETUP-INFO (beforeEach for the first row, a fresh form for later rows).
        if (index > 0) await restartCheckout(page);

        // 2. Enter the values from the data row and click Continue.
        await fillInformation(page, row);
        await page.getByTestId('continue').click();
        await expect(page).toHaveURL(URLS.info);
        await expect(page.getByTestId('error')).toHaveText(row.error);
      });
    }
  });

  test('TC-16: Error presentation, retained values and dismissal', async ({ page }) => {
    // 1. Perform SETUP-INFO (beforeEach).
    // 2. Enter First Name and Last Name, then click Continue.
    await page.getByTestId('firstName').fill('John');
    await page.getByTestId('lastName').fill('Doe');
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('error')).toHaveText('Error: Postal Code is required');
    await expect(page.getByTestId('error-button')).toBeVisible();
    // The app highlights all three fields, not only the missing one (observation O-1),
    // so only assert that the missing field is highlighted.
    await expect(page.getByTestId('postalCode')).toHaveClass(/error/);
    await expect(page.locator('.error_icon').first()).toBeVisible();

    // 3. Check the field values.
    await expect(page.getByTestId('firstName')).toHaveValue('John');
    await expect(page.getByTestId('lastName')).toHaveValue('Doe');

    // 4. Click the error close (X) button.
    await page.getByTestId('error-button').click();
    await expect(page.getByTestId('error')).toHaveCount(0);
    await expect(page.locator('input.error')).toHaveCount(0);
    await expect(page.locator('.error_icon')).toHaveCount(0);

    // 5. Enter Zip and click Continue.
    await page.getByTestId('postalCode').fill('12345');
    await page.getByTestId('continue').click();
    await expect(page).toHaveURL(URLS.overview);
  });
});
