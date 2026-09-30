// spec: specs/saucedemo-checkout-test-plan.md (section 7)
const { test, expect } = require('@playwright/test');
const {
  PRODUCTS, ALL_PRODUCTS, VALID_INFO, URLS, pageTitle, cartBadge, cartItems, cartItem,
  login, addToCart, openCart, startCheckout, fillInformation, continueToOverview, attachFailureContext,
} = require('./helpers');

test.describe('Order Overview (AC3)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.afterEach(attachFailureContext);

  // SETUP-OVERVIEW on top of the login done in beforeEach.
  async function openOverviewWithTwoItems(page) {
    await addToCart(page, PRODUCTS.backpack, PRODUCTS.bikeLight);
    await openCart(page);
    await startCheckout(page);
    await continueToOverview(page);
    await expect(cartItems(page)).toHaveCount(2);
  }

  test('TC-26: Valid information opens the overview with order summary', async ({ page }) => {
    // 1. Perform SETUP-INFO.
    await addToCart(page, PRODUCTS.backpack, PRODUCTS.bikeLight);
    await openCart(page);
    await startCheckout(page);

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

  test('TC-27: Overview totals are calculated correctly for all six products', async ({ page }) => {
    // 1. Perform SETUP-LOGIN (beforeEach) and add all six products to the cart.
    await addToCart(page, ...ALL_PRODUCTS);
    await expect(cartBadge(page)).toHaveText('6');

    // 2. Open the cart, click Checkout, enter John, Doe, 12345, click Continue.
    await openCart(page);
    await startCheckout(page);
    await continueToOverview(page);
    await expect(cartItems(page)).toHaveCount(6);

    // 3. Sum the displayed item prices.
    // Work in cents to avoid floating-point rounding errors.
    const prices = await page.locator('.cart_item .inventory_item_price').allInnerTexts();
    const sumCents = prices.reduce((sum, price) => sum + Math.round(parseFloat(price.replace('$', '')) * 100), 0);
    expect(sumCents).toBe(12994);
    await expect(page.getByTestId('subtotal-label')).toHaveText('Item total: $129.94');

    // 4. Check the tax (8% of the item total, rounded to 2 decimals).
    const taxCents = Math.round(sumCents * 0.08);
    expect(taxCents).toBe(1040);
    await expect(page.getByTestId('tax-label')).toHaveText('Tax: $10.40');

    // 5. Check the total (item total plus tax).
    expect(sumCents + taxCents).toBe(14034);
    await expect(page.getByTestId('total-label')).toHaveText('Total: $140.34');
  });

  test('TC-28: Overview items are read-only', async ({ page }) => {
    // 1. Perform SETUP-OVERVIEW.
    await openOverviewWithTwoItems(page);

    // 2. Check the item rows.
    // Match Remove by name: the item title links also expose a button role.
    await expect(cartItems(page).getByRole('button', { name: 'Remove' })).toHaveCount(0);
    await expect(cartItems(page).locator('button')).toHaveCount(0);
    await expect(cartItems(page).locator('input')).toHaveCount(0);

    // 3. Check the cart badge.
    await expect(cartBadge(page)).toHaveText('2');
  });

  test('TC-29: Cancel on the overview page abandons checkout and keeps the cart', async ({ page }) => {
    // 1. Perform SETUP-OVERVIEW.
    await openOverviewWithTwoItems(page);

    // 2. Click Cancel.
    // Cancel here goes to the products page; on the information page it goes to the cart (observation O-5).
    await page.getByTestId('cancel').click();
    await expect(page).toHaveURL(URLS.inventory);

    // 3. Check the cart badge.
    await expect(cartBadge(page)).toHaveText('2');

    // 4. Click the cart icon.
    await openCart(page);
    await expect(cartItems(page)).toHaveCount(2);
    await expect(cartItem(page, PRODUCTS.backpack)).toBeVisible();
    await expect(cartItem(page, PRODUCTS.bikeLight)).toBeVisible();
  });
});
