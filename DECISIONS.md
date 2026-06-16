# Technical & Product Decisions

## 1. Debt Simplification vs. Raw Transactions
*   **Decision**: We implemented a Debt Simplification algorithm (Max-Flow/Min-Cash-Flow approach) in `getBalances` to minimize the number of transactions required to settle up.
*   **Rationale**: Flatmate Aisha specifically requested "One number per person. Who pays whom, how much, done." The simplification algorithm achieves exactly this.
*   **Trade-off**: Simplified debts obscure the original expenses (Aisha might owe Priya for an expense Rohan paid, due to debt chaining). To solve Rohan's request for "No magic numbers", we added a separate `/api/expenses/between/:user1/:user2` endpoint and a "View Details" modal to show the raw, unsimplified transactions between any two users.

## 2. Handling USD Expenses
*   **Decision**: When importing the CSV, any expense marked with `USD` in the currency column is automatically converted to `INR` using a hardcoded historical exchange rate of 83 INR = 1 USD.
*   **Rationale**: Priya noted that half the Goa trip was in dollars. By normalizing everything to INR during import, we avoid the immense complexity of maintaining multi-currency balances and daily exchange rate APIs. The conversion is logged as a `CURRENCY_CONVERSION` anomaly for transparency.

## 3. CSV Import Anomaly Workflow
*   **Decision**: Instead of failing the entire import on the first error, the backend analyzes the CSV and returns a `report` of all proposed rows, their statuses (`Valid`, `Warning`, `Error`), and a list of `issues`.
*   **Rationale**: Real-world spreadsheets are messy. Meera requested "Clean up duplicates — but I want to approve anything... deletes or changes." The preview step allows the user to review all normalizations (e.g., typos fixed, amounts rounded) and manually toggle the `Skip` status before confirming the final import.

## 4. Duplicate Expense Detection
*   **Decision**: Duplicates are detected during the CSV analyze phase by checking if two rows share the same date, have an amount within ₹50 of each other, and have a `description` string similarity > 70%.
*   **Rationale**: Strict equality checks fail on messy data (e.g., "Dinner at Marina Bites" vs "dinner - marina bites"). String similarity catches human data-entry errors effectively.

## 5. Group Membership Time Boundaries
*   **Decision**: Expenses validate against a user's `joined_at` and `left_at` dates. If an expense is dated outside their membership window, they are automatically removed from the split.
*   **Rationale**: Sam moved in mid-April and shouldn't pay for March electricity. The database enforces this at the application layer during import and expense creation.

## 6. Architecture & Tooling
*   **Backend**: Node.js + Express. Chosen for rapid API development and native JSON handling.
*   **Database**: PostgreSQL via `pg` pool. Chosen for ACID compliance, essential for financial transaction tracking.
*   **Frontend**: React (Vite). Chosen for a responsive, fast SPA experience.
*   **Documentation**: Swagger UI (`swagger-ui-express` + `swagger-jsdoc`). Allows instant testing of the API straight from `/api-docs`.
