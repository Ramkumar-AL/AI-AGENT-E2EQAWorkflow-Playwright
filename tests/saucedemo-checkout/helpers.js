// Shared test data and setup steps for the Saucedemo checkout suites.
// spec: specs/saucedemo-checkout-test-plan.md
const { expect } = require('@playwright/test');

const USER = { username: 'standard_user', password: 'secret_sauce' };

const VALID_INFO = { firstName: 'John', lastName: 'Doe', postalCode: '12345' };

// slug is the suffix of the add-to-cart-<slug> / remove-<slug> data-test attributes.
const PRODUCTS = {
  backpack: { slug: 'sauce-labs-backpack', name: 'Sauce Labs Backpack', price: '$29.99' },
  bikeLight: { slug: 'sauce-labs-bike-light', name: 'Sauce Labs Bike Light', price: '$9.99' },
  boltTShirt: { slug: 'sauce-labs-bolt-t-shirt', name: 'Sauce Labs Bolt T-Shirt', price: '$15.99' },
  fleeceJacket: { slug: 'sauce-labs-fleece-jacket', name: 'Sauce Labs Fleece Jacket', price: '$49.99' },
  onesie: { slug: 'sauce-labs-onesie', name: 'Sauce Labs Onesie', price: '$7.99' },
  redTShirt: { slug: 'test.allthethings()-t-shirt-(red)', name: 'Test.allTheThings() T-Shirt (Red)', price: '$15.99' },
};
const ALL_PRODUCTS = Object.values(PRODUCTS);

const URLS = {
  login: '/',
  inventory: '/inventory.html',
  cart: '/cart.html',
  info: '/checkout-step-one.html',
  overview: '/checkout-step-two.html',
  complete: '/checkout-complete.html',
};

const pageTitle = (page) => page.locator('.title');
const cartBadge = (page) => page.locator('.shopping_cart_badge');
const cartItems = (page) => page.locator('.cart_item');
const cartItem = (page, product) => cartItems(page).filter({ hasText: product.name });

// SETUP-LOGIN
async function login(page) {
  await page.goto(URLS.login);
  await page.getByTestId('username').fill(USER.username);
  await page.getByTestId('password').fill(USER.password);
  await page.getByTestId('login-button').click();
  // The app is a single-page app: the URL changes before the content renders,
  // so wait for the product list as well as the URL.
  await expect(page).toHaveURL(URLS.inventory);
  await expect(page.locator('.inventory_item')).toHaveCount(ALL_PRODUCTS.length);
}

async function addToCart(page, ...products) {
  for (const product of products) {
    await page.getByTestId(`add-to-cart-${product.slug}`).click();
  }
}

async function openCart(page) {
  await page.getByTestId('shopping-cart-link').click();
  await expect(page).toHaveURL(URLS.cart);
  await expect(pageTitle(page)).toHaveText('Your Cart');
}

// SETUP-CART: logged in, Backpack and Bike Light in the cart, cart page open.
async function setupCart(page) {
  await login(page);
  await addToCart(page, PRODUCTS.backpack, PRODUCTS.bikeLight);
  await expect(cartBadge(page)).toHaveText('2');
  await openCart(page);
  await expect(cartItems(page)).toHaveCount(2);
}

async function startCheckout(page) {
  await page.getByTestId('checkout').click();
  await expect(page).toHaveURL(URLS.info);
  await expect(pageTitle(page)).toHaveText('Checkout: Your Information');
}

// SETUP-INFO: SETUP-CART plus the information page open.
async function setupInfo(page) {
  await setupCart(page);
  await startCheckout(page);
}

async function fillInformation(page, { firstName, lastName, postalCode }) {
  await page.getByTestId('firstName').fill(firstName);
  await page.getByTestId('lastName').fill(lastName);
  await page.getByTestId('postalCode').fill(postalCode);
}

// Always click Continue: pressing Enter in this form triggers Cancel (BUG-03).
async function continueToOverview(page, info = VALID_INFO) {
  await fillInformation(page, info);
  await page.getByTestId('continue').click();
  await expect(page).toHaveURL(URLS.overview);
  await expect(pageTitle(page)).toHaveText('Checkout: Overview');
}

// SETUP-OVERVIEW: SETUP-INFO plus valid information submitted.
async function setupOverview(page) {
  await setupInfo(page);
  await continueToOverview(page);
}

// Returns to a blank information page through the UI; used between data rows.
// The cart link is present in the header of every logged-in page.
async function restartCheckout(page) {
  await openCart(page);
  await startCheckout(page);
}

async function finishOrder(page) {
  await page.getByTestId('finish').click();
  await expect(page).toHaveURL(URLS.complete);
  await expect(pageTitle(page)).toHaveText('Checkout: Complete!');
}

async function logout(page) {
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.getByTestId('logout-sidebar-link').click();
  await expect(page).toHaveURL(URLS.login);
  await expect(page.getByTestId('login-button')).toBeVisible();
}

// afterEach hook: record where a failing test ended up, next to the screenshot and trace.
async function attachFailureContext({ page }, testInfo) {
  if (testInfo.status !== testInfo.expectedStatus) {
    await testInfo.attach('url-at-failure', { body: page.url(), contentType: 'text/plain' });
  }
}

// Test details for cases that fail because of a known application defect.
const knownBug = (description) => ({ tag: '@known-bug', annotation: { type: 'issue', description } });

module.exports = {
  USER, VALID_INFO, PRODUCTS, ALL_PRODUCTS, URLS,
  pageTitle, cartBadge, cartItems, cartItem,
  login, addToCart, openCart, setupCart, startCheckout, setupInfo, fillInformation,
  continueToOverview, setupOverview, restartCheckout, finishOrder, logout,
  attachFailureContext, knownBug,
};
