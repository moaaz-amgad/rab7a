# Module: Sales (المبيعات)

> Multi-channel sales management: direct sales, catering/events, delivery aggregators, sales invoicing, and target tracking.

---

## 1. Module Overview

| Property         | Value                                         |
| ---------------- | --------------------------------------------- |
| **Module Code**  | `sales`                                       |
| **API Prefix**   | `/api/v1/sales`                               |
| **Branch Scoped**| Yes                                           |
| **Depends On**   | Inventory, Customers, Accounting, POS         |
| **Depended By**  | Reports, Accounting (revenue entries)         |

---

## 2. Entities

### 2.1 Sales Channels (قنوات البيع)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `name_ar`          | VARCHAR(255)    | Yes      | Channel name in Arabic             |
| `name_en`          | VARCHAR(255)    | Yes      | Channel name in English            |
| `code`             | VARCHAR(50)     | Yes      | Unique code (POS, CATERING, TALABAT)|
| `commission_rate`  | DECIMAL(5,2)    | Yes      | Commission percentage (e.g., 15.00)|
| `is_active`        | BOOLEAN         | Yes      | Active/inactive                    |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

**Default Channels:**
- `POS_DINE_IN`: Dine-in operations
- `POS_TAKEAWAY`: Takeaway / Counter sales
- `DIRECT_DELIVERY`: Restaurant's own delivery fleet
- `TALABAT` / `ELMENUS`: Aggregator delivery services
- `CATERING`: Event & corporate catering contracts

### 2.2 Sales Invoices / Orders (فواتير / عقود المبيعات)

For sales outside immediate POS transactions (such as corporate catering, bulk orders, wholesale, or credit sales).

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `invoice_number`   | VARCHAR(30)     | Yes      | Unique number (INV-2026-07-001)    |
| `channel_id`       | FK → channels   | Yes      | Sales channel                      |
| `customer_id`      | FK → customers  | Yes      | Customer                           |
| `issue_date`       | DATE            | Yes      | Invoice date                       |
| `due_date`         | DATE            | Yes      | Payment due date                   |
| `status`           | VARCHAR(20)     | Yes      | draft/confirmed/paid/cancelled     |
| `subtotal`         | BIGINT          | Yes      | Subtotal before tax/discount (piasters)|
| `discount_amount`  | BIGINT          | Yes      | Total discount (piasters)          |
| `tax_amount`       | BIGINT          | Yes      | VAT / Sales tax (piasters)         |
| `total_amount`     | BIGINT          | Yes      | Net total amount (piasters)        |
| `paid_amount`      | BIGINT          | Yes      | Amount paid to date (piasters)     |
| `notes`            | TEXT            | No       | Terms & conditions / notes         |
| `created_by`       | FK → users      | Yes      | Creator user                       |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`       | TIMESTAMP       | No       | Soft delete                        |

---

## 3. API Endpoints

| Method   | Endpoint                              | Permission                  | Description              |
| -------- | ------------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/sales/invoices`                     | `sales.invoices.view`       | List sales invoices      |
| `POST`   | `/sales/invoices`                     | `sales.invoices.create`     | Create commercial invoice|
| `GET`    | `/sales/invoices/{id}`                | `sales.invoices.view`       | Get invoice details      |
| `PUT`    | `/sales/invoices/{id}`                | `sales.invoices.update`     | Update draft invoice     |
| `PATCH`  | `/sales/invoices/{id}/confirm`        | `sales.invoices.confirm`    | Confirm invoice          |
| `POST`   | `/sales/invoices/{id}/payments`       | `sales.payments.create`     | Record client payment    |
| `GET`    | `/sales/channels`                     | `sales.channels.view`       | List sales channels      |

---

## 4. Business Logic & Accounting Integration

1. **Revenue Recognition**: Confirmed invoices create a journal entry:
   - Debit: Accounts Receivable (`1110`)
   - Credit: Sales Revenue (`4101`)
   - Credit: Sales Tax Payable (`2103`)
2. **Payment Collection**:
   - Debit: Cash (`1101`) / Bank (`1102`)
   - Credit: Accounts Receivable (`1110`)
3. **Aggregator Commission**: Recorded as an expense upon settlement reconciliation.
