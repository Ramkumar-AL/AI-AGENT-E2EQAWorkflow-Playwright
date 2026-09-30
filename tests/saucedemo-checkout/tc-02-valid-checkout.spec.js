// spec: specs/saucedemo-checkout-test-plan.md (sections 5, 6 and 8)
const { test, expect } = require('@playwright/test');
const {
  VALID_INFO, URLS, pageTitle, cartItems,
  setupCart, startCheckout, fillInformation, restartCheckout, attachFailureContext,
} = require('./helpers');

test.describe('Valid Checkout (AC2, AC3, AC4)', () => {
  // SETUP-CART: every test starts on the cart page with Backpack and Bike Light.
  test.beforeEach(async ({ page }) => {
    await setupCart(page);
  });

  test.afterEach(attachFailureContext);

  test('TC-10: Information page form elements', async ({ page }) => {
    // 1. Perform SETUP-INFO.
    await startCheckout(page);
    await expect(pageTitle(page)).toHaveText('Checkout: Your Information');

    // 2. Check the form fields.
    const inputs = page.locator('form input[type="text"]');
    await expect(inputs).toHaveCount(3);
    await expect(inputs.nth(0)).toHaveAttribute('placeholder', 'First Name');
    await expect(inputs.nth(1)).toHaveAttribute('placeholder', 'Last Name');
    await expect(inputs.nth(2)).toHaveAttribute('placeholder', 'Zip/Postal Code');
    for (const testId of ['firstName', 'lastName', 'postalCode']) {
      await expect(page.getByTestId(testId)).toHaveValue('');
    }

    // 3. Check the buttons.
    await expect(page.getByTestId('cancel')).toBeVisible();
    await expect(page.getByTestId('cancel')).toBeEnabled();
    await expect(page.getByTestId('continue')).toBeVisible();
    await expect(page.getByTestId('continue')).toBeEnabled();

    // 4. Check for errors.
    await expect(page.getByTestId('error')).toHaveCount(0);
  });

  test('TC-23: Legitimate international names and postal codes are accepted', async ({ page }) => {
    const rows = [
      { firstName: 'José', lastName: 'Müller-Østergård', postalCode: 'SW1A 1AA' },
      { firstName: 'Mary', lastName: "O'Brien", postalCode: '12345' },
    ];

    for (const [index, row] of rows.entries()) {
      await test.step(`Row ${index + 1}: ${row.firstName} ${row.lastName}`, async () => {
        // 1. Perform SETUP-INFO (a fresh form for every row).
        if (index === 0) await startCheckout(page);
        else await restartCheckout(page);

        // 2. Enter the values from the data row and click Continue.
        await fillInformation(page, row);
        await page.getByTestId('continue').click();
        await expect(page).toHaveURL(URLS.overview);
        await expect(page.getByTestId('error')).toHaveCount(0);
      });
    }
  });

  test('TC-30: End-to-end purchase completes with a confirmation', async ({ page }) => {
    // 1. Perform SETUP-CART (beforeEach).
    await expect(cartItems(page)).toHaveCount(2);

    // 2. Click Checkout.
    await page.getByTestId('checkout').click();
    await expect(page).toHaveURL(URLS.info);

    // 3. Enter John, Doe, 12345 and click Continue.
    await fillInformation(page, VALID_INFO);
    await page.getByTestId('continue').click();
    await expect(page).toHaveURL(URLS.overview);
    await expect(page.getByTestId('total-label')).toHaveText('Total: $43.18');

    // 4. Click Finish.
    await page.getByTestId('finish').click();
    await expect(page).toHaveURL(URLS.complete);
    await expect(pageTitle(page)).toHaveText('Checkout: Complete!');

    // 5. Check the success message.
    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
    await expect(page.locator('.complete-text')).toHaveText(
      'Your order has been dispatched, and will arrive just as fast as the pony can get there!',
    );

    // 6. Check the confirmation image and button.
    await expect(page.getByTestId('pony-express')).toBeVisible();
    await expect(page.getByTestId('back-to-products')).toBeVisible();
    await expect(page.getByTestId('back-to-products')).toHaveText('Back Home');
  });
});
