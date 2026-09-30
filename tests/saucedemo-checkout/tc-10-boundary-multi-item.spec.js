// spec: specs/saucedemo-checkout-test-plan.md (sections 4, 6 and 7)
const { test, expect } = require('@playwright/test');
const {
  ALL_PRODUCTS, URLS, cartBadge, cartItems,
  login, addToCart, openCart, addTwoItemsAndOpenCart, startCheckout, fillInformation,
  continueToOverview, submitAndWaitForOutcome, attachFailureContext,
} = require('./helpers');

test.describe('Boundary Values and Multi-Item Orders (AC1, AC3, AC5)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.afterEach(attachFailureContext);

  test('TC-08: Cart with all six products', async ({ page }) => {
    // 1. Perform SETUP-LOGIN (beforeEach).
    // 2. Click Add to cart on all six products.
    await addToCart(page, ...ALL_PRODUCTS);
    await expect(cartBadge(page)).toHaveText('6');

    // 3. Click the cart icon.
    await openCart(page);
    await expect(cartItems(page)).toHaveCount(6);
    await expect(page.locator('.cart_item .cart_quantity')).toHaveText(['1', '1', '1', '1', '1', '1']);

    // 4. Compare each row's name and price with the product data table.
    await expect(page.locator('.cart_item .inventory_item_name')).toHaveText(ALL_PRODUCTS.map((p) => p.name));
    await expect(page.locator('.cart_item .inventory_item_price')).toHaveText(ALL_PRODUCTS.map((p) => p.price));
  });

  test('TC-21: Minimum-length values are accepted', async ({ page }) => {
    // 1. Perform SETUP-INFO.
    await addTwoItemsAndOpenCart(page);
    await startCheckout(page);

    // 2. Enter J, D, 1 and click Continue.
    await fillInformation(page, { firstName: 'J', lastName: 'D', postalCode: '1' });
    await page.getByTestId('continue').click();
    await expect(page).toHaveURL(URLS.overview);
    await expect(page.getByTestId('error')).toHaveCount(0);
  });

  test('TC-22: Very long values', async ({ page }) => {
    // 1. Perform SETUP-INFO.
    await addTwoItemsAndOpenCart(page);
    await startCheckout(page);

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
});
