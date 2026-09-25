# Module: Accounting (المحاسبة)

> Chart of accounts, journal entries, general ledger, and financial statements.

---

## 1. Module Overview

| Property         | Value                                         |
| ---------------- | --------------------------------------------- |
| **Module Code**  | `acc`                                         |
| **API Prefix**   | `/api/v1/accounting`                          |
| **Branch Scoped**| Yes                                           |
| **Depends On**   | Settings (fiscal year, branches)              |
| **Depended By**  | All financial modules (POS, Purchases, Expenses, Payroll) |

---

## 2. Core Principle: Double-Entry Bookkeeping

Every financial transaction MUST produce a balanced journal entry where:

```
Total Debits = Total Credits (always, no exceptions)
```

The accounting equation must always hold:

```
Assets = Liabilities + Equity + (Revenue - Expenses)
```

All monetary values stored as **integers in piasters**. No floating-point math.

---

## 3. Entities

### 3.1 Fiscal Years (السنوات المالية)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `name`             | VARCHAR(50)     | Yes      | e.g., "2026"                       |
| `start_date`       | DATE            | Yes      | Fiscal year start                  |
| `end_date`         | DATE            | Yes      | Fiscal year end                    |
| `status`           | VARCHAR(20)     | Yes      | open/closed/locked                 |
| `closed_by`        | FK → users      | No       | Who closed                         |
| `closed_at`        | TIMESTAMP       | No       | Closing timestamp                  |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

**Business Rules:**
- Only one fiscal year can be `open` per branch at a time.
- `closed` fiscal years cannot accept new journal entries.
- `locked` is permanent — no modifications, no reopening.
- Year-end closing creates opening balances for the next year.
- Balance sheet accounts carry forward; income/expense accounts zero out.

### 3.2 Fiscal Periods (الفترات المالية)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `fiscal_year_id`   | FK → fiscal_years | Yes   | Parent fiscal year                 |
| `period_number`    | INT             | Yes      | Period number (1-12)               |
| `name`             | VARCHAR(50)     | Yes      | e.g., "January 2026"              |
| `start_date`       | DATE            | Yes      | Period start                       |
| `end_date`         | DATE            | Yes      | Period end                         |
| `status`           | VARCHAR(20)     | Yes      | open/closed                        |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

### 3.3 Chart of Accounts — Account Types (أنواع الحسابات)

The chart follows standard accounting classification:

| Type Code | Name (AR)       | Name (EN)       | Normal Balance | Financial Statement |
| --------- | --------------- | --------------- | -------------- | ------------------- |
| `1`       | أصول            | Assets          | Debit          | Balance Sheet       |
| `2`       | خصوم            | Liabilities     | Credit         | Balance Sheet       |
| `3`       | حقوق ملكية      | Equity          | Credit         | Balance Sheet       |
| `4`       | إيرادات         | Revenue         | Credit         | Income Statement    |
| `5`       | مصروفات         | Expenses        | Debit          | Income Statement    |

### 3.4 Accounts (دليل الحسابات)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `account_number`   | VARCHAR(20)     | Yes      | Account number (hierarchical)      |
| `name_ar`          | VARCHAR(255)    | Yes      | Account name in Arabic             |
| `name_en`          | VARCHAR(255)    | Yes      | Account name in English            |
| `account_type`     | VARCHAR(20)     | Yes      | asset/liability/equity/revenue/expense |
| `parent_id`        | FK → self       | No       | Parent account (hierarchy)         |
| `level`            | INT             | Yes      | Hierarchy depth (1=root, 2, 3...)  |
| `is_parent`        | BOOLEAN         | Yes      | Has sub-accounts (not postable)    |
| `is_postable`      | BOOLEAN         | Yes      | Can receive journal entries        |
| `normal_balance`   | VARCHAR(6)      | Yes      | debit / credit                     |
| `current_balance`  | BIGINT          | Yes      | Running balance (piasters)         |
| `is_system`        | BOOLEAN         | Yes      | System-managed (cannot delete)     |
| `is_active`        | BOOLEAN         | Yes      | Active/inactive                    |
| `description`      | TEXT            | No       | Account description                |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`       | TIMESTAMP       | No       | Soft delete                        |

**Account Numbering Convention:**

```
1xxx — Assets
  11xx — Current Assets
    1101 — Cash on Hand (نقدية بالصندوق)
    1102 — Cash at Bank (نقدية بالبنك)
    1103 — Petty Cash (عهدة نثرية)
    1110 — Accounts Receivable (عملاء - مدينون)
    1120 — Inventory (مخزون)
    1130 — Prepaid Expenses (مصروفات مقدمة)
  12xx — Fixed Assets
    1201 — Equipment (معدات)
    1202 — Furniture (أثاث)
    1210 — Accumulated Depreciation (مجمع الإهلاك)

2xxx — Liabilities
  21xx — Current Liabilities
    2101 — Accounts Payable (موردون - دائنون)
    2102 — Salaries Payable (مرتبات مستحقة)
    2103 — Tax Payable (ضرائب مستحقة)
    2104 — Social Insurance Payable (تأمينات مستحقة)
    2105 — Accrued Expenses (مصروفات مستحقة)
    2110 — Customer Deposits (أمانات عملاء)

3xxx — Equity
  3101 — Owner's Capital (رأس المال)
  3102 — Retained Earnings (أرباح محتجزة)
  3103 — Current Year Earnings (أرباح العام الحالي)
  3110 — Owner's Drawings (مسحوبات شخصية)

4xxx — Revenue
  4101 — Sales Revenue (إيرادات المبيعات)
  4102 — Dine-in Revenue (إيرادات الطعام بالمطعم)
  4103 — Takeaway Revenue (إيرادات الطلبات الخارجية)
  4104 — Delivery Revenue (إيرادات التوصيل)
  4110 — Other Revenue (إيرادات أخرى)
  4120 — Sales Discounts (خصومات المبيعات) [contra]
  4130 — Sales Returns (مردودات المبيعات) [contra]

5xxx — Expenses
  5101 — Cost of Goods Sold (تكلفة البضاعة المباعة)
  5201 — Salaries & Wages (مرتبات وأجور)
  5202 — Social Insurance - Employer (تأمينات - حصة صاحب العمل)
  5203 — Overtime Pay (أجر إضافي)
  5301 — Rent Expense (إيجار)
  5302 — Utilities Expense (مرافق)
  5303 — Maintenance Expense (صيانة)
  5304 — Cleaning Expense (نظافة)
  5305 — Transportation Expense (نقل ومواصلات)
  5306 — Telecom Expense (اتصالات)
  5307 — Office Supplies (مطبوعات وقرطاسية)
  5308 — Marketing Expense (تسويق)
  5309 — Licenses & Fees (تراخيص ورسوم)
  5310 — Depreciation Expense (مصروف الإهلاك)
  5320 — Bank Charges (مصاريف بنكية)
  5399 — Miscellaneous Expense (مصروفات متنوعة)
```

**Business Rules:**
- Only `is_postable = true` accounts can receive journal entry lines.
- Parent accounts (`is_parent = true`) show aggregated balances of children.
- `is_system` accounts cannot be deleted or have their type changed.
- `current_balance` updated on every confirmed journal entry.
- Account numbers must be unique per branch.
- Level 1 accounts define the type (1=Asset, 2=Liability, etc.).

### 3.5 Journal Entries (القيود اليومية)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `fiscal_year_id`   | FK → fiscal_years | Yes   | Fiscal year                        |
| `fiscal_period_id` | FK → fiscal_periods | No  | Fiscal period                      |
| `entry_number`     | VARCHAR(30)     | Yes      | Auto-generated (JE-2026-07-00001)  |
| `entry_date`       | DATE            | Yes      | Transaction date                   |
| `description`      | VARCHAR(500)    | Yes      | Entry description                  |
| `reference_type`   | VARCHAR(50)     | No       | Source module (PosOrder, PayrollRun, etc.) |
| `reference_id`     | BIGINT          | No       | Source record ID                   |
| `source`           | VARCHAR(20)     | Yes      | manual/auto/system                 |
| `total_debit`      | BIGINT          | Yes      | Total debits (piasters)            |
| `total_credit`     | BIGINT          | Yes      | Total credits (piasters)           |
| `status`           | VARCHAR(20)     | Yes      | draft/posted/reversed              |
| `is_reversing`     | BOOLEAN         | Yes      | Is this a reversal entry           |
| `reversed_entry_id`| FK → self       | No       | Original entry (if reversal)       |
| `posted_by`        | FK → users      | No       | Who posted                         |
| `posted_at`        | TIMESTAMP       | No       | Post timestamp                     |
| `notes`            | TEXT            | No       | Notes                              |
| `attachments`      | JSON            | No       | File attachment paths              |
| `created_by`       | FK → users      | Yes      | Who created                        |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

**Business Rules:**
- `total_debit` MUST equal `total_credit` — enforced at database and application level.
- `posted` entries are **immutable** — no edits, no deletes.
- Corrections to posted entries: create a reversal entry, then a correcting entry.
- `auto` source = generated by other modules (POS, Purchases, Expenses, Payroll).
- `manual` source = created by accountant.
- `system` source = year-end closing, opening balances.
- Entry date must fall within an `open` fiscal period.
- Entry number auto-incremented per branch per year.
- At least 2 lines required per entry.

### 3.6 Journal Entry Lines (بنود القيد)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `journal_entry_id` | FK → journal_entries | Yes | Parent entry                      |
| `account_id`       | FK → accounts   | Yes      | GL account                         |
| `debit_amount`     | BIGINT          | Yes      | Debit amount (piasters), 0 if credit |
| `credit_amount`    | BIGINT          | Yes      | Credit amount (piasters), 0 if debit |
| `description`      | VARCHAR(255)    | No       | Line description                   |
| `cost_center`      | VARCHAR(50)     | No       | Cost center (optional tracking)    |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |

**Business Rules:**
- Each line is either debit OR credit — not both (one must be 0).
- Sum of all `debit_amount` = sum of all `credit_amount` within an entry.
- Account must be `is_postable = true`.
- Account must be `is_active = true`.
- Posting an entry updates `current_balance` on each affected account.

---

## 4. API Endpoints

### 4.1 Chart of Accounts

| Method   | Endpoint                              | Permission                  | Description              |
| -------- | ------------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/accounting/accounts`                | `acc.accounts.view`         | List accounts (tree)     |
| `POST`   | `/accounting/accounts`                | `acc.accounts.create`       | Create account           |
| `GET`    | `/accounting/accounts/{id}`           | `acc.accounts.view`         | Get account details      |
| `PUT`    | `/accounting/accounts/{id}`           | `acc.accounts.update`       | Update account           |
| `DELETE` | `/accounting/accounts/{id}`           | `acc.accounts.delete`       | Deactivate account       |
| `GET`    | `/accounting/accounts/{id}/ledger`    | `acc.ledger.view`           | Account ledger           |

### 4.2 Journal Entries

| Method   | Endpoint                              | Permission                  | Description              |
| -------- | ------------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/accounting/journal`                 | `acc.journal.view`          | List journal entries     |
| `POST`   | `/accounting/journal`                 | `acc.journal.create`        | Create manual entry      |
| `GET`    | `/accounting/journal/{id}`            | `acc.journal.view`          | Get entry details        |
| `PUT`    | `/accounting/journal/{id}`            | `acc.journal.update`        | Update draft entry       |
| `PATCH`  | `/accounting/journal/{id}/post`       | `acc.journal.post`          | Post (confirm) entry     |
| `POST`   | `/accounting/journal/{id}/reverse`    | `acc.journal.reverse`       | Create reversal entry    |
| `DELETE` | `/accounting/journal/{id}`            | `acc.journal.delete`        | Delete draft entry only  |

### 4.3 Financial Reports

| Method   | Endpoint                              | Permission                  | Description              |
| -------- | ------------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/accounting/trial-balance`           | `acc.reports.view`          | Trial balance            |
| `GET`    | `/accounting/income-statement`        | `acc.reports.view`          | Income statement (P&L)   |
| `GET`    | `/accounting/balance-sheet`           | `acc.reports.view`          | Balance sheet            |
| `GET`    | `/accounting/general-ledger`          | `acc.ledger.view`           | General ledger report    |
| `GET`    | `/accounting/account-statement/{id}`  | `acc.ledger.view`           | Single account statement |
| `GET`    | `/accounting/cash-flow`               | `acc.reports.view`          | Cash flow statement      |

### 4.4 Fiscal Year

| Method   | Endpoint                              | Permission                  | Description              |
| -------- | ------------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/accounting/fiscal-years`            | `acc.fiscal_years.view`     | List fiscal years        |
| `POST`   | `/accounting/fiscal-years`            | `acc.fiscal_years.create`   | Create fiscal year       |
| `PATCH`  | `/accounting/fiscal-years/{id}/close` | `acc.fiscal_years.close`    | Close fiscal year        |

---

## 5. Financial Statements

### 5.1 Trial Balance (ميزان المراجعة)

```
┌──────────────────────────────────────────────────────────────┐
│  ميزان المراجعة — 31/07/2026                                 │
│  الفرع: القاهرة                                              │
├──────┬──────────────────────────┬───────────┬─────────────────┤
│ رقم  │ اسم الحساب               │ مدين      │ دائن             │
├──────┼──────────────────────────┼───────────┼─────────────────┤
│ 1101 │ نقدية بالصندوق           │ 45,000.00 │                 │
│ 1102 │ نقدية بالبنك             │ 125,000.00│                 │
│ 1120 │ مخزون                    │ 35,000.00 │                 │
│ 2101 │ موردون - دائنون          │           │ 28,000.00       │
│ 2102 │ مرتبات مستحقة            │           │ 42,000.00       │
│ 3101 │ رأس المال                │           │ 100,000.00      │
│ 4101 │ إيرادات المبيعات          │           │ 180,000.00      │
│ 5101 │ تكلفة البضاعة المباعة     │ 72,000.00 │                 │
│ 5201 │ مرتبات وأجور             │ 55,000.00 │                 │
│ 5302 │ مرافق                    │ 8,000.00  │                 │
│ 5301 │ إيجار                    │ 10,000.00 │                 │
├──────┼──────────────────────────┼───────────┼─────────────────┤
│      │ الإجمالي                 │350,000.00 │ 350,000.00      │
└──────┴──────────────────────────┴───────────┴─────────────────┘
```

### 5.2 Income Statement (قائمة الدخل)

```
┌──────────────────────────────────────────────────────┐
│  قائمة الدخل — يوليو 2026                            │
├──────────────────────────────────────────────────────┤
│  الإيرادات                                           │
│    إيرادات المبيعات              180,000.00           │
│    (-) خصومات المبيعات            (5,000.00)          │
│    (-) مردودات المبيعات           (2,000.00)          │
│  ─────────────────────────────────────────            │
│  صافي الإيرادات                  173,000.00           │
│                                                      │
│  (-) تكلفة البضاعة المباعة       (72,000.00)          │
│  ─────────────────────────────────────────            │
│  مجمل الربح                      101,000.00           │
│                                                      │
│  المصروفات التشغيلية                                  │
│    مرتبات وأجور                  (55,000.00)          │
│    إيجار                         (10,000.00)          │
│    مرافق                          (8,000.00)          │
│    صيانة                          (3,000.00)          │
│    تسويق                          (2,000.00)          │
│    مصروفات أخرى                   (1,500.00)          │
│  ─────────────────────────────────────────            │
│  إجمالي المصروفات التشغيلية      (79,500.00)          │
│  ─────────────────────────────────────────            │
│  صافي الربح                       21,500.00           │
└──────────────────────────────────────────────────────┘
```

### 5.3 Balance Sheet (الميزانية العمومية)

```
┌──────────────────────────────────────────────────────┐
│  الميزانية العمومية — 31/07/2026                      │
├──────────────────────────────────────────────────────┤
│  الأصول                                              │
│  ──────                                              │
│  الأصول المتداولة                                     │
│    نقدية بالصندوق                 45,000.00           │
│    نقدية بالبنك                  125,000.00           │
│    مخزون                          35,000.00           │
│    مصروفات مقدمة                   5,000.00           │
│  ──────────────────────────────                      │
│  إجمالي الأصول المتداولة         210,000.00           │
│                                                      │
│  الأصول الثابتة                                       │
│    معدات                          50,000.00           │
│    (-) مجمع إهلاك                (10,000.00)          │
│  ──────────────────────────────                      │
│  إجمالي الأصول الثابتة            40,000.00           │
│  ══════════════════════════════                      │
│  إجمالي الأصول                   250,000.00           │
│                                                      │
│  الخصوم وحقوق الملكية                                 │
│  ────────────────────                                │
│  الخصوم المتداولة                                     │
│    موردون - دائنون                28,000.00           │
│    مرتبات مستحقة                  42,000.00           │
│    ضرائب مستحقة                    8,500.00           │
│  ──────────────────────────────                      │
│  إجمالي الخصوم                    78,500.00           │
│                                                      │
│  حقوق الملكية                                         │
│    رأس المال                     150,000.00           │
│    أرباح محتجزة                        0.00           │
│    أرباح العام الحالي              21,500.00           │
│  ──────────────────────────────                      │
│  إجمالي حقوق الملكية             171,500.00           │
│  ══════════════════════════════                      │
│  إجمالي الخصوم وحقوق الملكية     250,000.00           │
└──────────────────────────────────────────────────────┘
```

---

## 6. Year-End Closing Process

```
1. Verify all transactions for the year are posted.
2. Generate trial balance — must balance.
3. Calculate net income (Revenue - Expenses).
4. Create closing journal entry:
   - Debit all Revenue accounts (zero them out)
   - Credit all Expense accounts (zero them out)
   - Net difference to Retained Earnings / Current Year Earnings
5. Mark fiscal year as "closed."
6. Create opening balances for new fiscal year:
   - Carry forward all Balance Sheet account balances.
   - Income/Expense accounts start at zero.
7. Open new fiscal year with new periods.
```

---

## 7. Permissions

```
acc.accounts.view
acc.accounts.create
acc.accounts.update
acc.accounts.delete

acc.journal.view
acc.journal.create
acc.journal.update
acc.journal.post
acc.journal.reverse
acc.journal.delete

acc.ledger.view
acc.reports.view
acc.reports.export

acc.fiscal_years.view
acc.fiscal_years.create
acc.fiscal_years.close
```

---

## 8. Integration Points

Every financial module generates automatic journal entries:

| Module     | Trigger                    | Journal Entry Created                      |
| ---------- | -------------------------- | ------------------------------------------ |
| POS        | Order completed            | Debit Cash/Bank, Credit Sales Revenue      |
| POS        | Order voided               | Reversal of original entry                 |
| Purchases  | GRN confirmed              | Debit Inventory, Credit Accounts Payable   |
| Purchases  | Payment to supplier        | Debit Accounts Payable, Credit Cash/Bank   |
| Purchases  | Purchase return             | Debit Accounts Payable, Credit Inventory   |
| Expenses   | Expense approved/paid      | Debit Expense Account, Credit Cash/Bank    |
| Payroll    | Payroll marked as paid     | Debit Salary Expense, Credit various       |
| Inventory  | Stock count adjustment     | Debit/Credit Inventory vs. Adjustment acct |
