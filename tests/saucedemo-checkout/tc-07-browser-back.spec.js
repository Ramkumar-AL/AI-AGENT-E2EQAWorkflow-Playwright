// spec: specs/saucedemo-checkout-test-plan.md (sections 4 and 10)
const { test, expect } = require('@playwright/test');
const {
  PRODUCTS, URLS, pageTitle, cartBadge, cartItems,
  setupCart, startCheckout, continueToOverview, finishOrder, attachFailureContext, knownBug,
} = require('./helpers');

test.describe('Browser Back Button Navigation', () => {
  // SETUP-CART: every test starts on the cart page, reached through the UI
  // so that the browser history matches a real user's (products > cart).
  test.beforeEach(async ({ page }) => {
    await setupCart(page);
  });

  test.afterEach(attachFailureContext);

  test('TC-09: Item name link opens product details and Back returns to the cart', async ({ page }) => {
    // 1. Perform SETUP-CART (beforeEach).
    // 2. Click the name "Sauce Labs Backpack".
    await page.getByTestId('item-4-title-link').click();
    await expect(page).toHaveURL('/inventory-item.html?id=4');
    await expect(page.locator('.inventory_details_name')).toHaveText(PRODUCTS.backpack.name);

    // 3. Click the browser Back button.
    await page.goBack();
    await expect(page).toHaveURL(URLS.cart);
    await expect(cartItems(page)).toHaveCount(2);
  });

  test('TC-38: Browser Back from the information page returns to the cart', async ({ page }) => {
    // 1. Perform SETUP-INFO.
    await startCheckout(page);
    await expect(page).toHaveURL(URLS.info);

    // 2. Click the browser Back button.
    await page.goBack();
    await expect(page).toHaveURL(URLS.cart);
    await expect(cartItems(page)).toHaveCount(2);
    await expect(cartBadge(page)).toHaveText('2');

    // 3. Click Checkout again.
    await page.getByTestId('checkout').click();
    await expect(page).toHaveURL(URLS.info);
    for (const testId of ['firstName', 'lastName', 'postalCode']) {
      await expect(page.getByTestId(testId)).toHaveValue('');
    }
    await expect(page.getByTestId('error')).toHaveCount(0);
  });

  test('TC-39: Browser Back and Forward between overview and information pages', async ({ page }) => {
    // 1. Perform SETUP-OVERVIEW.
    await startCheckout(page);
    await continueToOverview(page);

    // 2. Click the browser Back button.
    await page.goBack();
    await expect(page).toHaveURL(URLS.info);
    await expect(pageTitle(page)).toHaveText('Checkout: Your Information');
    await expect(page.getByTestId('error')).toHaveCount(0);

    // 3. Check the field values (entered information is not retained, observation O-4).
    for (const testId of ['firstName', 'lastName', 'postalCode']) {
      await expect(page.getByTestId(testId)).toHaveValue('');
    }

    // 4. Click the browser Forward button.
    await page.goForward();
    await expect(page).toHaveURL(URLS.overview);
    await expect(cartItems(page)).toHaveCount(2);
    await expect(page.getByTestId('total-label')).toHaveText('Total: $43.18');

    // 5. Click Back twice.
    await page.goBack();
    await expect(page).toHaveURL(URLS.info);
    await page.goBack();
    await expect(page).toHaveURL(URLS.cart);
    await expect(cartItems(page)).toHaveCount(2);
  });

  test('TC-40: Browser Back from the confirmation page cannot resubmit the order',
    knownBug('BUG-06: Browser Back after confirmation allows a second, empty order'),
    async ({ page }) => {
      // 1. Perform SETUP-OVERVIEW and click Finish.
      await startCheckout(page);
      await continueToOverview(page);
      await finishOrder(page);
      await expect(cartBadge(page)).toHaveCount(0);

      // 2. Click the browser Back button.
      await page.goBack();
      await expect(pageTitle(page)).toBeVisible();
      // A second order must not be possible: no enabled Finish button may be offered.
      // Soft assertion so that step 3 is still checked when this fails.
      await expect.soft(page.locator('[data-test="finish"]:enabled'), 'no active Finish button after Back').toHaveCount(0);

      // 3. Check the cart badge.
      await expect(cartBadge(page)).toHaveCount(0);
      await expect(cartItems(page)).toHaveCount(0);
    });
});
