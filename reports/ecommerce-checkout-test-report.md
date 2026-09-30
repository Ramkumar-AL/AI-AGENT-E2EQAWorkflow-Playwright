# Test Execution Report: Saucedemo E-commerce Checkout

| | |
|---|---|
| **User story** | SCRUM-101, Saucedemo-ecommerce Checkout Process |
| **Application** | https://www.saucedemo.com |
| **Test account** | `standard_user` |
| **Report date** | 2026-09-30 |
| **Test plan** | [specs/saucedemo-checkout-test-plan.md](../specs/saucedemo-checkout-test-plan.md) |
| **Manual results** | [test-evidence/exploratory-testing-results.md](../test-evidence/exploratory-testing-results.md) |
| **Healing report** | [test-evidence/test-healing-report.md](../test-evidence/test-healing-report.md) |
| **Automation suite** | [tests/saucedemo-checkout/](../tests/saucedemo-checkout/) |

---

## 1. Executive Summary

The checkout flow works for a normal purchase, but it does not meet the user story: 8 of 40 test cases fail because of 6 application defects, 3 of them high severity. **The story is not ready for sign-off.**

| Measure | Result |
|---|---|
| Test cases planned | 40 |
| Executed manually (exploratory) | 40 of 40 |
| Executed by automation | 40 of 40 |
| **Passed** | **32 (80%)** |
| **Failed** | **8 (20%)** |
| Blocked | 0 |
| Skipped / `fixme` | 0 |
| Defects logged | 6 (3 High, 3 Medium) |

Manual and automated execution gave the same result for every test case.

**What works:** cart review, required-field errors, overview contents and totals, order confirmation, cart clearing after an order, login protection on every checkout page, and back-button navigation between the cart, information and overview pages.

**What does not:**

- **Input validation (AC5) is limited to empty-field checks.** Whitespace, special characters and nonsense postal codes are accepted.
- **Checkout steps are not guarded.** An order can be completed with an empty cart, without customer information, or a second time after browser Back.
- **The cart page shows no total (AC1)**, and pressing Enter in the information form cancels checkout (AC2).

### Status by acceptance criterion

| Criterion | Status | Test cases | Failing | Defects |
|---|---|---|---|---|
| AC1 Cart Review | **FAIL** | 9 | TC-02 | BUG-01 |
| AC2 Checkout Information Entry | **FAIL** | 9 | TC-24 | BUG-03 |
| AC3 Order Overview | **FAIL** | 5 | TC-37 | BUG-05 |
| AC4 Order Completion | **FAIL** | 4 | TC-40 | BUG-06 |
| AC5 Error Handling | **FAIL** | 7 | TC-18, TC-19, TC-20 | BUG-02 |
| BR1 Login required for checkout | PASS | 3 | | |
| BR2 Confirmation clears the cart | PASS | (TC-32, counted under AC4) | | |
| Story precondition: cart has items | **FAIL** | 1 | TC-36 | BUG-04 |
| Navigation and back button | PASS | 2 | | |

Each test case is counted once, under its primary criterion, so the counts add up to 40. TC-24 is listed under AC2 because it tests form submission.

---

## 2. Environment

| Item | Value |
|---|---|
| Operating system | Windows 11 Home Single Language 10.0.26200 |
| Browser | Google Chrome 154.0.8037.58 |
| Viewport | 1280x720, not resized |
| Automation framework | Playwright (`@playwright/test` 1.63.0) |
| Node.js | v26.9.0 |
| Playwright project | `chromium`, using the installed Chrome |
| Test data | Saucedemo demo catalogue (6 products), account `standard_user` / `secret_sauce` |

---

## 3. Manual Test Results

All 40 test cases in the plan were executed on 2026-09-30, each in a fresh browser session.

**Method:** the Playwright MCP browser tools were not available, so the steps were executed by driving Chrome with a Playwright script that followed each test case, compared actual with expected results and captured screenshots. No screenshots or steps were produced by hand.

**Result:** 32 PASS, 8 FAIL, 0 BLOCKED. 48 screenshots were captured in [test-evidence/screenshots/](../test-evidence/screenshots/).

### 3.1 Results by test case

| ID | Title | AC | Manual | Evidence |
|---|---|---|---|---|
| TC-01 | Cart displays all added items with their details | AC1 | PASS | [cart](../test-evidence/screenshots/TC-01-cart-two-items.png) |
| TC-02 | Cart shows the total price calculation | AC1 | **FAIL** | [cart without total](../test-evidence/screenshots/TC-02-cart-no-total.png) |
| TC-03 | Continue Shopping returns to the products page and keeps the cart | AC1 | PASS | [products](../test-evidence/screenshots/TC-03-inventory-after-continue-shopping.png) |
| TC-04 | Checkout button opens the checkout information page | AC1, AC2 | PASS | [information page](../test-evidence/screenshots/TC-04-info-page.png) |
| TC-05 | Cart page UI elements | AC1 | PASS | |
| TC-06 | Removing an item updates the cart and badge | AC1 | PASS | [one removed](../test-evidence/screenshots/TC-06-after-remove-one.png), [empty](../test-evidence/screenshots/TC-06-empty-cart.png) |
| TC-07 | Cart contents persist after a page reload | AC1 | PASS | |
| TC-08 | Cart with all six products | AC1 | PASS | [six items](../test-evidence/screenshots/TC-08-cart-six-items.png) |
| TC-09 | Item name link opens product details and Back returns to the cart | AC1 | PASS | [detail page](../test-evidence/screenshots/TC-09-item-detail.png) |
| TC-10 | Information page form elements | AC2 | PASS | [empty form](../test-evidence/screenshots/TC-10-info-form-empty.png) |
| TC-11 | All fields empty shows a required-field error | AC2 | PASS | [error](../test-evidence/screenshots/TC-11-error-all-empty.png) |
| TC-12 | First Name empty | AC2 | PASS | [error](../test-evidence/screenshots/TC-12-error-first-name.png) |
| TC-13 | Last Name empty | AC2 | PASS | [error](../test-evidence/screenshots/TC-13-error-last-name.png) |
| TC-14 | Zip/Postal Code empty | AC2 | PASS | [error](../test-evidence/screenshots/TC-14-error-postal-code.png) |
| TC-15 | Error reports the first missing field when several are empty | AC2 | PASS | |
| TC-16 | Error presentation, retained values and dismissal | AC2 | PASS | [highlight](../test-evidence/screenshots/TC-16-error-highlight.png), [dismissed](../test-evidence/screenshots/TC-16-error-dismissed.png) |
| TC-17 | Cancel on the information page returns to the cart | AC2 | PASS | |
| TC-18 | Whitespace-only values are rejected | AC5 | **FAIL** | [input](../test-evidence/screenshots/TC-18-whitespace-row1-input.png), [result](../test-evidence/screenshots/TC-18-whitespace-row1-result.png) |
| TC-19 | Special characters and digits in name fields are rejected | AC5 | **FAIL** | [input](../test-evidence/screenshots/TC-19-special-chars-row1-input.png), [result](../test-evidence/screenshots/TC-19-special-chars-row1-result.png) |
| TC-20 | Invalid Zip/Postal Code values are rejected | AC5 | **FAIL** | [input](../test-evidence/screenshots/TC-20-invalid-zip-row1-input.png), [result](../test-evidence/screenshots/TC-20-invalid-zip-row1-result.png) |
| TC-21 | Minimum-length values are accepted | AC5 | PASS | |
| TC-22 | Very long values | AC5 | PASS | [input](../test-evidence/screenshots/TC-22-long-input.png), [result](../test-evidence/screenshots/TC-22-long-result.png) |
| TC-23 | Legitimate international names and postal codes are accepted | AC5 | PASS | |
| TC-24 | Enter key submits the information form | AC2 | **FAIL** | [before](../test-evidence/screenshots/TC-24-before-enter.png), [after](../test-evidence/screenshots/TC-24-after-enter.png) |
| TC-25 | Script input is not executed | AC5 | PASS | [result](../test-evidence/screenshots/TC-25-script-input-result.png) |
| TC-26 | Valid information opens the overview with order summary | AC3 | PASS | [overview](../test-evidence/screenshots/TC-26-overview.png) |
| TC-27 | Overview totals are calculated correctly for all six products | AC3 | PASS | [overview](../test-evidence/screenshots/TC-27-overview-six-items.png) |
| TC-28 | Overview items are read-only | AC3 | PASS | |
| TC-29 | Cancel on the overview page abandons checkout and keeps the cart | AC3 | PASS | |
| TC-30 | End-to-end purchase completes with a confirmation | AC1 to AC4 | PASS | [cart](../test-evidence/screenshots/TC-30-step1-cart.png), [information](../test-evidence/screenshots/TC-30-step2-info-filled.png), [overview](../test-evidence/screenshots/TC-30-step3-overview.png), [confirmation](../test-evidence/screenshots/TC-30-step4-complete.png) |
| TC-31 | Back Home returns to the products page | AC4 | PASS | |
| TC-32 | Order confirmation clears the cart | AC4, BR2 | PASS | [empty cart](../test-evidence/screenshots/TC-32-cart-empty-after-order.png) |
| TC-33 | Logged-out users cannot open cart or checkout pages | BR1 | PASS | [redirect](../test-evidence/screenshots/TC-33-logged-out-redirect.png) |
| TC-34 | Checkout is inaccessible after logout | BR1 | PASS | |
| TC-35 | Cart is retained across logout and login | BR1 | PASS | [cart](../test-evidence/screenshots/TC-35-cart-after-relogin.png) |
| TC-36 | Checkout with an empty cart is prevented | AC1, AC2 | **FAIL** | [empty cart](../test-evidence/screenshots/TC-36-empty-cart.png), [overview](../test-evidence/screenshots/TC-36-empty-overview.png), [confirmation](../test-evidence/screenshots/TC-36-empty-order-complete.png) |
| TC-37 | Overview cannot be reached without entering checkout information | AC3 | **FAIL** | [overview](../test-evidence/screenshots/TC-37-overview-direct-access.png) |
| TC-38 | Browser Back from the information page returns to the cart | Navigation | PASS | |
| TC-39 | Browser Back and Forward between overview and information pages | Navigation | PASS | [empty fields](../test-evidence/screenshots/TC-39-back-to-info-fields-empty.png) |
| TC-40 | Browser Back from the confirmation page cannot resubmit the order | AC4 | **FAIL** | [overview after Back](../test-evidence/screenshots/TC-40-back-from-complete.png), [second confirmation](../test-evidence/screenshots/TC-40-second-empty-order.png) |

TC-04 was reported as failed on the first manual pass because the script read the cart before the page had rendered. It passed on three re-runs and is recorded as PASS.

### 3.2 Issues found during manual testing

Six defects were found. They are described in full in section 5.

### 3.3 Observations

These are not failures against the story but need a product decision.

| ID | Observation |
|---|---|
| O-1 | When one field is missing, all three fields are highlighted in red, including the correctly filled ones ([screenshot](../test-evidence/screenshots/TC-16-error-highlight.png)). |
| O-2 | The input fields have no length limit. 256-character values are accepted. |
| O-3 | The cart survives logout and login. The story does not say whether it should. |
| O-4 | Browser Back from the overview shows the information form with empty fields, so the user must retype everything. |
| O-5 | The two Cancel buttons differ: on the information page Cancel returns to the cart, on the overview page it returns to the products page. |
| O-6 | For an empty order the amounts are formatted inconsistently: "Item total: $0" next to "Tax: $0.00" and "Total: $0.00". |
| O-7 | Quantity in the cart is read-only. A user cannot order more than one of a product. |
| O-8 | The confirmation page shows no order number or order summary. It has a "Generate PDF order" button that the story does not mention; it was not tested. |
| O-9 | The field is labelled "Zip/Postal Code" but its error message says "Postal Code is required". |
| O-10 | Reloading `/cart.html` returns HTTP 404 from the server, although the page then renders correctly. |
| O-11 | The browser console logged "401 (Unauthorized)" resource errors during many test cases. The request was not identified and it had no visible effect. |

---

## 4. Automated Test Results

### 4.1 Suite

Step 4 produced 40 Playwright JavaScript tests, one per test case in the plan, in 10 suite files plus a shared helper file and a Playwright configuration.

- **Selectors:** the `data-test` attributes confirmed during manual testing, through `getByTestId()`.
- **Waits:** web-first assertions only; no fixed timeouts.
- **Hooks:** `beforeEach` performs the setup block for the suite; `afterEach` attaches the final URL when a test fails. Screenshots and traces are kept on failure.
- **Defect tests:** tagged `@known-bug` with the bug ID as an annotation.

Command: `npx playwright test tests/saucedemo-checkout --project=chromium --reporter=line`

### 4.2 Results

| Run | Passed | Failed | Skipped / `fixme` |
|---|---|---|---|
| First execution after generation (Step 4) | 31 | 9 | 0 |
| Initial run for healing (Step 5) | 32 | 8 | 0 |
| **Final run** | **32** | **8** | **0** |

The 32 passing tests were each run 3 more times (96 executions) with no failures.

### 4.3 Healing activities

| Test | Problem | Category | Fix | Attempts | Outcome |
|---|---|---|---|---|---|
| TC-28 | The locator for "no buttons in the item rows" matched 2 elements on the overview page, because the item title links expose a button role. | Selector | Narrowed to the Remove button by name, plus a check for no `<button>` elements in the rows. | 1 | Passes |

This was found and fixed on the first execution in Step 4. In Step 5 no test needed healing:

- All 8 remaining failures stop at the assertion that checks the acceptance criterion, and the received value is the application's real behaviour.
- The same 8 test cases failed in manual testing.
- Their assertions were left unchanged so that they keep reporting the defects.
- No test was marked `test.fixme()`.

### 4.4 Results by test suite

| Suite file | Scope | Tests | Passed | Failed | Failing tests |
|---|---|---|---|---|---|
| [tc-01-cart-review.spec.js](../tests/saucedemo-checkout/tc-01-cart-review.spec.js) | Cart review | 6 | 5 | 1 | TC-02 |
| [tc-02-valid-checkout.spec.js](../tests/saucedemo-checkout/tc-02-valid-checkout.spec.js) | Valid checkout | 3 | 3 | 0 | |
| [tc-03-empty-validation.spec.js](../tests/saucedemo-checkout/tc-03-empty-validation.spec.js) | Required-field errors | 6 | 6 | 0 | |
| [tc-04-invalid-checkout-data.spec.js](../tests/saucedemo-checkout/tc-04-invalid-checkout-data.spec.js) | Invalid data | 5 | 1 | 4 | TC-18, TC-19, TC-20, TC-24 |
| [tc-05-order-overview.spec.js](../tests/saucedemo-checkout/tc-05-order-overview.spec.js) | Order overview | 2 | 2 | 0 | |
| [tc-06-cancel-controls.spec.js](../tests/saucedemo-checkout/tc-06-cancel-controls.spec.js) | Cancel and Continue Shopping | 3 | 3 | 0 | |
| [tc-07-browser-back.spec.js](../tests/saucedemo-checkout/tc-07-browser-back.spec.js) | Back button | 4 | 3 | 1 | TC-40 |
| [tc-08-order-completion.spec.js](../tests/saucedemo-checkout/tc-08-order-completion.spec.js) | Order completion | 2 | 2 | 0 | |
| [tc-09-authentication-context.spec.js](../tests/saucedemo-checkout/tc-09-authentication-context.spec.js) | Login rule, step guards | 5 | 3 | 2 | TC-36, TC-37 |
| [tc-10-boundary-multi-item.spec.js](../tests/saucedemo-checkout/tc-10-boundary-multi-item.spec.js) | Boundaries, six products | 4 | 4 | 0 | |
| **Total** | | **40** | **32** | **8** | |

The suite was reorganised from 7 files into these 10 after Step 5. The 40 tests and their assertions are unchanged, and a re-run gave the same 32 passed and 8 failed. The `tc-NN` file prefix is the suite number, not a test case ID.

### 4.5 Automated failure details

| Test | Expected | Received | Defect |
|---|---|---|---|
| TC-02 | Cart text contains a total and `$39.98` | Item rows and buttons only | BUG-01 |
| TC-18 | Validation error, URL `/checkout-step-one.html` (2 data rows) | No error, URL `/checkout-step-two.html` | BUG-02 |
| TC-19 | Validation error, URL `/checkout-step-one.html` (2 data rows) | No error, URL `/checkout-step-two.html` | BUG-02 |
| TC-20 | Validation error, URL `/checkout-step-one.html` (2 data rows) | No error, URL `/checkout-step-two.html` | BUG-02 |
| TC-24 | URL `/checkout-step-two.html` after Enter | URL `/cart.html` | BUG-03 |
| TC-36 | URL stays `/cart.html` | URL `/checkout-step-one.html` | BUG-04 |
| TC-37 | URL is not `/checkout-step-two.html` | URL `/checkout-step-two.html` | BUG-05 |
| TC-40 | 0 enabled Finish buttons after Back | 1 enabled Finish button | BUG-06 |

---

## 5. Defects Log

All defects were reproduced both manually and by automation in the environment described in section 2.

| Bug ID | Severity | Title | AC | Test cases |
|---|---|---|---|---|
| BUG-01 | Medium | Cart page does not show a total price | AC1 | TC-02 |
| BUG-02 | High | Checkout information fields validate only for empty values | AC5 | TC-18, TC-19, TC-20 |
| BUG-03 | Medium | Pressing Enter in the information form cancels checkout | AC2 | TC-24 |
| BUG-04 | High | An order can be placed with an empty cart | AC1, AC2 | TC-36 |
| BUG-05 | High | Overview page can be opened without entering checkout information | AC2, AC3 | TC-37 |
| BUG-06 | Medium | Browser Back after confirmation allows a second, empty order | AC4 | TC-40 |

No defect is rated Critical: the normal purchase path works and none of the defects causes data loss or blocks a valid order.

### BUG-01: Cart page does not show a total price

| | |
|---|---|
| **Severity** | Medium |
| **Acceptance criterion** | AC1: "I should see the total price calculation" |
| **Test cases** | TC-02 (manual and automated) |
| **Environment** | Chrome 154.0.8037.58, Windows 11, 1280x720, `standard_user` |

**Description:** the cart page lists items with individual prices but no total. A total first appears two steps later, on the overview page.

**Steps to reproduce**
1. Open https://www.saucedemo.com and log in as `standard_user` / `secret_sauce`.
2. Click **Add to cart** for Sauce Labs Backpack and Sauce Labs Bike Light.
3. Click the cart icon.

**Expected:** the cart page shows a total of $39.98.

**Actual:** the cart page shows $29.99 and $9.99 against the items and no total or subtotal.

**Evidence:** [TC-02-cart-no-total.png](../test-evidence/screenshots/TC-02-cart-no-total.png)

### BUG-02: Checkout information fields validate only for empty values

| | |
|---|---|
| **Severity** | High |
| **Acceptance criterion** | AC5: invalid data shows validation errors and the user cannot proceed |
| **Test cases** | TC-18, TC-19, TC-20 (manual and automated) |
| **Environment** | Chrome 154.0.8037.58, Windows 11, 1280x720, `standard_user` |

**Description:** the only validation on First Name, Last Name and Zip/Postal Code is that the field is not empty. Whitespace, special characters, digits in names and nonsense postal codes are all accepted.

**Steps to reproduce**
1. Log in, add two items to the cart, open the cart and click **Checkout**.
2. Enter one of the rows below.
3. Click **Continue**.

| First Name | Last Name | Zip/Postal Code |
|---|---|---|
| one space | one space | one space |
| three spaces | `Doe` | `12345` |
| `@#$%^&*` | `!<>?/\|` | `12345` |
| `12345` | `67890` | `12345` |
| `John` | `Doe` | `~`+=` |
| `John` | `Doe` | `-1` |

**Expected:** a validation error is shown and the user stays on the information page.

**Actual:** every row is accepted. The overview page opens with no error.

**Evidence:** whitespace [input](../test-evidence/screenshots/TC-18-whitespace-row1-input.png) and [result](../test-evidence/screenshots/TC-18-whitespace-row1-result.png); special characters [input](../test-evidence/screenshots/TC-19-special-chars-row1-input.png) and [result](../test-evidence/screenshots/TC-19-special-chars-row1-result.png); postal code [input](../test-evidence/screenshots/TC-20-invalid-zip-row1-input.png) and [result](../test-evidence/screenshots/TC-20-invalid-zip-row1-result.png)

**Note:** the story does not define the validation rules. They must be agreed before a fix (see section 7).

### BUG-03: Pressing Enter in the information form cancels checkout

| | |
|---|---|
| **Severity** | Medium |
| **Acceptance criterion** | AC2: entering information and continuing |
| **Test cases** | TC-24 (manual and automated) |
| **Environment** | Chrome 154.0.8037.58, Windows 11, 1280x720, `standard_user` |

**Description:** pressing Enter in any field of the information form behaves as if Cancel was clicked. Keyboard users lose their entered data and are sent back to the cart.

**Steps to reproduce**
1. Log in, add two items to the cart, open the cart and click **Checkout**.
2. Enter First Name `John`, Last Name `Doe`, Zip `12345`.
3. With the cursor in the Zip field, press **Enter**.

**Expected:** the form is submitted and the overview page opens.

**Actual:** the cart page (`/cart.html`) opens. With all fields empty, Enter also returns to the cart and shows no required-field error.

**Likely cause:** the Cancel button has no `type` attribute, so it acts as a submit button, and it comes before Continue in the form.

**Evidence:** [before](../test-evidence/screenshots/TC-24-before-enter.png), [after](../test-evidence/screenshots/TC-24-after-enter.png)

### BUG-04: An order can be placed with an empty cart

| | |
|---|---|
| **Severity** | High |
| **Acceptance criterion** | AC1 and AC2 preconditions ("with items in my cart") |
| **Test cases** | TC-36 (manual and automated) |
| **Environment** | Chrome 154.0.8037.58, Windows 11, 1280x720, `standard_user` |

**Description:** the Checkout button is active when the cart is empty, and the whole flow completes with a $0.00 order.

**Steps to reproduce**
1. Log in. Do not add any product.
2. Click the cart icon.
3. Click **Checkout**.
4. Enter `A`, `B`, `1` and click **Continue**.
5. Click **Finish**.

**Expected:** checkout cannot start with an empty cart.

**Actual:** the information page opens. The overview shows "Item total: $0", "Tax: $0.00", "Total: $0.00", and Finish shows "Thank you for your order!".

**Evidence:** [empty cart](../test-evidence/screenshots/TC-36-empty-cart.png), [overview](../test-evidence/screenshots/TC-36-empty-overview.png), [confirmation](../test-evidence/screenshots/TC-36-empty-order-complete.png)

### BUG-05: Overview page can be opened without entering checkout information

| | |
|---|---|
| **Severity** | High |
| **Acceptance criterion** | AC2 (all fields mandatory), AC3 ("GIVEN I have entered valid checkout information") |
| **Test cases** | TC-37 (manual and automated) |
| **Environment** | Chrome 154.0.8037.58, Windows 11, 1280x720, `standard_user` |

**Description:** a logged-in user can open the overview page by URL and finish the order, which bypasses the mandatory information fields.

**Steps to reproduce**
1. Log in and add two items to the cart.
2. Open `https://www.saucedemo.com/checkout-step-two.html` directly.
3. Click **Finish**.

**Expected:** the user is sent to the information page or the cart.

**Actual:** the overview opens with both items, and Finish completes the order with no customer information entered.

**Evidence:** [TC-37-overview-direct-access.png](../test-evidence/screenshots/TC-37-overview-direct-access.png)

### BUG-06: Browser Back after confirmation allows a second, empty order

| | |
|---|---|
| **Severity** | Medium |
| **Acceptance criterion** | AC4 |
| **Test cases** | TC-40 (manual and automated) |
| **Environment** | Chrome 154.0.8037.58, Windows 11, 1280x720, `standard_user` |

**Description:** after an order is confirmed, browser Back returns to an overview page that still offers Finish.

**Steps to reproduce**
1. Log in, add two items and complete an order through to the confirmation page.
2. Click the browser **Back** button.
3. Click **Finish**.

**Expected:** the completed order cannot be resubmitted.

**Actual:** the overview opens with no items, "Total: $0.00" and an active Finish button. Clicking it shows the confirmation page again. The cart stays empty, so business rule 2 holds.

**Evidence:** [overview after Back](../test-evidence/screenshots/TC-40-back-from-complete.png), [second confirmation](../test-evidence/screenshots/TC-40-second-empty-order.png)

**Related defects:** BUG-04, BUG-05 and BUG-06 probably share one cause. The overview and confirmation pages do not check that the cart has items and that information was entered in the current checkout.

---

## 6. Test Coverage Analysis

### 6.1 Coverage of acceptance criteria

Every acceptance criterion and business rule has test cases, and every test case was executed both manually and by automation.

| Requirement | Test cases | Manual | Automated | Result |
|---|---|---|---|---|
| AC1 Cart Review | TC-01 to TC-09, TC-30 | 10 of 10 | 10 of 10 | 9 pass, 1 fail |
| AC2 Checkout Information Entry | TC-04, TC-10 to TC-17, TC-24, TC-30 | 11 of 11 | 11 of 11 | 10 pass, 1 fail |
| AC3 Order Overview | TC-26 to TC-30, TC-37 | 6 of 6 | 6 of 6 | 5 pass, 1 fail |
| AC4 Order Completion | TC-30, TC-31, TC-32, TC-40 | 4 of 4 | 4 of 4 | 3 pass, 1 fail |
| AC5 Error Handling | TC-18 to TC-23, TC-25 | 7 of 7 | 7 of 7 | 4 pass, 3 fail |
| BR1 Login required | TC-33, TC-34, TC-35 | 3 of 3 | 3 of 3 | 3 pass |
| BR2 Confirmation clears the cart | TC-32, TC-40 | 2 of 2 | 2 of 2 | 1 pass, 1 fail |
| Navigation and back button | TC-03, TC-09, TC-17, TC-29, TC-31, TC-38, TC-39, TC-40 | 8 of 8 | 8 of 8 | 7 pass, 1 fail |
| Empty cart precondition | TC-36 | 1 of 1 | 1 of 1 | 1 fail |

Some test cases cover more than one requirement, so the rows add up to more than 40. TC-40 fails on resubmission; its cart-clearing check for BR2 passes.

### 6.2 Coverage by scenario type

| Scenario type | Test cases | Passed | Failed |
|---|---|---|---|
| Happy path | 8 | 7 | 1 |
| Negative | 13 | 8 | 5 |
| Edge and boundary | 10 | 8 | 2 |
| Navigation | 5 | 5 | 0 |
| UI validation | 4 | 4 | 0 |

### 6.3 Manual versus automated

- **Same scope:** both covered all 40 test cases and agreed on every result.
- **Manual testing added** the 48 screenshots, the 11 observations in section 3.3, and follow-up checks beyond the plan, such as completing the order after each defect to confirm its impact.
- **Automation adds** repeatability: the 32 passing tests form a stable regression set, and the 8 defect tests will pass without changes once the defects are fixed.

### 6.4 Gaps

| Gap | Reason |
|---|---|
| Other browsers and viewport sizes | The story limits testing to Chrome; all runs used 1280x720. |
| Other accounts (`locked_out_user`, `problem_user`, `performance_glitch_user`, and so on) | Only `standard_user` credentials are in the story. |
| "Generate PDF order" button | Not in the story. |
| Menu items "Reset App State", "Dynamic Catalog", "About" | Not in the story. |
| Validation rules for AC5 | The story gives no rules, so tests use clearly invalid values only. Borderline values are untested. |
| Accessibility beyond the Enter key | Not in the story. |
| Performance and behaviour on slow networks | Not in the story. |
| Concurrent sessions (same account in two tabs) | Not in the plan. |
| Source of the "401 (Unauthorized)" console errors | Not identified (observation O-11). |

### 6.5 Recommendations for additional testing

1. **Validation rules:** once the product owner defines them, add boundary tests for each field (allowed characters, minimum and maximum length, leading and trailing spaces).
2. **Other accounts:** run the suite with `problem_user` and `error_user`, which exist to expose UI and error-handling faults, and test that `locked_out_user` cannot reach checkout.
3. **Keyboard and accessibility:** test tab order, focus visibility and screen-reader labels through the whole flow, given BUG-03.
4. **Reset App State:** test that it clears the cart mid-checkout without leaving stale pages.
5. **Generate PDF order:** decide whether it is in scope, and test the generated content if so.
6. **Cross-browser:** run on Firefox and WebKit if the scope is widened. The suite needs only extra Playwright projects.

---

## 7. Summary and Recommendations

### 7.1 Overall quality assessment

The checkout flow is functionally complete for a user who behaves as expected: all steps work and the amounts are correct. Its quality is weak wherever the user deviates from that path. The application relies on the user following the steps in order and entering sensible data, and it enforces neither.

Against the Definition of Done:

| Item | Status |
|---|---|
| All acceptance criteria have test cases | Done |
| Manual exploratory testing completed | Done |
| Automated test scripts created and passing | Created. 32 of 40 pass; 8 fail on application defects. |
| Test results documented | Done (this report) |
| Bugs logged for any failures | Documented here as BUG-01 to BUG-06. Not yet entered in a bug tracker. |
| Code committed to repository | Not done. The project folder is not a git repository. |

### 7.2 Risk areas

| Risk | Defects | Impact |
|---|---|---|
| Orders with no items or no customer information | BUG-04, BUG-05, BUG-06 | Invalid orders reach fulfilment. Highest risk. |
| Unusable delivery data | BUG-02 | Orders are accepted with blank or meaningless names and postal codes. |
| Keyboard users cannot complete checkout normally | BUG-03 | Entered data is lost and the user is sent back to the cart. |
| Price is not visible early | BUG-01 | The user sees the total only at the last step before paying. |

### 7.3 Next steps

1. **Fix the step guards first** (BUG-04, BUG-05, BUG-06). One check on the overview and confirmation pages, for cart contents and entered information, is likely to resolve all three.
2. **Agree the validation rules for AC5** with the product owner, then fix BUG-02.
3. **Fix BUG-03** by giving the Cancel button `type="button"`.
4. **Decide on BUG-01:** add a total to the cart page, or change AC1 if the overview total is enough.
5. **Get decisions on the open questions** in the test plan (section 12) and observations O-1 to O-9.
6. **Enter BUG-01 to BUG-06 in the bug tracker** and link them to SCRUM-101.
7. **Re-run the suite after each fix.** The defect tests are tagged, so `--grep "@known-bug"` re-checks them and `--grep-invert "@known-bug"` runs the regression set.
8. **Put the project under version control** and commit the plan, tests, evidence and this report.
