// spec: specs/saucedemo-checkout-test-plan.md (section 7)
const { test, expect } = require('@playwright/test');
const {
  PRODUCTS, VALID_INFO, URLS, pageTitle, cartBadge, cartItems, cartItem,
  setupInfo, fillInformation, continueToOverview, attachFailureContext,
} = require('./helpers');

test.describe('Order Overview (AC3)', () => {
  // SETUP-INFO: every test starts on the information page with two items in the cart.
  test.beforeEach(async ({ page }) => {
    await setupInfo(page);
  });

  test.afterEach(attachFailureContext);

  test('TC-26: Valid information opens the overview with order summary', async ({ page }) => {
    // 1. Perform SETUP-INFO (beforeEach).
    // 2. Enter John, Doe, 12345 and click Continue.
    await fillInformation(page, VALID_INFO);
    await page.getByTestId('continue').click();
    await expect(page).toHaveURL(URLS.overview);
    await expect(pageTitle(page)).toHaveText('Checkout: Overview');

    // 3. Check the item list.
    await expect(cartItems(page)).toHaveCount(2);
    for (const product of [PRODUCTS.backpack, PRODUCTS.bikeLight]) {
      const row = cartItem(page, product);
      await expect(row.locator('.cart_quantity')).toHaveText('1');
      await expect(row.locator('.inventory_item_price')).toHaveText(product.price);
      await expect(row.locator('.inventory_item_desc')).not.toBeEmpty();
    }

    // 4. Check payment information.
    await expect(page.getByTestId('payment-info-label')).toHaveText('Payment Information:');
    await expect(page.getByTestId('payment-info-value')).toHaveText('SauceCard #31337');

    // 5. Check shipping information.
    await expect(page.getByTestId('shipping-info-label')).toHaveText('Shipping Information:');
    await expect(page.getByTestId('shipping-info-value')).toHaveText('Free Pony Express Delivery!');

    // 6. Check the price section.
    await expect(page.getByTestId('subtotal-label')).toHaveText('Item total: $39.98');
    await expect(page.getByTestId('tax-label')).toHaveText('Tax: $3.20');
    await expect(page.getByTestId('total-label')).toHaveText('Total: $43.18');

    // 7. Check the buttons.
    await expect(page.getByTestId('cancel')).toBeVisible();
    await expect(page.getByTestId('cancel')).toBeEnabled();
    await expect(page.getByTestId('finish')).toBeVisible();
    await expect(page.getByTestId('finish')).toBeEnabled();
  });

  test('TC-28: Overview items are read-only', async ({ page }) => {
    // 1. Perform SETUP-OVERVIEW.
    await continueToOverview(page);
    await expect(cartItems(page)).toHaveCount(2);

    // 2. Check the item rows.
    // Match Remove by name: the item title links also expose a button role.
    await expect(cartItems(page).getByRole('button', { name: 'Remove' })).toHaveCount(0);
    await expect(cartItems(page).locator('button')).toHaveCount(0);
    await expect(cartItems(page).locator('input')).toHaveCount(0);

    // 3. Check the cart badge.
    await expect(cartBadge(page)).toHaveText('2');
  });
});
