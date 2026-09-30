// spec: specs/saucedemo-checkout-test-plan.md (section 4)
const { test, expect } = require('@playwright/test');
const {
  PRODUCTS, URLS, pageTitle, cartBadge, cartItems, cartItem,
  login, addToCart, addTwoItemsAndOpenCart, attachFailureContext, knownBug,
} = require('./helpers');

test.describe('Cart Review (AC1)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.afterEach(attachFailureContext);

  test('TC-01: Cart displays all added items with their details', async ({ page }) => {
    // 1. Perform SETUP-LOGIN (beforeEach).
    await expect(page).toHaveURL(URLS.inventory);

    // 2. Click Add to cart for Sauce Labs Backpack.
    await addToCart(page, PRODUCTS.backpack);
    await expect(page.getByTestId(`remove-${PRODUCTS.backpack.slug}`)).toBeVisible();
    await expect(cartBadge(page)).toHaveText('1');

    // 3. Click Add to cart for Sauce Labs Bike Light.
    await addToCart(page, PRODUCTS.bikeLight);
    await expect(cartBadge(page)).toHaveText('2');

    // 4. Click the cart icon.
    await page.getByTestId('shopping-cart-link').click();
    await expect(page).toHaveURL(URLS.cart);
    await expect(pageTitle(page)).toHaveText('Your Cart');

    // 5. Count the item rows.
    await expect(cartItems(page)).toHaveCount(2);

    // 6. Inspect the first row.
    const first = cartItems(page).nth(0);
    await expect(first.locator('.cart_quantity')).toHaveText('1');
    await expect(first.locator('.inventory_item_name')).toHaveText(PRODUCTS.backpack.name);
    await expect(first.locator('.inventory_item_desc')).not.toBeEmpty();
    await expect(first.locator('.inventory_item_price')).toHaveText(PRODUCTS.backpack.price);

    // 7. Inspect the second row.
    const second = cartItems(page).nth(1);
    await expect(second.locator('.cart_quantity')).toHaveText('1');
    await expect(second.locator('.inventory_item_name')).toHaveText(PRODUCTS.bikeLight.name);
    await expect(second.locator('.inventory_item_desc')).not.toBeEmpty();
    await expect(second.locator('.inventory_item_price')).toHaveText(PRODUCTS.bikeLight.price);
  });

  test('TC-02: Cart shows the total price calculation',
    knownBug('BUG-01: Cart page does not show a total price'),
    async ({ page }) => {
      // 1. Perform SETUP-CART.
      await addTwoItemsAndOpenCart(page);

      // 2. Look for a total price on the cart page.
      const cart = page.locator('#cart_contents_container');
      await expect(cart).toContainText(/total/i);
      await expect(cart).toContainText('$39.98');
    });

  test('TC-04: Checkout button opens the checkout information page', async ({ page }) => {
    // 1. Perform SETUP-CART.
    await addTwoItemsAndOpenCart(page);

    // 2. Click Checkout.
    await page.getByTestId('checkout').click();
    await expect(page).toHaveURL(URLS.info);
    await expect(pageTitle(page)).toHaveText('Checkout: Your Information');
  });

  test('TC-05: Cart page UI elements', async ({ page }) => {
    // 1. Perform SETUP-CART.
    await addTwoItemsAndOpenCart(page);

    // 2. Check the page header.
    await expect(page.locator('.app_logo')).toHaveText('Swag Labs');
    await expect(page.getByRole('button', { name: 'Open Menu' })).toBeVisible();
    await expect(cartBadge(page)).toHaveText('2');
    await expect(pageTitle(page)).toHaveText('Your Cart');

    // 3. Check the list header.
    await expect(page.locator('.cart_quantity_label')).toHaveText('QTY');
    await expect(page.locator('.cart_desc_label')).toHaveText('Description');

    // 4. Check each item row.
    await expect(cartItems(page).getByRole('button', { name: 'Remove' })).toHaveCount(2);
    await expect(cartItems(page).locator('a .inventory_item_name')).toHaveCount(2);

    // 5. Check the action buttons.
    await expect(page.getByTestId('continue-shopping')).toBeVisible();
    await expect(page.getByTestId('continue-shopping')).toBeEnabled();
    await expect(page.getByTestId('checkout')).toBeVisible();
    await expect(page.getByTestId('checkout')).toBeEnabled();
  });

  test('TC-06: Removing an item updates the cart and badge', async ({ page }) => {
    // 1. Perform SETUP-CART.
    await addTwoItemsAndOpenCart(page);
    await expect(cartBadge(page)).toHaveText('2');

    // 2. Click Remove on Sauce Labs Bike Light.
    await page.getByTestId(`remove-${PRODUCTS.bikeLight.slug}`).click();
    await expect(cartItems(page)).toHaveCount(1);
    await expect(cartItem(page, PRODUCTS.backpack)).toBeVisible();
    await expect(cartBadge(page)).toHaveText('1');

    // 3. Click Remove on Sauce Labs Backpack.
    await page.getByTestId(`remove-${PRODUCTS.backpack.slug}`).click();
    await expect(cartItems(page)).toHaveCount(0);
    // The badge element is removed from the DOM when the cart is empty.
    await expect(cartBadge(page)).toHaveCount(0);
  });

  test('TC-07: Cart contents persist after a page reload', async ({ page }) => {
    // 1. Perform SETUP-CART.
    await addTwoItemsAndOpenCart(page);

    // 2. Reload the page.
    // The server answers HTTP 404 for /cart.html and the app then renders client-side,
    // so the assertions below wait on the rendered rows, not on the response.
    await page.reload();
    await expect(cartItems(page)).toHaveCount(2);
    await expect(cartItem(page, PRODUCTS.backpack).locator('.inventory_item_price')).toHaveText(PRODUCTS.backpack.price);
    await expect(cartItem(page, PRODUCTS.bikeLight).locator('.inventory_item_price')).toHaveText(PRODUCTS.bikeLight.price);
    await expect(cartBadge(page)).toHaveText('2');
  });
});
