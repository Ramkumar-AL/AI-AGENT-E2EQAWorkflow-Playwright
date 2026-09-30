// spec: specs/saucedemo-checkout-test-plan.md (section 9)
const { test, expect } = require('@playwright/test');
const {
  PRODUCTS, URLS, cartBadge, cartItems, cartItem,
  login, addToCart, openCart, logout, attachFailureContext, knownBug,
} = require('./helpers');

const accessError = (path) => `Epic sadface: You can only access '${path}' when you are logged in.`;

test.describe('Access Control and Business Rules (BR1, BR2)', () => {
  test.afterEach(attachFailureContext);

  test.describe('Logged-out user', () => {
    test('TC-33: Logged-out users cannot open cart or checkout pages', async ({ page }) => {
      for (const path of [URLS.cart, URLS.info, URLS.overview, URLS.complete]) {
        await test.step(`Direct access to ${path}`, async () => {
          // 1. In a fresh browser context (not logged in), open the path.
          await page.goto(path);
          await expect(page).toHaveURL(URLS.login);
          await expect(page.getByTestId('login-button')).toBeVisible();

          // 2. Read the error message.
          await expect(page.getByTestId('error')).toHaveText(accessError(path));
        });
      }
    });
  });

  test.describe('Logged-in user', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test('TC-34: Checkout is inaccessible after logout', async ({ page }) => {
      // 1. Perform SETUP-LOGIN (beforeEach) and add Sauce Labs Onesie to the cart.
      await addToCart(page, PRODUCTS.onesie);
      await expect(cartBadge(page)).toHaveText('1');

      // 2. Open the menu and click Logout.
      await logout(page);

      // 3. Open the checkout information URL directly.
      await page.goto(URLS.info);
      await expect(page).toHaveURL(URLS.login);
      await expect(page.getByTestId('error')).toHaveText(accessError(URLS.info));
    });

    test('TC-35: Cart is retained across logout and login', async ({ page }) => {
      // 1. Perform SETUP-LOGIN (beforeEach) and add Sauce Labs Onesie to the cart.
      await addToCart(page, PRODUCTS.onesie);
      await expect(cartBadge(page)).toHaveText('1');

      // 2. Open the menu and click Logout.
      await logout(page);

      // 3. Log in again as standard_user.
      await login(page);
      await expect(cartBadge(page)).toHaveText('1');

      // 4. Click the cart icon.
      await openCart(page);
      await expect(cartItems(page)).toHaveCount(1);
      await expect(cartItem(page, PRODUCTS.onesie)).toBeVisible();
    });

    test('TC-36: Checkout with an empty cart is prevented',
      knownBug('BUG-04: An order can be placed with an empty cart'),
      async ({ page }) => {
        // 1. Perform SETUP-LOGIN (beforeEach). Do not add any product.
        await expect(cartBadge(page)).toHaveCount(0);

        // 2. Click the cart icon.
        await openCart(page);
        await expect(cartItems(page)).toHaveCount(0);

        // 3. Click Checkout.
        // Checkout must not start: either the button is disabled, or clicking it keeps the user on the cart.
        const checkout = page.getByTestId('checkout');
        if (await checkout.isEnabled()) await checkout.click();
        await expect(page).toHaveURL(URLS.cart);
      });

    test('TC-37: Overview cannot be reached without entering checkout information',
      knownBug('BUG-05: The overview page can be opened without entering checkout information'),
      async ({ page }) => {
        // 1. Perform SETUP-CART.
        await addToCart(page, PRODUCTS.backpack, PRODUCTS.bikeLight);
        await openCart(page);
        await expect(cartItems(page)).toHaveCount(2);

        // 2. Open the overview URL directly.
        await page.goto(URLS.overview);
        // Wait until the app has rendered whichever page it settles on before checking the URL.
        await expect(page.locator('.title')).toBeVisible();
        await expect(page).not.toHaveURL(URLS.overview);
        await expect(page.getByTestId('finish')).toHaveCount(0);
      });
  });
});
