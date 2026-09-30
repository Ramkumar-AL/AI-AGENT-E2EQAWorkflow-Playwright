// spec: specs/saucedemo-checkout-test-plan.md (section 8)
const { test, expect } = require('@playwright/test');
const {
  PRODUCTS, ALL_PRODUCTS, VALID_INFO, URLS, pageTitle, cartBadge, cartItems,
  setupCart, startCheckout, fillInformation, continueToOverview, finishOrder, openCart, attachFailureContext,
} = require('./helpers');

test.describe('Order Completion (AC4, BR2)', () => {
  // SETUP-CART: every test starts on the cart page with Backpack and Bike Light.
  test.beforeEach(async ({ page }) => {
    await setupCart(page);
  });

  test.afterEach(attachFailureContext);

  // Remaining steps of SETUP-OVERVIEW followed by Finish.
  async function completeOrder(page) {
    await startCheckout(page);
    await continueToOverview(page);
    await finishOrder(page);
  }

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

  test('TC-31: Back Home returns to the products page', async ({ page }) => {
    // 1. Perform SETUP-OVERVIEW and click Finish.
    await completeOrder(page);

    // 2. Click Back Home.
    await page.getByTestId('back-to-products').click();
    await expect(page).toHaveURL(URLS.inventory);
    await expect(page.locator('.inventory_item')).toHaveCount(ALL_PRODUCTS.length);
  });

  test('TC-32: Order confirmation clears the cart', async ({ page }) => {
    // 1. Perform SETUP-OVERVIEW and click Finish.
    await completeOrder(page);

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
