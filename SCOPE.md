# Project Scope

SplitNest is a full-stack expense sharing application designed to help flatmates and friends manage shared costs, track balances, and settle up easily. It is an alternative to tools like Splitwise, built specifically to handle messy, real-world data like historical CSV exports with anomalies.

## Core Features
1. **Authentication**: Secure user registration and login using JWT.
2. **Groups**: Users can create and join groups to isolate expenses (e.g., "Apartment 101", "Goa Trip"). Members have join and leave dates to accurately track who was present when an expense occurred.
3. **Expenses & Splitting**: Users can add expenses and specify exact amounts owed by each member, or split equally.
4. **CSV Import with Anomaly Detection**: A robust importer that parses dirty CSV files, detects issues (duplicates, negative amounts, invalid dates, USD currency, missing users, etc.), and provides a preview interface where users can choose to accept, fix, or skip anomalous rows.
5. **Debt Simplification**: An algorithm that minimizes the number of transactions needed to settle all debts in a group.
6. **Settlements**: Users can record payments made to each other to clear outstanding debts.
7. **Dashboard & Analytics**: Real-time reporting on total group expenses, outstanding balances, and group member stats.

## Database Schema

We use PostgreSQL with the following core tables:

### `users`
- `id` (PK)
- `name`, `email`, `password_hash`
- `created_at`

### `groups`
- `id` (PK)
- `group_name`, `created_by` (FK -> users)
- `created_at`

### `group_members`
- `group_id` (FK -> groups), `user_id` (FK -> users)
- `joined_at`, `left_at`

### `expenses`
- `id` (PK)
- `group_id` (FK -> groups)
- `title`, `amount`, `currency`, `expense_date`
- `paid_by` (FK -> users)
- `is_settlement`
- `created_at`, `updated_at`

### `expense_splits`
- `id` (PK)
- `expense_id` (FK -> expenses)
- `user_id` (FK -> users)
- `split_amount`

### `settlements`
- `id` (PK)
- `group_id` (FK -> groups)
- `paid_by` (FK -> users), `paid_to` (FK -> users)
- `amount`, `settlement_date`
- `created_at`

### `import_logs`
- `id` (PK)
- `anomaly_type`, `description`, `action_taken`
- `created_at`

## Handled CSV Anomalies
The importer intelligently handles:
- **Case-sensitivity / Typos**: Normalizes names using string similarity.
- **Number Formats**: Removes commas and rounds to 2 decimal places.
- **Invalid Dates**: Attempts multiple formats, skips if completely unparsable.
- **Missing Currency**: Defaults to INR.
- **USD Conversion**: Converts USD to INR using a standard rate (e.g., 83 INR = 1 USD).
- **Negative Amounts**: Treated as refunds (lowers the expense).
- **Duplicates**: Uses similarity matching on date, amount, and title to flag duplicates.
- **Percentages**: Normalizes percentages that don't add up to 100%.
- **Missing Payer**: Flags row as an error.
- **Mislabeled Settlements**: Detects "paid back" and marks as a settlement.
- **Date Constraints**: Warns if a user is included in an expense before their `joined_at` or after their `left_at` date.
