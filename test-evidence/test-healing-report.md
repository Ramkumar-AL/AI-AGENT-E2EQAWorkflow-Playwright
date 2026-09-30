# Saucedemo Checkout: Test Execution and Healing Report

| | |
|---|---|
| **User story** | SCRUM-101, Saucedemo-ecommerce Checkout Process |
| **Suite** | `tests/saucedemo-checkout/` (7 spec files, 40 tests) |
| **Command** | `npx playwright test tests/saucedemo-checkout --project=chromium --reporter=line` |
| **Browser** | Chrome (`chromium` project), viewport 1280x720 |
| **Executed on** | 2026-09-30 |

## 1. Summary

| Run | Passed | Failed | Skipped (`fixme`) |
|---|---|---|---|
| Initial run | 32 | 8 | 0 |
| Final run | 32 | 8 | 0 |

- **All 8 failures are real application defects.** Each test fails at the assertion that checks the acceptance criterion, and the received value is the application's actual behaviour. The selectors, waits and setup steps in those tests all worked.
- **No test needed healing in this run**, so no script was changed and no test was marked `test.fixme()`.
- **The 32 passing tests are stable**: each was run 3 more times (96 executions) with 0 failures.

## 2. Failure analysis

For each failing test, the cause was checked against the three healing categories: selector issue, timing issue, or assertion failure.

| Test | Failing assertion | Expected | Received | Selector or timing issue? | Verdict |
|---|---|---|---|---|---|
| TC-02 | Cart container contains "total" | Text matching `/total/i` and `$39.98` | Cart text with item rows and buttons only, no total | No. The cart container was found and its full text was read. | Defect BUG-01 |
| TC-18 | Error shown and user stays on the information page (2 rows) | Error visible, URL `/checkout-step-one.html` | No error, URL `/checkout-step-two.html` | No. The test waited until the app settled on the overview page. | Defect BUG-02 |
| TC-19 | Same as TC-18 (2 rows) | Error visible, URL `/checkout-step-one.html` | No error, URL `/checkout-step-two.html` | No. | Defect BUG-02 |
| TC-20 | Same as TC-18 (2 rows) | Error visible, URL `/checkout-step-one.html` | No error, URL `/checkout-step-two.html` | No. | Defect BUG-02 |
| TC-24 | URL after pressing Enter | `/checkout-step-two.html` | `/cart.html` | No. The app navigated, but to the cart. | Defect BUG-03 |
| TC-36 | URL after clicking Checkout with an empty cart | `/cart.html` | `/checkout-step-one.html` | No. | Defect BUG-04 |
| TC-37 | URL after opening the overview directly | Not `/checkout-step-two.html` | `/checkout-step-two.html` | No. The page title was rendered before the URL was checked. | Defect BUG-05 |
| TC-40 | Enabled Finish buttons after browser Back | 0 | 1 | No. | Defect BUG-06 |

These match the 8 failures found during manual exploratory testing (`test-evidence/exploratory-testing-results.md`), which supports the verdict that they are application behaviour and not script problems.

## 3. Healing activities

### This run

None required. Assertions in the 8 defect tests were deliberately left unchanged, because changing them would make the tests pass against behaviour that does not meet the acceptance criteria.

### Earlier, during script generation (Step 4)

One script error was found and fixed on the first execution of the generated suite:

| Test | Problem | Category | Fix | Attempts | Result |
|---|---|---|---|---|---|
| TC-28 | `cartItems.getByRole('button')` expected 0 but matched 2 elements on the overview page. The item title links expose a button role, so the locator matched them as well as any Remove button. | Selector | Locator narrowed to `getByRole('button', { name: 'Remove' })`, plus a check for no `<button>` elements in the rows. | 1 | Passes |

## 4. Tests failing because of real defects

These tests stay in the suite, unchanged, and fail until the application is fixed. Each is tagged `@known-bug` and carries an `issue` annotation with the bug ID, which appears in the HTML report.

| Bug | Tests | AC | Defect |
|---|---|---|---|
| BUG-01 | TC-02 | AC1 | The cart page does not show a total price. |
| BUG-02 | TC-18, TC-19, TC-20 | AC5 | Checkout information fields validate only for empty values. Whitespace, special characters, digits in names and nonsense postal codes are accepted. |
| BUG-03 | TC-24 | AC2 | Pressing Enter in the information form cancels checkout and returns to the cart. |
| BUG-04 | TC-36 | AC1, AC2 | An order can be placed with an empty cart. |
| BUG-05 | TC-37 | AC3 | The overview page opens by direct URL without checkout information being entered. |
| BUG-06 | TC-40 | AC4 | Browser Back after confirmation shows an overview with an active Finish button, allowing a second, empty order. |

Full reproduction steps and screenshots are in `test-evidence/exploratory-testing-results.md`, section 3.

## 5. Tests that could not be auto-healed

None. No test was marked `test.fixme()`.

## 6. Final results by suite

| Suite file | Tests | Passed | Failed (defect) |
|---|---|---|---|
| `cart-review.spec.js` | 9 | 8 | 1 (TC-02) |
| `checkout-information.spec.js` | 8 | 8 | 0 |
| `checkout-error-handling.spec.js` | 8 | 4 | 4 (TC-18, TC-19, TC-20, TC-24) |
| `order-overview.spec.js` | 4 | 4 | 0 |
| `order-completion.spec.js` | 3 | 3 | 0 |
| `access-control.spec.js` | 5 | 3 | 2 (TC-36, TC-37) |
| `navigation.spec.js` | 3 | 2 | 1 (TC-40) |
| **Total** | **40** | **32** | **8** |

## 7. Useful commands

| Purpose | Command |
|---|---|
| Full suite | `npx playwright test tests/saucedemo-checkout --project=chromium --reporter=line` |
| Passing set only (regression gate) | `npx playwright test tests/saucedemo-checkout --project=chromium --grep-invert "@known-bug"` |
| Defect tests only (re-check after a fix) | `npx playwright test tests/saucedemo-checkout --project=chromium --grep "@known-bug"` |
| Open the HTML report | `npx playwright show-report` |
