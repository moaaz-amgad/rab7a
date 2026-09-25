# Module: Expenses (المصروفات)

> Expense recording, categorization, approval workflows, and recurring expenses.

---

## 1. Module Overview

| Property         | Value                                         |
| ---------------- | --------------------------------------------- |
| **Module Code**  | `exp`                                         |
| **API Prefix**   | `/api/v1/expenses`                            |
| **Branch Scoped**| Yes                                           |
| **Depends On**   | Settings (branches), Accounting (accounts)    |
| **Depended By**  | Accounting (journal entries), Reports         |

---

## 2. Entities

### 2.1 Expense Categories (فئات المصروفات)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `name_ar`          | VARCHAR(255)    | Yes      | Category name in Arabic            |
| `name_en`          | VARCHAR(255)    | Yes      | Category name in English           |
| `code`             | VARCHAR(20)     | Yes      | Category code (unique per branch)  |
| `parent_id`        | FK → self       | No       | Parent category (hierarchy)        |
| `account_id`       | FK → accounts   | No       | Linked GL account                  |
| `budget_amount`    | BIGINT          | No       | Monthly budget (piasters)          |
| `requires_approval`| BOOLEAN         | Yes      | Requires manager approval          |
| `approval_threshold`| BIGINT         | No       | Auto-approve below this amount     |
| `is_active`        | BOOLEAN         | Yes      | Active/inactive                    |
| `sort_order`       | INT             | Yes      | Display order                      |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`       | TIMESTAMP       | No       | Soft delete                        |

**Default Expense Categories (Restaurant):**

| Code   | Name (AR)            | Name (EN)            | Typical Account         |
| ------ | -------------------- | -------------------- | ----------------------- |
| `RENT` | إيجار                | Rent                 | Rent Expense            |
| `UTIL` | مرافق (كهرباء/مياه/غاز) | Utilities          | Utilities Expense       |
| `MAINT`| صيانة وإصلاحات       | Maintenance          | Maintenance Expense     |
| `CLEAN`| مواد تنظيف           | Cleaning Supplies    | Cleaning Expense        |
| `TRANS`| نقل ومواصلات         | Transportation       | Transport Expense       |
| `TEL`  | اتصالات وإنترنت      | Telecom & Internet   | Telecom Expense         |
| `PRINT`| مطبوعات وقرطاسية     | Printing & Stationery| Office Supplies Expense |
| `MKT`  | تسويق وإعلان         | Marketing            | Marketing Expense       |
| `LIC`  | تراخيص ورسوم         | Licenses & Fees      | Licenses Expense        |
| `MISC` | مصروفات متنوعة       | Miscellaneous        | Misc. Expense           |

### 2.2 Expenses (المصروفات)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `reference`        | VARCHAR(30)     | Yes      | Auto-generated (EXP-2026-07-001)   |
| `category_id`      | FK → expense_categories | Yes | Expense category              |
| `expense_date`     | DATE            | Yes      | Date of expense                    |
| `description`      | VARCHAR(500)    | Yes      | Expense description                |
| `amount`           | BIGINT          | Yes      | Total amount (piasters)            |
| `tax_amount`       | BIGINT          | Yes      | Tax amount (piasters), default 0   |
| `net_amount`       | BIGINT          | Yes      | Net amount after tax (piasters)    |
| `payment_method`   | VARCHAR(20)     | Yes      | cash/bank_transfer/petty_cash      |
| `vendor_name`      | VARCHAR(255)    | No       | Who was paid                       |
| `receipt_number`   | VARCHAR(50)     | No       | Receipt/invoice number             |
| `receipt_path`     | VARCHAR(500)    | No       | Scanned receipt file               |
| `status`           | VARCHAR(20)     | Yes      | draft/pending/approved/rejected/paid |
| `notes`            | TEXT            | No       | Additional notes                   |
| `rejection_reason` | TEXT            | No       | Reason if rejected                 |
| `approved_by`      | FK → users      | No       | Who approved                       |
| `approved_at`      | TIMESTAMP       | No       | Approval timestamp                 |
| `journal_entry_id` | FK → journal_entries | No  | Linked accounting entry            |
| `recurring_expense_id` | FK → recurring_expenses | No | Source recurring expense     |
| `created_by`       | FK → users      | Yes      | Who recorded                       |
| `updated_by`       | FK → users      | No       | Who last updated                   |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`       | TIMESTAMP       | No       | Soft delete                        |

**Business Rules:**
- Reference auto-generated: `EXP-{YYYY}-{MM}-{sequence}` per branch.
- Status workflow:
  - If `requires_approval` on category AND amount > `approval_threshold`: `draft` → `pending` → `approved` → `paid`.
  - If auto-approvable: `draft` → `approved` → `paid`.
- Only `draft` status can be edited.
- Approved expenses create a journal entry automatically.
- Receipt upload encouraged but not mandatory.
- `amount = net_amount + tax_amount`.

### 2.3 Recurring Expenses (المصروفات المتكررة)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `category_id`      | FK → expense_categories | Yes | Expense category              |
| `description`      | VARCHAR(500)    | Yes      | Expense description                |
| `amount`           | BIGINT          | Yes      | Recurring amount (piasters)        |
| `payment_method`   | VARCHAR(20)     | Yes      | Payment method                     |
| `vendor_name`      | VARCHAR(255)    | No       | Vendor                             |
| `frequency`        | VARCHAR(20)     | Yes      | daily/weekly/monthly/quarterly/yearly |
| `day_of_month`     | INT             | No       | Day to generate (for monthly)      |
| `next_due_date`    | DATE            | Yes      | Next occurrence date               |
| `start_date`       | DATE            | Yes      | Start date                         |
| `end_date`         | DATE            | No       | End date (null = indefinite)       |
| `is_active`        | BOOLEAN         | Yes      | Active/inactive                    |
| `auto_approve`     | BOOLEAN         | Yes      | Auto-approve generated expenses    |
| `last_generated_at`| TIMESTAMP       | No       | Last generation timestamp          |
| `notes`            | TEXT            | No       | Notes                              |
| `created_by`       | FK → users      | Yes      | Who created                        |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`       | TIMESTAMP       | No       | Soft delete                        |

**Business Rules:**
- A scheduled job checks daily for recurring expenses due today.
- When due, system creates a new expense record linked to the recurring source.
- If `auto_approve`, the generated expense goes straight to `approved` status.
- `next_due_date` updated after each generation based on `frequency`.
- Supports rent, utility estimates, subscriptions, etc.

### 2.4 Petty Cash (العهدة النثرية)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `custodian_id`     | FK → employees  | Yes      | Employee holding petty cash        |
| `initial_amount`   | BIGINT          | Yes      | Initial fund amount (piasters)     |
| `current_balance`  | BIGINT          | Yes      | Current balance (piasters)         |
| `last_replenished` | TIMESTAMP       | No       | Last replenishment date            |
| `status`           | VARCHAR(20)     | Yes      | active/closed                      |
| `notes`            | TEXT            | No       | Notes                              |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

**Business Rules:**
- Expenses with `payment_method = petty_cash` deduct from petty cash balance.
- Replenishment creates a journal entry and resets the balance.
- Petty cash reconciliation required periodically.

---

## 3. API Endpoints

| Method   | Endpoint                                | Permission                  | Description              |
| -------- | --------------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/expenses`                             | `exp.expenses.view`         | List expenses            |
| `POST`   | `/expenses`                             | `exp.expenses.create`       | Create expense           |
| `GET`    | `/expenses/{id}`                        | `exp.expenses.view`         | Get expense details      |
| `PUT`    | `/expenses/{id}`                        | `exp.expenses.update`       | Update draft expense     |
| `DELETE` | `/expenses/{id}`                        | `exp.expenses.delete`       | Delete draft expense     |
| `PATCH`  | `/expenses/{id}/submit`                 | `exp.expenses.create`       | Submit for approval      |
| `PATCH`  | `/expenses/{id}/approve`                | `exp.expenses.approve`      | Approve expense          |
| `PATCH`  | `/expenses/{id}/reject`                 | `exp.expenses.approve`      | Reject expense           |
| `PATCH`  | `/expenses/{id}/pay`                    | `exp.expenses.pay`          | Mark as paid             |
| `GET`    | `/expenses/categories`                  | `exp.categories.view`       | List categories          |
| `POST`   | `/expenses/categories`                  | `exp.categories.create`     | Create category          |
| `PUT`    | `/expenses/categories/{id}`             | `exp.categories.update`     | Update category          |
| `DELETE` | `/expenses/categories/{id}`             | `exp.categories.delete`     | Soft delete category     |
| `GET`    | `/expenses/recurring`                   | `exp.recurring.view`        | List recurring expenses  |
| `POST`   | `/expenses/recurring`                   | `exp.recurring.create`      | Create recurring expense |
| `PUT`    | `/expenses/recurring/{id}`              | `exp.recurring.update`      | Update recurring expense |
| `DELETE` | `/expenses/recurring/{id}`              | `exp.recurring.delete`      | Deactivate recurring     |
| `GET`    | `/expenses/pending-approval`            | `exp.expenses.approve`      | Approval queue           |

---

## 4. Expense Approval Workflow

```
                    ┌───────┐
                    │ Draft │
                    └───┬───┘
                        │ Submit
                        ▼
        ┌──────────────────────────────┐
        │  Requires Approval?          │
        │  (category setting + amount) │
        └──────┬───────────────┬───────┘
               │ Yes           │ No (auto-approve)
               ▼               ▼
          ┌─────────┐     ┌──────────┐
          │ Pending │     │ Approved │
          └────┬────┘     └────┬─────┘
               │               │
        ┌──────┴──────┐        │ Mark paid
        │             │        ▼
   ┌────┴─────┐  ┌────┴────┐ ┌──────┐
   │ Approved │  │Rejected │ │ Paid │
   └────┬─────┘  └─────────┘ └──────┘
        │ Mark paid
        ▼
     ┌──────┐
     │ Paid │
     └──────┘
```

---

## 5. Accounting Integration

### 5.1 Expense Approved/Paid

| Account              | Debit              | Credit             |
| -------------------- | ------------------ | ------------------ |
| Expense Account (per category) | Expense Amount |                |
| Cash / Bank / Petty Cash |                | Expense Amount     |

### 5.2 Petty Cash Replenishment

| Account              | Debit              | Credit             |
| -------------------- | ------------------ | ------------------ |
| Petty Cash           | Replenishment Amount|                   |
| Cash / Bank          |                    | Replenishment Amount|

---

## 6. Permissions

```
exp.expenses.view
exp.expenses.create
exp.expenses.update
exp.expenses.delete
exp.expenses.approve
exp.expenses.pay
exp.expenses.export

exp.categories.view
exp.categories.create
exp.categories.update
exp.categories.delete

exp.recurring.view
exp.recurring.create
exp.recurring.update
exp.recurring.delete

exp.petty_cash.view
exp.petty_cash.manage

exp.reports.view
exp.reports.export
```

---

## 7. Reports

| Report                    | Description                                    |
| ------------------------- | ---------------------------------------------- |
| Expense Summary           | Total expenses by category in a period         |
| Expense Detail Report     | All expenses with full details                 |
| Monthly Expense Trend     | Expense totals month-over-month                |
| Category Comparison       | Actual vs. budget per category                 |
| Approval Queue Report     | Pending expenses awaiting approval             |
| Petty Cash Report         | Petty cash usage and balance                   |
| Recurring Expense Report  | Active recurring expenses and schedules        |
| Expense by Payment Method | Breakdown by cash/bank/petty cash              |
| Top Expenses              | Largest individual expenses in a period        |
