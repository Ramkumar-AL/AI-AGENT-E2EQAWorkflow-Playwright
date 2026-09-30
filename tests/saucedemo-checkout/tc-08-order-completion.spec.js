// spec: specs/saucedemo-checkout-test-plan.md (section 8)
const { test, expect } = require('@playwright/test');
const {
  PRODUCTS, ALL_PRODUCTS, URLS, cartBadge, cartItems,
  setupOverview, finishOrder, openCart, attachFailureContext,
} = require('./helpers');

test.describe('Order Completion (AC4, BR2)', () => {
  // SETUP-OVERVIEW: every test starts on the overview page with two items in the order.
  test.beforeEach(async ({ page }) => {
    await setupOverview(page);
  });

  test.afterEach(attachFailureContext);

  test('TC-31: Back Home returns to the products page', async ({ page }) => {
    // 1. Perform SETUP-OVERVIEW (beforeEach) and click Finish.
    await finishOrder(page);

    // 2. Click Back Home.
    await page.getByTestId('back-to-products').click();
    await expect(page).toHaveURL(URLS.inventory);
    await expect(page.locator('.inventory_item')).toHaveCount(ALL_PRODUCTS.length);
  });

  test('TC-32: Order confirmation clears the cart', async ({ page }) => {
    // 1. Perform SETUP-OVERVIEW (beforeEach) and click Finish.
    await finishOrder(page);

    // 2. Check the cart icon.
    // The badge element is removed from the DOM when the cart is empty.
    await expect(cartBadge(page)).toHaveCount(0);

    // 3. Click Back Home.
    await page.getByTestId('back-to-products').click();
    await expect(page.getByTestId(`add-to-cart-${PRODUCTS.backpack.slug}`)).toBeVisible();
    await expect(page.getByTestId(`add-to-cart-${PRODUCTS.bikeLight.slug}`)).toBeVisible();

    // 4. Click the cart icon.
    await openCart(page);
    await expect(cartItems(page)).toHaveCount(0);
  });
});
