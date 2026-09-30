# Saucedemo Checkout Process: Test Plan

| | |
|---|---|
| **User story** | SCRUM-101, Saucedemo-ecommerce Checkout Process (`user_stories/Saucedemo-ecommerce.md`) |
| **Application** | https://www.saucedemo.com |
| **Credentials** | Username `standard_user`, password `secret_sauce` |
| **Browser** | Chrome only (explored on Chrome 154) |
| **Automation** | Playwright (`@playwright/test` 1.63) |
| **Explored on** | 2026-09-30 |
| **Total test cases** | 40 |

## 1. Scope

**In scope:** the five acceptance criteria (AC1 to AC5), the two business rules (BR1: login required for checkout, BR2: order confirmation clears the cart), navigation flow and browser back-button behaviour.

**Out of scope:** browsers other than Chrome, the other Saucedemo accounts (`locked_out_user`, `problem_user`, etc.), product sorting, the "Dynamic Catalog" and "About" menu links, the "Generate PDF order" button on the confirmation page (not mentioned in the story), performance and accessibility.

## 2. How to read this plan

- Every test case starts from a **fresh browser context** (no cookies or storage), so cases are independent and can run in any order.
- **Expected results come from the user story**, not from the application's current behaviour.
- Each case has an **Exploration result** line recording what the application actually did on 2026-09-30. `Matches` means the case is expected to pass. `DEVIATION` means the application did not meet the expected result, so the case is expected to fail and is a bug candidate. `CLARIFY` means the story does not define the behaviour and the product owner needs to decide.

### Deviations found during exploration

| Test case | AC | Summary |
|---|---|---|
| TC-02 | AC1 | The cart page shows no total price. Totals appear only on the overview page. |
| TC-18 | AC5 | Whitespace-only values are accepted in all three fields. |
| TC-19 | AC5 | Special characters and digits are accepted in First Name and Last Name. |
| TC-20 | AC5 | Any non-empty text is accepted as Zip/Postal Code (`~`+=`, `-1`). |
| TC-24 | AC2 | Pressing Enter in the form triggers Cancel and returns to the cart instead of submitting. |
| TC-36 | BR2 | Checkout can be completed with an empty cart, producing a $0.00 order. |
| TC-37 | AC3 | The overview page can be opened directly by URL without entering checkout information. |
| TC-40 | AC4 | Browser Back from the confirmation page shows an empty overview with an active Finish button. |

## 3. Shared setup and test data

### Setup blocks

**SETUP-LOGIN**
1. Open https://www.saucedemo.com.
2. Enter `standard_user` in Username and `secret_sauce` in Password.
3. Click **Login**. The products page (`/inventory.html`) is displayed.

**SETUP-CART** (SETUP-LOGIN plus two items)
1. Perform SETUP-LOGIN.
2. Click **Add to cart** for *Sauce Labs Backpack* and *Sauce Labs Bike Light*. The cart badge shows `2`.
3. Click the cart icon. The cart page (`/cart.html`) is displayed.

**SETUP-INFO** (SETUP-CART plus checkout started)
1. Perform SETUP-CART.
2. Click **Checkout**. The page "Checkout: Your Information" (`/checkout-step-one.html`) is displayed.

**SETUP-OVERVIEW** (SETUP-INFO plus valid information)
1. Perform SETUP-INFO.
2. Enter First Name `John`, Last Name `Doe`, Zip/Postal Code `12345`.
3. Click **Continue**. The page "Checkout: Overview" (`/checkout-step-two.html`) is displayed.

### Product data

| Product | Price |
|---|---|
| Sauce Labs Backpack | $29.99 |
| Sauce Labs Bike Light | $9.99 |
| Sauce Labs Bolt T-Shirt | $15.99 |
| Sauce Labs Fleece Jacket | $49.99 |
| Sauce Labs Onesie | $7.99 |
| Test.allTheThings() T-Shirt (Red) | $15.99 |

### Expected totals (tax is 8% of the item total, rounded to 2 decimals)

| Cart contents | Item total | Tax | Total |
|---|---|---|---|
| Backpack + Bike Light | $39.98 | $3.20 | $43.18 |
| All six products | $129.94 | $10.40 | $140.34 |

### Fixed page values

| Page | Element | Value |
|---|---|---|
| Overview | Payment Information | `SauceCard #31337` |
| Overview | Shipping Information | `Free Pony Express Delivery!` |
| Confirmation | Header | `Thank you for your order!` |
| Confirmation | Message | `Your order has been dispatched, and will arrive just as fast as the pony can get there!` |
| Login | Logged-out access error | `Epic sadface: You can only access '<path>' when you are logged in.` |

### Locator reference (`data-test` attributes)

| Page | Locators |
|---|---|
| Login | `username`, `password`, `login-button`, `error` |
| Products | `add-to-cart-sauce-labs-backpack`, `add-to-cart-sauce-labs-bike-light`, `shopping-cart-link`; badge `.shopping_cart_badge` |
| Cart | `continue-shopping`, `checkout`, `remove-sauce-labs-backpack`, `remove-sauce-labs-bike-light`; rows `.cart_item`, `.cart_quantity`, `.inventory_item_name`, `.inventory_item_desc`, `.inventory_item_price` |
| Information | `firstName`, `lastName`, `postalCode`, `cancel`, `continue`, `error`, `error-button` |
| Overview | `payment-info-value`, `shipping-info-value`, `subtotal-label`, `tax-label`, `total-label`, `cancel`, `finish` |
| Confirmation | `back-to-products`, `pony-express`; header `.complete-header`, message `.complete-text` |
| Menu | `#react-burger-menu-btn`, `logout-sidebar-link` |

---

## 4. Cart Review (AC1)

### TC-01: Cart displays all added items with their details
- **Covers:** AC1
- **Type:** Happy path
- **Test data:** Sauce Labs Backpack ($29.99), Sauce Labs Bike Light ($9.99)

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-LOGIN. | Products page is displayed. |
| 2 | Click **Add to cart** for Sauce Labs Backpack. | Button changes to **Remove**. Cart badge shows `1`. |
| 3 | Click **Add to cart** for Sauce Labs Bike Light. | Cart badge shows `2`. |
| 4 | Click the cart icon. | URL is `/cart.html`. Page title is "Your Cart". |
| 5 | Count the item rows. | Exactly 2 rows are listed. |
| 6 | Inspect the first row. | Quantity `1`, name "Sauce Labs Backpack", a non-empty description, price `$29.99`. |
| 7 | Inspect the second row. | Quantity `1`, name "Sauce Labs Bike Light", a non-empty description, price `$9.99`. |

**Exploration result:** Matches.

### TC-02: Cart shows the total price calculation
- **Covers:** AC1
- **Type:** Happy path
- **Test data:** Backpack + Bike Light, expected total of item prices $39.98

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-CART. | Cart page lists 2 items. |
| 2 | Look for a total price on the cart page. | A total is displayed and equals the sum of the item prices, $39.98. |

**Exploration result:** DEVIATION. The cart page contains no total or subtotal. Totals are shown only on the overview page.

### TC-03: Continue Shopping returns to the products page and keeps the cart
- **Covers:** AC1
- **Type:** Happy path / navigation
- **Test data:** Backpack + Bike Light

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-CART. | Cart page lists 2 items. |
| 2 | Click **Continue Shopping**. | URL is `/inventory.html`. Products are listed. |
| 3 | Check the cart badge. | Badge still shows `2`. |
| 4 | Check the Backpack and Bike Light buttons. | Both show **Remove**. |

**Exploration result:** Matches.

### TC-04: Checkout button opens the checkout information page
- **Covers:** AC1, AC2
- **Type:** Happy path
- **Test data:** Backpack + Bike Light

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-CART. | Cart page lists 2 items. |
| 2 | Click **Checkout**. | URL is `/checkout-step-one.html`. Page title is "Checkout: Your Information". |

**Exploration result:** Matches.

### TC-05: Cart page UI elements
- **Covers:** AC1
- **Type:** UI validation
- **Test data:** Backpack + Bike Light

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-CART. | Cart page is displayed. |
| 2 | Check the page header. | App logo "Swag Labs", menu button, cart icon with badge `2`, title "Your Cart". |
| 3 | Check the list header. | Column labels "QTY" and "Description" are visible. |
| 4 | Check each item row. | Each row has a **Remove** button and the item name is a link. |
| 5 | Check the action buttons. | **Continue Shopping** and **Checkout** are visible and enabled. |

**Exploration result:** Matches.

### TC-06: Removing an item updates the cart and badge
- **Covers:** AC1
- **Type:** Edge case
- **Test data:** Backpack + Bike Light

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-CART. | Cart page lists 2 items, badge `2`. |
| 2 | Click **Remove** on Sauce Labs Bike Light. | The Bike Light row disappears. 1 row remains (Backpack). Badge shows `1`. |
| 3 | Click **Remove** on Sauce Labs Backpack. | No item rows remain. The cart badge is no longer displayed. |

**Exploration result:** Matches.

### TC-07: Cart contents persist after a page reload
- **Covers:** AC1
- **Type:** Edge case
- **Test data:** Backpack + Bike Light

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-CART. | Cart page lists 2 items. |
| 2 | Reload the page. | Cart page still lists the same 2 items with the same prices. Badge shows `2`. |

**Exploration result:** Matches.

### TC-08: Cart with all six products
- **Covers:** AC1
- **Type:** Boundary (maximum catalogue size)
- **Test data:** All six products

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-LOGIN. | Products page is displayed. |
| 2 | Click **Add to cart** on all six products. | Badge shows `6`. |
| 3 | Click the cart icon. | Cart lists 6 rows, each with quantity `1`. |
| 4 | Compare each row's name and price with the product data table. | All six names and prices match. |

**Exploration result:** Badge `6` confirmed, and the six prices were confirmed on the overview page. The six rows were not inspected on the cart page itself.

### TC-09: Item name link opens product details and Back returns to the cart
- **Covers:** AC1
- **Type:** Navigation
- **Test data:** Backpack + Bike Light

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-CART. | Cart page lists 2 items. |
| 2 | Click the name "Sauce Labs Backpack". | URL is `/inventory-item.html?id=4`. The Backpack detail page is shown. |
| 3 | Click the browser Back button. | URL is `/cart.html`. Both items are still listed. |

**Exploration result:** Matches.

---

## 5. Checkout Information Entry (AC2)

### TC-10: Information page form elements
- **Covers:** AC2
- **Type:** UI validation
- **Test data:** None

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-INFO. | Title "Checkout: Your Information" is displayed. |
| 2 | Check the form fields. | Three empty text inputs with placeholders "First Name", "Last Name", "Zip/Postal Code", in that order. |
| 3 | Check the buttons. | **Cancel** and **Continue** are visible and enabled. |
| 4 | Check for errors. | No error message is displayed. |

**Exploration result:** Matches.

### TC-11: All fields empty shows a required-field error
- **Covers:** AC2
- **Type:** Negative
- **Test data:** First Name empty, Last Name empty, Zip empty

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-INFO. | Information page is displayed. |
| 2 | Leave all fields empty and click **Continue**. | URL stays `/checkout-step-one.html`. |
| 3 | Read the error message. | "Error: First Name is required". |

**Exploration result:** Matches.

### TC-12: First Name empty
- **Covers:** AC2
- **Type:** Negative
- **Test data:** First Name empty, Last Name `Doe`, Zip `12345`

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-INFO. | Information page is displayed. |
| 2 | Enter Last Name `Doe` and Zip `12345`. Leave First Name empty. | Values are shown in the fields. |
| 3 | Click **Continue**. | URL stays `/checkout-step-one.html`. Error "Error: First Name is required" is displayed. |

**Exploration result:** Matches.

### TC-13: Last Name empty
- **Covers:** AC2
- **Type:** Negative
- **Test data:** First Name `John`, Last Name empty, Zip `12345`

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-INFO. | Information page is displayed. |
| 2 | Enter First Name `John` and Zip `12345`. Leave Last Name empty. | Values are shown in the fields. |
| 3 | Click **Continue**. | URL stays `/checkout-step-one.html`. Error "Error: Last Name is required" is displayed. |

**Exploration result:** Matches.

### TC-14: Zip/Postal Code empty
- **Covers:** AC2
- **Type:** Negative
- **Test data:** First Name `John`, Last Name `Doe`, Zip empty

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-INFO. | Information page is displayed. |
| 2 | Enter First Name `John` and Last Name `Doe`. Leave Zip empty. | Values are shown in the fields. |
| 3 | Click **Continue**. | URL stays `/checkout-step-one.html`. Error "Error: Postal Code is required" is displayed. |

**Exploration result:** Matches.

### TC-15: Error reports the first missing field when several are empty
- **Covers:** AC2
- **Type:** Negative (data-driven)
- **Test data:**

| First Name | Last Name | Zip | Expected error |
|---|---|---|---|
| `John` | empty | empty | Error: Last Name is required |
| empty | `Doe` | empty | Error: First Name is required |
| empty | empty | `12345` | Error: First Name is required |

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-INFO. | Information page is displayed. |
| 2 | Enter the values from one data row and click **Continue**. | URL stays `/checkout-step-one.html`. The expected error for that row is displayed. |
| 3 | Repeat steps 1 and 2 for each remaining data row. | Each row shows its expected error. |

**Exploration result:** Matches for all three rows.

### TC-16: Error presentation, retained values and dismissal
- **Covers:** AC2
- **Type:** UI validation / negative
- **Test data:** First Name `John`, Last Name `Doe`, Zip empty

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-INFO. | Information page is displayed. |
| 2 | Enter First Name `John` and Last Name `Doe`, then click **Continue**. | Error "Error: Postal Code is required" is displayed with a close (X) button. The fields are highlighted with error icons. |
| 3 | Check the field values. | First Name still contains `John`, Last Name still contains `Doe`. |
| 4 | Click the error close (X) button. | The error message, field highlights and error icons disappear. |
| 5 | Enter Zip `12345` and click **Continue**. | URL is `/checkout-step-two.html`. |

**Exploration result:** Matches. Note: the application highlights all three fields, not only the missing one.

### TC-17: Cancel on the information page returns to the cart
- **Covers:** AC2
- **Type:** Navigation
- **Test data:** First Name `John`

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-INFO. | Information page is displayed. |
| 2 | Enter First Name `John`. | Value is shown. |
| 3 | Click **Cancel**. | URL is `/cart.html`. Both items are still listed. Badge shows `2`. |

**Exploration result:** Matches.

---

## 6. Checkout Error Handling (AC5)

### TC-18: Whitespace-only values are rejected
- **Covers:** AC5, AC2
- **Type:** Negative (data-driven)
- **Test data:**

| First Name | Last Name | Zip | Expected error |
|---|---|---|---|
| one space | one space | one space | First Name is required |
| three spaces | `Doe` | `12345` | First Name is required |

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-INFO. | Information page is displayed. |
| 2 | Enter the values from one data row and click **Continue**. | URL stays `/checkout-step-one.html`. A validation error for First Name is displayed. |
| 3 | Repeat for the second data row. | Same result. |

**Exploration result:** DEVIATION. Both rows are accepted and the overview page opens with no error.

### TC-19: Special characters and digits in name fields are rejected
- **Covers:** AC5
- **Type:** Negative (data-driven)
- **Test data:**

| First Name | Last Name | Zip |
|---|---|---|
| `@#$%^&*` | `!<>?/\|` | `12345` |
| `12345` | `67890` | `12345` |

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-INFO. | Information page is displayed. |
| 2 | Enter the values from one data row and click **Continue**. | URL stays `/checkout-step-one.html`. A validation error identifying the invalid name field is displayed. |
| 3 | Repeat for the second data row. | Same result. |

**Exploration result:** DEVIATION. Both rows are accepted and the overview page opens with no error.

### TC-20: Invalid Zip/Postal Code values are rejected
- **Covers:** AC5
- **Type:** Negative (data-driven)
- **Test data:** First Name `John`, Last Name `Doe`, with Zip values `~`+=` and `-1`

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-INFO. | Information page is displayed. |
| 2 | Enter `John`, `Doe` and one Zip value, then click **Continue**. | URL stays `/checkout-step-one.html`. A validation error for Postal Code is displayed. |
| 3 | Repeat for the second Zip value. | Same result. |

**Exploration result:** DEVIATION. Both values are accepted. CLARIFY: the story does not define a valid postal code format. Alphabetic values such as `ABCDE` are also accepted, but alphanumeric codes are legitimate in some countries, so they are not treated as invalid here.

### TC-21: Minimum-length values are accepted
- **Covers:** AC5, AC2
- **Type:** Boundary
- **Test data:** First Name `J`, Last Name `D`, Zip `1`

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-INFO. | Information page is displayed. |
| 2 | Enter `J`, `D`, `1` and click **Continue**. | URL is `/checkout-step-two.html`. No error is displayed. |

**Exploration result:** Matches. CLARIFY: whether a one-character postal code should be valid.

### TC-22: Very long values
- **Covers:** AC5
- **Type:** Boundary
- **Test data:** First Name 256 × `A`, Last Name 256 × `B`, Zip 256 × `9`

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-INFO. | Information page is displayed. |
| 2 | Enter the three 256-character values. | The fields accept input without the page layout breaking. |
| 3 | Click **Continue**. | Either the overview page opens, or a clear length validation error is shown. The page does not crash or hang. |

**Exploration result:** CLARIFY. The values are accepted and the overview page opens. The inputs have no `maxlength`, and the story defines no length limits.

### TC-23: Legitimate international names and postal codes are accepted
- **Covers:** AC5, AC2
- **Type:** Edge case (guards against over-strict validation)
- **Test data:**

| First Name | Last Name | Zip |
|---|---|---|
| `José` | `Müller-Østergård` | `SW1A 1AA` |
| `Mary` | `O'Brien` | `12345` |

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-INFO. | Information page is displayed. |
| 2 | Enter the values from one data row and click **Continue**. | URL is `/checkout-step-two.html`. No error is displayed. |
| 3 | Repeat for the second data row. | Same result. |

**Exploration result:** Matches.

### TC-24: Enter key submits the information form
- **Covers:** AC2
- **Type:** Edge case (keyboard)
- **Test data:** First Name `John`, Last Name `Doe`, Zip `12345`

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-INFO. | Information page is displayed. |
| 2 | Enter `John`, `Doe`, `12345`. | Values are shown. |
| 3 | With focus in the Zip field, press **Enter**. | The form is submitted. URL is `/checkout-step-two.html`. |

**Exploration result:** DEVIATION. Enter navigates to `/cart.html`, as if **Cancel** had been clicked. With empty fields, Enter also goes to the cart without showing a required-field error. Cause: the Cancel button precedes Continue in the form and has no `type`, so it acts as the default submit button.

### TC-25: Script input is not executed
- **Covers:** AC5
- **Type:** Negative (security)
- **Test data:** First Name `<script>alert(1)</script>`, Last Name `Doe`, Zip `12345`

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-INFO. | Information page is displayed. |
| 2 | Enter the test data and click **Continue**. | No JavaScript alert dialog appears. |
| 3 | Check the resulting page. | Either a validation error is shown, or the overview page opens with its normal layout and no injected content. |

**Exploration result:** The value is accepted and the overview page opens with its normal content. The entered name is not rendered on the overview page. Dialog absence was not explicitly asserted during exploration, so the automated test must register a `dialog` listener and fail if one fires.

---

## 7. Order Overview (AC3)

### TC-26: Valid information opens the overview with order summary
- **Covers:** AC3, AC2
- **Type:** Happy path
- **Test data:** Backpack + Bike Light; `John`, `Doe`, `12345`

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-INFO. | Information page is displayed. |
| 2 | Enter `John`, `Doe`, `12345` and click **Continue**. | URL is `/checkout-step-two.html`. Title is "Checkout: Overview". |
| 3 | Check the item list. | 2 rows: Sauce Labs Backpack, qty `1`, `$29.99`; Sauce Labs Bike Light, qty `1`, `$9.99`. Each has a description. |
| 4 | Check payment information. | Label "Payment Information:" with value `SauceCard #31337`. |
| 5 | Check shipping information. | Label "Shipping Information:" with value `Free Pony Express Delivery!`. |
| 6 | Check the price section. | "Item total: $39.98", "Tax: $3.20", "Total: $43.18". |
| 7 | Check the buttons. | **Cancel** and **Finish** are visible and enabled. |

**Exploration result:** Matches.

### TC-27: Overview totals are calculated correctly for all six products
- **Covers:** AC3
- **Type:** Boundary / calculation
- **Test data:** All six products; `John`, `Doe`, `12345`

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-LOGIN and add all six products to the cart. | Badge shows `6`. |
| 2 | Open the cart, click **Checkout**, enter `John`, `Doe`, `12345`, click **Continue**. | Overview page lists 6 items. |
| 3 | Sum the displayed item prices. | The sum equals the displayed "Item total: $129.94". |
| 4 | Check the tax. | "Tax: $10.40" (8% of the item total, rounded to 2 decimals). |
| 5 | Check the total. | "Total: $140.34", equal to item total plus tax. |

**Exploration result:** Matches.

### TC-28: Overview items are read-only
- **Covers:** AC3
- **Type:** UI validation
- **Test data:** Backpack + Bike Light

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-OVERVIEW. | Overview page lists 2 items. |
| 2 | Check the item rows. | No **Remove** button and no editable quantity are present. |
| 3 | Check the cart badge. | Badge shows `2`, matching the number of rows. |

**Exploration result:** Matches.

### TC-29: Cancel on the overview page abandons checkout and keeps the cart
- **Covers:** AC3
- **Type:** Navigation
- **Test data:** Backpack + Bike Light

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-OVERVIEW. | Overview page is displayed. |
| 2 | Click **Cancel**. | URL is `/inventory.html`. |
| 3 | Check the cart badge. | Badge shows `2`. No order was placed. |
| 4 | Click the cart icon. | Both items are still in the cart. |

**Exploration result:** Matches. Note: Cancel here returns to the products page, while Cancel on the information page returns to the cart.

---

## 8. Order Completion (AC4, BR2)

### TC-30: End-to-end purchase completes with a confirmation
- **Covers:** AC1, AC2, AC3, AC4
- **Type:** Happy path (end to end)
- **Test data:** Backpack + Bike Light; `John`, `Doe`, `12345`

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-CART. | Cart lists 2 items. |
| 2 | Click **Checkout**. | Information page is displayed. |
| 3 | Enter `John`, `Doe`, `12345` and click **Continue**. | Overview page shows "Total: $43.18". |
| 4 | Click **Finish**. | URL is `/checkout-complete.html`. Title is "Checkout: Complete!". |
| 5 | Check the success message. | Header "Thank you for your order!" and message "Your order has been dispatched, and will arrive just as fast as the pony can get there!" are displayed. |
| 6 | Check the confirmation image and button. | The Pony Express image and the **Back Home** button are visible. |

**Exploration result:** Matches.

### TC-31: Back Home returns to the products page
- **Covers:** AC4
- **Type:** Happy path / navigation
- **Test data:** Backpack + Bike Light

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-OVERVIEW and click **Finish**. | Confirmation page is displayed. |
| 2 | Click **Back Home**. | URL is `/inventory.html`. All six products are listed. |

**Exploration result:** Matches.

### TC-32: Order confirmation clears the cart
- **Covers:** AC4, BR2
- **Type:** Happy path (business rule)
- **Test data:** Backpack + Bike Light

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-OVERVIEW and click **Finish**. | Confirmation page is displayed. |
| 2 | Check the cart icon. | No badge is displayed. |
| 3 | Click **Back Home**. | Backpack and Bike Light buttons show **Add to cart** again. |
| 4 | Click the cart icon. | The cart page lists no items. |

**Exploration result:** Matches.

---

## 9. Access Control and Business Rules (BR1, BR2)

### TC-33: Logged-out users cannot open cart or checkout pages
- **Covers:** BR1
- **Type:** Negative (data-driven)
- **Test data:** Paths `/cart.html`, `/checkout-step-one.html`, `/checkout-step-two.html`, `/checkout-complete.html`

| # | Step | Expected result |
|---|---|---|
| 1 | In a fresh browser context (not logged in), open `https://www.saucedemo.com` + one path. | The login page (`/`) is displayed instead. |
| 2 | Read the error message. | "Epic sadface: You can only access '<path>' when you are logged in." with the requested path. |
| 3 | Repeat for each remaining path. | Same result for every path. |

**Exploration result:** Matches for all four paths.

### TC-34: Checkout is inaccessible after logout
- **Covers:** BR1
- **Type:** Negative
- **Test data:** Sauce Labs Onesie

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-LOGIN and add Sauce Labs Onesie to the cart. | Badge shows `1`. |
| 2 | Open the menu and click **Logout**. | Login page is displayed. |
| 3 | Open `https://www.saucedemo.com/checkout-step-one.html` directly. | Login page is displayed with "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in." |

**Exploration result:** Matches.

### TC-35: Cart is retained across logout and login
- **Covers:** BR1, AC1
- **Type:** Edge case
- **Test data:** Sauce Labs Onesie

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-LOGIN and add Sauce Labs Onesie to the cart. | Badge shows `1`. |
| 2 | Open the menu and click **Logout**. | Login page is displayed. |
| 3 | Log in again as `standard_user`. | Products page is displayed. Badge shows `1`. |
| 4 | Click the cart icon. | Sauce Labs Onesie is listed. |

**Exploration result:** Badge shows `1` after logging in again. CLARIFY: the story does not say whether the cart should survive logout.

### TC-36: Checkout with an empty cart is prevented
- **Covers:** AC1, AC2 ("cart page with items")
- **Type:** Negative / edge case
- **Test data:** Empty cart; `A`, `B`, `1`

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-LOGIN. Do not add any product. | No cart badge is displayed. |
| 2 | Click the cart icon. | Cart page shows no item rows. |
| 3 | Click **Checkout**. | Checkout does not start: the button is disabled or a message says the cart is empty. |

**Exploration result:** DEVIATION / CLARIFY. Checkout is enabled with an empty cart. Entering any information opens an overview with "Item total: $0", "Tax: $0.00", "Total: $0.00", and **Finish** shows "Thank you for your order!" for an order with no items. The story does not explicitly forbid this.

### TC-37: Overview cannot be reached without entering checkout information
- **Covers:** AC3 ("GIVEN I have entered valid checkout information")
- **Type:** Negative
- **Test data:** Backpack + Bike Light

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-CART. | Cart lists 2 items. |
| 2 | Open `https://www.saucedemo.com/checkout-step-two.html` directly. | The overview is not shown. The user is sent to the information page or the cart. |

**Exploration result:** DEVIATION. The overview page opens with both items and an active **Finish** button, so the mandatory fields can be bypassed.

---

## 10. Navigation and Browser Back Button

### TC-38: Browser Back from the information page returns to the cart
- **Covers:** AC2 (navigation)
- **Type:** Navigation
- **Test data:** Backpack + Bike Light

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-INFO. | Information page is displayed. |
| 2 | Click the browser Back button. | URL is `/cart.html`. Both items are listed. Badge shows `2`. |
| 3 | Click **Checkout** again. | Information page is displayed with empty fields and no error. |

**Exploration result:** Steps 1 and 2 match. Step 3 was not exercised after a Back navigation during exploration.

### TC-39: Browser Back and Forward between overview and information pages
- **Covers:** AC3 (navigation)
- **Type:** Navigation
- **Test data:** Backpack + Bike Light; `John`, `Doe`, `12345`

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-OVERVIEW. | Overview page is displayed. |
| 2 | Click the browser Back button. | URL is `/checkout-step-one.html`. No error is displayed. |
| 3 | Check the field values. | The fields are empty (entered information is not retained). |
| 4 | Click the browser Forward button. | URL is `/checkout-step-two.html`. Both items and "Total: $43.18" are displayed. |
| 5 | Click Back twice. | URL is `/cart.html`. Both items are listed. |

**Exploration result:** Matches what the application does. CLARIFY: whether entered information should be retained on Back is not defined in the story.

### TC-40: Browser Back from the confirmation page cannot resubmit the order
- **Covers:** AC4, BR2 (navigation)
- **Type:** Navigation / edge case
- **Test data:** Backpack + Bike Light

| # | Step | Expected result |
|---|---|---|
| 1 | Perform SETUP-OVERVIEW and click **Finish**. | Confirmation page is displayed. No cart badge. |
| 2 | Click the browser Back button. | The completed order is not shown as pending, and a second order cannot be placed. |
| 3 | Check the cart badge. | No badge is displayed. The cart stays empty. |

**Exploration result:** DEVIATION. Back opens `/checkout-step-two.html` with no items, "Item total: $0", "Total: $0.00" and an active **Finish** button, so an empty order can be submitted. The cart itself stays empty, so step 3 matches.

---

## 11. Traceability

| Requirement | Test cases |
|---|---|
| AC1 Cart Review | TC-01, TC-02, TC-03, TC-04, TC-05, TC-06, TC-07, TC-08, TC-09, TC-30, TC-35, TC-36 |
| AC2 Checkout Information Entry | TC-04, TC-10, TC-11, TC-12, TC-13, TC-14, TC-15, TC-16, TC-17, TC-18, TC-21, TC-23, TC-24, TC-26, TC-30, TC-36, TC-38 |
| AC3 Order Overview | TC-26, TC-27, TC-28, TC-29, TC-30, TC-37, TC-39 |
| AC4 Order Completion | TC-30, TC-31, TC-32, TC-40 |
| AC5 Error Handling | TC-18, TC-19, TC-20, TC-21, TC-22, TC-23, TC-25 |
| BR1 Login required | TC-33, TC-34, TC-35 |
| BR2 Confirmation clears cart | TC-32, TC-40 |
| Navigation and back button | TC-03, TC-09, TC-17, TC-29, TC-31, TC-38, TC-39, TC-40 |

| Scenario type | Test cases |
|---|---|
| Happy path | TC-01, TC-02, TC-03, TC-04, TC-26, TC-30, TC-31, TC-32 |
| Negative | TC-11, TC-12, TC-13, TC-14, TC-15, TC-18, TC-19, TC-20, TC-25, TC-33, TC-34, TC-36, TC-37 |
| Edge and boundary | TC-06, TC-07, TC-08, TC-21, TC-22, TC-23, TC-24, TC-27, TC-35, TC-40 |
| Navigation | TC-09, TC-17, TC-29, TC-38, TC-39 |
| UI validation | TC-05, TC-10, TC-16, TC-28 |

## 12. Open questions for the product owner

1. **Cart total (AC1):** should the cart page show a total, or is the overview total sufficient?
2. **Field validation (AC5):** what are the rules for names and postal codes (allowed characters, minimum and maximum length, whitespace handling)?
3. **Empty cart:** should checkout be blocked when the cart is empty?
4. **Skipping the information step:** should the overview page require that information was entered in the current checkout?
5. **Back navigation:** should entered information be retained when going back from the overview, and what should Back from the confirmation page show?
6. **Cart after logout:** should the cart persist across sessions?
