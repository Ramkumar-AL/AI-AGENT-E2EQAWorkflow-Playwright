# Saucedemo Checkout: Exploratory Testing Results

| | |
|---|---|
| **User story** | SCRUM-101, Saucedemo-ecommerce Checkout Process |
| **Test plan** | `specs/saucedemo-checkout-test-plan.md` (40 test cases) |
| **Application** | https://www.saucedemo.com |
| **Account** | `standard_user` |
| **Browser** | Chrome 154.0.8037.58 |
| **Viewport** | 1280x720 for every test case, never resized |
| **Executed on** | 2026-09-30 |
| **Evidence** | 48 screenshots in `test-evidence/screenshots/` |

## 1. Summary

| Result | Count | Test cases |
|---|---|---|
| **PASS** | 32 | TC-01, TC-03 to TC-17, TC-21 to TC-23, TC-25 to TC-35, TC-38, TC-39 |
| **FAIL** | 8 | TC-02, TC-18, TC-19, TC-20, TC-24, TC-36, TC-37, TC-40 |
| **BLOCKED** | 0 | |

The core purchase flow works: a user can review the cart, enter information, see correct totals, finish the order and get a confirmation, and the cart is cleared afterwards. Login protection on all checkout pages works.

The 8 failures fall into three groups:

- **Input validation is limited to empty-field checks (AC5).** Whitespace, special characters, digits in names and nonsense postal codes are all accepted (TC-18, TC-19, TC-20).
- **Checkout steps are not guarded.** An order can be completed with an empty cart, without entering customer information, or a second time after using browser Back (TC-36, TC-37, TC-40).
- **Two behaviours do not match the story.** The cart page shows no total (TC-02), and pressing Enter in the information form cancels checkout instead of submitting it (TC-24).

### How the tests were executed

The Playwright MCP browser tools were not available in this session, so the scenarios were executed by driving Chrome with a Playwright script that follows each test case's steps, compares actual with expected results and captures screenshots. Each test case ran in a fresh browser context (no cookies or storage).

TC-04 was reported as failed on the first full run because the script read the cart rows before the page had rendered. It passed on three consecutive re-runs and is recorded as PASS.

## 2. Execution results

Screenshot names are relative to `test-evidence/screenshots/`.

### Cart Review (AC1)

| ID | Title | Result | Actual result | Evidence |
|---|---|---|---|---|
| TC-01 | Cart displays all added items with their details | PASS | 2 rows with quantity 1, name, description and price ($29.99, $9.99). | `TC-01-cart-two-items.png` |
| TC-02 | Cart shows the total price calculation | **FAIL** | The cart page has no total or subtotal anywhere. See BUG-01. | `TC-02-cart-no-total.png` |
| TC-03 | Continue Shopping returns to products and keeps the cart | PASS | Lands on `/inventory.html`, badge 2, both buttons show Remove. | `TC-03-inventory-after-continue-shopping.png` |
| TC-04 | Checkout button opens the information page | PASS | Lands on `/checkout-step-one.html`, title "Checkout: Your Information". | `TC-04-info-page.png` |
| TC-05 | Cart page UI elements | PASS | Logo, menu, badge, title, QTY and Description labels, Remove buttons, item links and both action buttons are present. | |
| TC-06 | Removing an item updates the cart and badge | PASS | Badge goes 2, 1, then disappears. Rows are removed immediately. | `TC-06-after-remove-one.png`, `TC-06-empty-cart.png` |
| TC-07 | Cart contents persist after a page reload | PASS | Same 2 items and prices, badge 2. | |
| TC-08 | Cart with all six products | PASS | 6 rows, each quantity 1, all names and prices match. | `TC-08-cart-six-items.png` |
| TC-09 | Item name link opens details and Back returns to cart | PASS | Opens `/inventory-item.html?id=4`. Back returns to the cart with both items. | `TC-09-item-detail.png` |

### Checkout Information Entry (AC2)

| ID | Title | Result | Actual result | Evidence |
|---|---|---|---|---|
| TC-10 | Information page form elements | PASS | Three empty inputs with the expected placeholders, Cancel and Continue enabled, no error. | `TC-10-info-form-empty.png` |
| TC-11 | All fields empty | PASS | "Error: First Name is required". | `TC-11-error-all-empty.png` |
| TC-12 | First Name empty | PASS | "Error: First Name is required". | `TC-12-error-first-name.png` |
| TC-13 | Last Name empty | PASS | "Error: Last Name is required". | `TC-13-error-last-name.png` |
| TC-14 | Zip/Postal Code empty | PASS | "Error: Postal Code is required". | `TC-14-error-postal-code.png` |
| TC-15 | First missing field is reported when several are empty | PASS | All three data rows show the expected error. | |
| TC-16 | Error presentation, retained values and dismissal | PASS | Error shown with close button, entered values retained, X clears the error and highlights, then Continue reaches the overview. See observation O-1. | `TC-16-error-highlight.png`, `TC-16-error-dismissed.png` |
| TC-17 | Cancel on the information page returns to the cart | PASS | Lands on `/cart.html` with both items, badge 2. | |

### Checkout Error Handling (AC5)

| ID | Title | Result | Actual result | Evidence |
|---|---|---|---|---|
| TC-18 | Whitespace-only values are rejected | **FAIL** | Both data rows accepted; overview opens with no error. See BUG-02. | `TC-18-whitespace-row1-input.png`, `TC-18-whitespace-row1-result.png`, `TC-18-whitespace-row2-*.png` |
| TC-19 | Special characters and digits in name fields are rejected | **FAIL** | Both data rows accepted; overview opens with no error. See BUG-02. | `TC-19-special-chars-row1-*.png`, `TC-19-special-chars-row2-*.png` |
| TC-20 | Invalid Zip/Postal Code values are rejected | **FAIL** | `~`+=` and `-1` both accepted. See BUG-02. | `TC-20-invalid-zip-row1-*.png`, `TC-20-invalid-zip-row2-*.png` |
| TC-21 | Minimum-length values are accepted | PASS | `J`, `D`, `1` accepted. | |
| TC-22 | Very long values | PASS | 256-character values accepted, overview opens, no horizontal overflow, no crash. See observation O-2. | `TC-22-long-input.png`, `TC-22-long-result.png` |
| TC-23 | Legitimate international names and postal codes | PASS | `José` / `Müller-Østergård` / `SW1A 1AA` and `Mary` / `O'Brien` / `12345` accepted. | |
| TC-24 | Enter key submits the information form | **FAIL** | Enter lands on `/cart.html` instead of the overview. See BUG-03. | `TC-24-before-enter.png`, `TC-24-after-enter.png` |
| TC-25 | Script input is not executed | PASS | No alert dialog fired; overview opened normally and the input is not rendered in the page. | `TC-25-script-input-result.png` |

### Order Overview (AC3)

| ID | Title | Result | Actual result | Evidence |
|---|---|---|---|---|
| TC-26 | Valid information opens the overview with order summary | PASS | 2 items, `SauceCard #31337`, `Free Pony Express Delivery!`, Item total $39.98, Tax $3.20, Total $43.18, Cancel and Finish enabled. | `TC-26-overview.png` |
| TC-27 | Overview totals for all six products | PASS | Item total $129.94 equals the sum of prices, Tax $10.40 (8%), Total $140.34. | `TC-27-overview-six-items.png` |
| TC-28 | Overview items are read-only | PASS | No Remove buttons or inputs in the item rows, badge 2. | |
| TC-29 | Cancel on the overview keeps the cart | PASS | Lands on `/inventory.html`, badge 2, both items still in the cart. | |

### Order Completion (AC4, BR2)

| ID | Title | Result | Actual result | Evidence |
|---|---|---|---|---|
| TC-30 | End-to-end purchase completes with a confirmation | PASS | "Checkout: Complete!", "Thank you for your order!", dispatch message, Pony Express image and Back Home button. | `TC-30-step1-cart.png`, `TC-30-step2-info-filled.png`, `TC-30-step3-overview.png`, `TC-30-step4-complete.png` |
| TC-31 | Back Home returns to the products page | PASS | Lands on `/inventory.html` with six products. | |
| TC-32 | Order confirmation clears the cart | PASS | No badge, product buttons reset to Add to cart, cart is empty. | `TC-32-cart-empty-after-order.png` |

### Access Control and Business Rules

| ID | Title | Result | Actual result | Evidence |
|---|---|---|---|---|
| TC-33 | Logged-out users cannot open cart or checkout pages | PASS | All four paths redirect to login with "Epic sadface: You can only access '<path>' when you are logged in." | `TC-33-logged-out-redirect.png` |
| TC-34 | Checkout is inaccessible after logout | PASS | Redirected to login with the access error. | |
| TC-35 | Cart is retained across logout and login | PASS | Badge 1 and the Onesie is listed after logging in again. See observation O-3. | `TC-35-cart-after-relogin.png` |
| TC-36 | Checkout with an empty cart is prevented | **FAIL** | Checkout is enabled with an empty cart and the order completes at $0.00. See BUG-04. | `TC-36-empty-cart.png`, `TC-36-empty-overview.png`, `TC-36-empty-order-complete.png` |
| TC-37 | Overview cannot be reached without checkout information | **FAIL** | `/checkout-step-two.html` opens directly and Finish completes the order. See BUG-05. | `TC-37-overview-direct-access.png` |

### Navigation and Browser Back Button

| ID | Title | Result | Actual result | Evidence |
|---|---|---|---|---|
| TC-38 | Back from the information page returns to the cart | PASS | Cart shows both items; restarting checkout shows empty fields and no error. | |
| TC-39 | Back and Forward between overview and information | PASS | Back shows the information page with empty fields, Forward restores the overview with Total $43.18, Back twice reaches the cart. See observation O-4. | `TC-39-back-to-info-fields-empty.png` |
| TC-40 | Back from the confirmation page cannot resubmit | **FAIL** | Back shows an empty overview with an active Finish button, and clicking it confirms a second order. See BUG-06. | `TC-40-back-from-complete.png`, `TC-40-second-empty-order.png` |

## 3. Bugs discovered

Severity is a suggestion for triage.

### BUG-01: Cart page does not show a total price
- **Test case / AC:** TC-02, AC1
- **Severity:** Medium
- **Steps:** Log in, add Sauce Labs Backpack and Sauce Labs Bike Light, open the cart.
- **Expected:** A total price ($39.98) is shown on the cart page.
- **Actual:** Only per-item prices are shown. A total first appears on the overview page.
- **Evidence:** `TC-02-cart-no-total.png`

### BUG-02: Checkout information fields validate only for empty values
- **Test case / AC:** TC-18, TC-19, TC-20, AC5
- **Severity:** High
- **Steps:** On the information page, enter any of the values below and click Continue.

| First Name | Last Name | Zip/Postal Code |
|---|---|---|
| one space | one space | one space |
| three spaces | `Doe` | `12345` |
| `@#$%^&*` | `!<>?/\|` | `12345` |
| `12345` | `67890` | `12345` |
| `John` | `Doe` | `~`+=` |
| `John` | `Doe` | `-1` |

- **Expected:** A validation error is shown and the user cannot proceed.
- **Actual:** Every row is accepted and the overview page opens with no error.
- **Evidence:** `TC-18-*.png`, `TC-19-*.png`, `TC-20-*.png`
- **Note:** The story does not define the exact rules. Format rules for names and postal codes need to be agreed before this can be fixed.

### BUG-03: Pressing Enter in the information form cancels checkout
- **Test case / AC:** TC-24, AC2
- **Severity:** Medium
- **Steps:** On the information page, enter `John`, `Doe`, `12345`, then press Enter in the Zip field.
- **Expected:** The form is submitted and the overview page opens.
- **Actual:** The user is returned to `/cart.html` and the entered data is lost. With all fields empty, Enter also returns to the cart with no required-field error.
- **Likely cause:** The Cancel `<button>` has no `type` attribute, so it defaults to a submit button, and it precedes the Continue input in the form. Enter therefore activates Cancel.
- **Evidence:** `TC-24-before-enter.png`, `TC-24-after-enter.png`

### BUG-04: An order can be placed with an empty cart
- **Test case / AC:** TC-36, AC1 and AC2 preconditions
- **Severity:** High
- **Steps:** Log in, open the cart without adding anything, click Checkout, enter any information, click Continue, click Finish.
- **Expected:** Checkout cannot start with an empty cart.
- **Actual:** The overview shows "Item total: $0", "Tax: $0.00", "Total: $0.00", and Finish shows "Thank you for your order!".
- **Evidence:** `TC-36-empty-cart.png`, `TC-36-empty-overview.png`, `TC-36-empty-order-complete.png`

### BUG-05: The overview page can be opened without entering checkout information
- **Test case / AC:** TC-37, AC2 (mandatory fields), AC3
- **Severity:** High
- **Steps:** Log in, add two items, open `https://www.saucedemo.com/checkout-step-two.html` directly, click Finish.
- **Expected:** The user is sent to the information page or the cart.
- **Actual:** The overview opens with both items, and Finish completes the order with no customer information entered.
- **Evidence:** `TC-37-overview-direct-access.png`

### BUG-06: Browser Back after confirmation allows a second, empty order
- **Test case / AC:** TC-40, AC4
- **Severity:** Medium
- **Steps:** Complete an order, click the browser Back button on the confirmation page, click Finish.
- **Expected:** The completed order cannot be resubmitted.
- **Actual:** The overview opens with no items, Total $0.00 and an active Finish button. Clicking it shows the confirmation page again. The cart itself stays empty, so business rule 2 holds.
- **Evidence:** `TC-40-back-from-complete.png`, `TC-40-second-empty-order.png`

BUG-04, BUG-05 and BUG-06 probably share one cause: the overview and confirmation pages do not check that the cart has items and that information was entered in the current checkout.

## 4. Observations and UI inconsistencies

These are not failures against the story, but are worth a decision.

| ID | Observation |
|---|---|
| O-1 | When only one field is missing, all three fields are highlighted with a red underline and error icon, including the correctly filled ones. Only the message identifies the missing field (`TC-16-error-highlight.png`). |
| O-2 | The inputs have no `maxlength`. 256-character values are accepted without any limit. |
| O-3 | The cart survives logout and login. The story does not say whether it should. |
| O-4 | Browser Back from the overview shows the information page with empty fields, so the user must retype everything to change one value. |
| O-5 | The two Cancel buttons behave differently: on the information page Cancel returns to the cart, on the overview page it returns to the products page. |
| O-6 | The item total is formatted inconsistently for an empty order: "Item total: $0" next to "Tax: $0.00" and "Total: $0.00". |
| O-7 | Quantity in the cart is a read-only value. There is no way to order more than one of a product. |
| O-8 | The confirmation page shows no order number or order summary. It has a "Generate PDF order" button that the story does not mention and that was not tested. |
| O-9 | Error messages are inconsistent in naming: the field is labelled "Zip/Postal Code" but the error says "Postal Code is required". |
| O-10 | Reloading `/cart.html` returns HTTP 404 from the server although the page then renders correctly (single-page-app fallback). The browser console logs a "404" resource error. |
| O-11 | The console logged "401 (Unauthorized)" resource errors during many test cases. The failing request was not identified; it did not recur in a dedicated network capture and had no visible effect on the flow. |

## 5. Element selectors that worked reliably

All selectors below were used across the 40 test cases without a locator failure. The `data-test` attributes are stable and are the recommended choice for automation.

| Page | Element | Selector |
|---|---|---|
| Login | Username, password, login button | `[data-test="username"]`, `[data-test="password"]`, `[data-test="login-button"]` |
| Login / Information | Error message, error close button | `[data-test="error"]`, `[data-test="error-button"]` |
| All pages | Page title | `.title` |
| All pages | Cart link, cart badge | `[data-test="shopping-cart-link"]`, `.shopping_cart_badge` |
| All pages | Menu button, logout link | `#react-burger-menu-btn`, `[data-test="logout-sidebar-link"]` |
| Products | Add to cart / Remove | `[data-test="add-to-cart-sauce-labs-backpack"]`, `[data-test="remove-sauce-labs-backpack"]` (pattern: `add-to-cart-<product-slug>`, `remove-<product-slug>`) |
| Products | All add buttons, product cards | `button[data-test^="add-to-cart"]`, `.inventory_item` |
| Cart / Overview | Item row and its parts | `.cart_item`, `.cart_quantity`, `.inventory_item_name`, `.inventory_item_desc`, `.inventory_item_price` |
| Cart | Column labels | `.cart_quantity_label`, `.cart_desc_label` |
| Cart | Continue Shopping, Checkout | `[data-test="continue-shopping"]`, `[data-test="checkout"]` |
| Information | First Name, Last Name, Zip | `[data-test="firstName"]`, `[data-test="lastName"]`, `[data-test="postalCode"]` |
| Information | Cancel, Continue | `[data-test="cancel"]`, `[data-test="continue"]` |
| Information | Highlighted fields, error icons | `input.error`, `.error_icon` |
| Overview | Payment and shipping values | `[data-test="payment-info-value"]`, `[data-test="shipping-info-value"]` |
| Overview | Item total, tax, total | `[data-test="subtotal-label"]`, `[data-test="tax-label"]`, `[data-test="total-label"]` |
| Overview | Cancel, Finish | `[data-test="cancel"]`, `[data-test="finish"]` |
| Confirmation | Header, message, image, Back Home | `.complete-header`, `.complete-text`, `[data-test="pony-express"]`, `[data-test="back-to-products"]` |
| Product detail | Product name | `.inventory_details_name` |

### Automation notes

- **Wait for content, not only the URL.** The app is a single-page app and the URL changes before the page content renders. Asserting on cart rows immediately after the URL change caused one false failure (TC-04). Playwright's auto-waiting `expect(locator)` assertions avoid this.
- **The cart badge is removed from the DOM when the cart is empty.** Assert that it has count 0 instead of reading its text.
- **Adding all products:** the list of "Add to cart" buttons shrinks as each is clicked, so click the first match repeatedly instead of iterating a fixed list.
- **The Test.allTheThings() T-Shirt** has the selector `add-to-cart-test.allthethings()-t-shirt-(red)`, which contains dots and parentheses and must be used as a quoted attribute value.
- **Do not submit the information form with Enter** in automated tests until BUG-03 is fixed; click Continue.

## 6. Not covered

- Browsers other than Chrome and viewport sizes other than 1280x720.
- The other Saucedemo accounts (`locked_out_user`, `problem_user`, and so on).
- The "Generate PDF order" button, the "Dynamic Catalog", "About" and "Reset App State" menu items.
- Accessibility and performance.
