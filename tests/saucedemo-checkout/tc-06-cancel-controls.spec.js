// spec: specs/saucedemo-checkout-test-plan.md (sections 4, 5 and 7)
const { test, expect } = require('@playwright/test');
const {
  PRODUCTS, ALL_PRODUCTS, URLS, cartBadge, cartItems, cartItem,
  setupCart, openCart, startCheckout, continueToOverview, attachFailureContext,
} = require('./helpers');

test.describe('Cancel and Continue Shopping Controls (AC1, AC2, AC3)', () => {
  // SETUP-CART: every test starts on the cart page with Backpack and Bike Light.
  test.beforeEach(async ({ page }) => {
    await setupCart(page);
  });

  test.afterEach(attachFailureContext);

  test('TC-03: Continue Shopping returns to the products page and keeps the cart', async ({ page }) => {
    // 1. Perform SETUP-CART (beforeEach).
    // 2. Click Continue Shopping.
    await page.getByTestId('continue-shopping').click();
    await expect(page).toHaveURL(URLS.inventory);
    await expect(page.locator('.inventory_item')).toHaveCount(ALL_PRODUCTS.length);

    // 3. Check the cart badge.
    await expect(cartBadge(page)).toHaveText('2');

    // 4. Check the Backpack and Bike Light buttons.
    await expect(page.getByTestId(`remove-${PRODUCTS.backpack.slug}`)).toBeVisible();
    await expect(page.getByTestId(`remove-${PRODUCTS.bikeLight.slug}`)).toBeVisible();
  });

  test('TC-17: Cancel on the information page returns to the cart', async ({ page }) => {
    // 1. Perform SETUP-INFO.
    await startCheckout(page);

    // 2. Enter First Name.
    await page.getByTestId('firstName').fill('John');
    await expect(page.getByTestId('firstName')).toHaveValue('John');

    // 3. Click Cancel.
    await page.getByTestId('cancel').click();
    await expect(page).toHaveURL(URLS.cart);
    await expect(cartItems(page)).toHaveCount(2);
    await expect(cartBadge(page)).toHaveText('2');
  });

  test('TC-29: Cancel on the overview page abandons checkout and keeps the cart', async ({ page }) => {
    // 1. Perform SETUP-OVERVIEW.
    await startCheckout(page);
    await continueToOverview(page);
    await expect(cartItems(page)).toHaveCount(2);

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
