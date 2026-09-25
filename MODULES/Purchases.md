# Module: Purchases (المشتريات)

> Purchase orders, goods receiving, returns, and purchase history management.

---

## 1. Module Overview

| Property         | Value                                         |
| ---------------- | --------------------------------------------- |
| **Module Code**  | `pur`                                         |
| **API Prefix**   | `/api/v1/purchases`                           |
| **Branch Scoped**| Yes                                           |
| **Depends On**   | Inventory (items), Suppliers                  |
| **Depended By**  | Inventory (stock movements), Accounting (AP)  |

---

## 2. Entities

### 2.1 Purchase Orders (أوامر الشراء)

| Field                | Type            | Required | Description                        |
| -------------------- | --------------- | -------- | ---------------------------------- |
| `id`                 | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`          | FK → branches   | Yes      | Branch scope                       |
| `reference`          | VARCHAR(30)     | Yes      | Auto-generated (PO-2026-07-001)    |
| `supplier_id`        | FK → suppliers  | Yes      | Supplier                           |
| `order_date`         | DATE            | Yes      | Date order was placed              |
| `expected_delivery`  | DATE            | No       | Expected delivery date             |
| `status`             | VARCHAR(20)     | Yes      | draft/pending/approved/partially_received/received/cancelled |
| `subtotal`           | BIGINT          | Yes      | Sum of line items (piasters)       |
| `discount_type`      | VARCHAR(10)     | No       | percentage / fixed                 |
| `discount_value`     | BIGINT          | No       | Discount amount/percentage         |
| `discount_amount`    | BIGINT          | Yes      | Calculated discount (piasters)     |
| `tax_amount`         | BIGINT          | Yes      | Tax amount (piasters)              |
| `total_amount`       | BIGINT          | Yes      | Grand total (piasters)             |
| `paid_amount`        | BIGINT          | Yes      | Amount paid so far (piasters)      |
| `payment_status`     | VARCHAR(20)     | Yes      | unpaid/partially_paid/paid         |
| `payment_terms`      | VARCHAR(50)     | No       | Payment terms (e.g., Net 30)       |
| `delivery_address`   | TEXT            | No       | Delivery address                   |
| `notes`              | TEXT            | No       | Order notes                        |
| `internal_notes`     | TEXT            | No       | Internal notes (not for supplier)  |
| `approved_by`        | FK → users      | No       | Who approved                       |
| `approved_at`        | TIMESTAMP       | No       | Approval timestamp                 |
| `created_by`         | FK → users      | Yes      | Who created                        |
| `updated_by`         | FK → users      | No       | Who last updated                   |
| `created_at`         | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`         | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`         | TIMESTAMP       | No       | Soft delete                        |

**Business Rules:**
- Reference auto-generated: `PO-{YYYY}-{MM}-{sequence}` per branch.
- Status workflow: `draft` → `pending` → `approved` → `partially_received` / `received`.
- Only `draft` and `pending` orders can be edited.
- `approved` orders cannot be modified — cancel and create new if needed.
- Approval required for orders above a configurable threshold.
- `partially_received` when some but not all items have been received.
- `received` when all items are fully received.
- `cancelled` orders remain in history for audit; reason required.
- `total_amount = subtotal - discount_amount + tax_amount`.
- `payment_status` updated automatically when payments are recorded.

### 2.2 Purchase Order Items (بنود أمر الشراء)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `purchase_order_id`| FK → purchase_orders | Yes | Parent order                      |
| `item_id`          | FK → inventory_items | Yes | Inventory item                    |
| `quantity`         | DECIMAL(15,3)   | Yes      | Ordered quantity                   |
| `unit_id`          | FK → units      | Yes      | Unit of measure                    |
| `unit_price`       | BIGINT          | Yes      | Price per unit (piasters)          |
| `discount_percentage` | DECIMAL(5,2) | No       | Line item discount %               |
| `discount_amount`  | BIGINT          | Yes      | Line discount (piasters)           |
| `tax_rate`         | DECIMAL(5,2)    | No       | Tax rate %                         |
| `tax_amount`       | BIGINT          | Yes      | Line tax (piasters)                |
| `total_amount`     | BIGINT          | Yes      | Line total (piasters)              |
| `received_quantity`| DECIMAL(15,3)   | Yes      | Quantity received so far           |
| `notes`            | TEXT            | No       | Line item notes                    |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

**Calculations:**
```
line_subtotal = quantity × unit_price
line_discount = line_subtotal × (discount_percentage / 100)  OR  fixed amount
line_after_discount = line_subtotal - line_discount
line_tax = line_after_discount × (tax_rate / 100)
line_total = line_after_discount + line_tax
```

### 2.3 Goods Receiving Notes (إذن استلام)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `reference`        | VARCHAR(30)     | Yes      | Auto-generated (GRN-2026-07-001)   |
| `purchase_order_id`| FK → purchase_orders | Yes | Related PO                        |
| `supplier_id`      | FK → suppliers  | Yes      | Supplier                           |
| `received_date`    | DATE            | Yes      | Date goods received                |
| `supplier_invoice` | VARCHAR(50)     | No       | Supplier's invoice number          |
| `total_amount`     | BIGINT          | Yes      | Total received value (piasters)    |
| `status`           | VARCHAR(20)     | Yes      | draft/confirmed                    |
| `notes`            | TEXT            | No       | Receiving notes                    |
| `received_by`      | FK → users      | Yes      | Who received the goods             |
| `confirmed_by`     | FK → users      | No       | Who confirmed                      |
| `confirmed_at`     | TIMESTAMP       | No       | Confirmation timestamp             |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

### 2.4 Goods Receiving Items (بنود الاستلام)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `receiving_note_id`| FK → goods_receiving_notes | Yes | Parent GRN                   |
| `po_item_id`       | FK → po_items   | Yes      | Related PO line item               |
| `item_id`          | FK → items      | Yes      | Inventory item                     |
| `ordered_quantity` | DECIMAL(15,3)   | Yes      | Originally ordered                 |
| `received_quantity`| DECIMAL(15,3)   | Yes      | Quantity received this delivery    |
| `unit_id`          | FK → units      | Yes      | Unit of measure                    |
| `unit_price`       | BIGINT          | Yes      | Actual cost per unit (piasters)    |
| `total_amount`     | BIGINT          | Yes      | Line total (piasters)              |
| `batch_number`     | VARCHAR(50)     | No       | Batch/lot number                   |
| `expiry_date`      | DATE            | No       | Expiry date                        |
| `quality_status`   | VARCHAR(20)     | Yes      | accepted/rejected/partial          |
| `rejection_reason` | VARCHAR(255)    | No       | Reason if rejected                 |
| `notes`            | TEXT            | No       | Notes                              |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |

**Business Rules:**
- Confirming a GRN creates `purchase_receive` stock movements for accepted items.
- `received_quantity` on the PO item is updated accordingly.
- Rejected items are logged but do not create stock movements.
- GRN can receive partial quantities (partial delivery).
- Item's `cost_price` and `average_cost` updated upon receiving.
- A GRN cannot be deleted after confirmation — only reversed.

### 2.5 Purchase Returns (مرتجعات المشتريات)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `reference`        | VARCHAR(30)     | Yes      | Auto-generated (PR-2026-07-001)    |
| `purchase_order_id`| FK → purchase_orders | No  | Related PO (if applicable)         |
| `receiving_note_id`| FK → GRNs       | No       | Related GRN (if applicable)        |
| `supplier_id`      | FK → suppliers  | Yes      | Supplier                           |
| `return_date`      | DATE            | Yes      | Date of return                     |
| `reason`           | TEXT            | Yes      | Return reason                      |
| `total_amount`     | BIGINT          | Yes      | Total return value (piasters)      |
| `status`           | VARCHAR(20)     | Yes      | draft/confirmed/credited           |
| `notes`            | TEXT            | No       | Notes                              |
| `created_by`       | FK → users      | Yes      | Who created                        |
| `confirmed_by`     | FK → users      | No       | Who confirmed                      |
| `confirmed_at`     | TIMESTAMP       | No       | Confirmation timestamp             |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

### 2.6 Purchase Return Items (بنود المرتجعات)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `purchase_return_id`| FK → purchase_returns | Yes | Parent return                    |
| `item_id`          | FK → items      | Yes      | Inventory item                     |
| `quantity`         | DECIMAL(15,3)   | Yes      | Quantity returned                  |
| `unit_id`          | FK → units      | Yes      | Unit of measure                    |
| `unit_price`       | BIGINT          | Yes      | Return price per unit (piasters)   |
| `total_amount`     | BIGINT          | Yes      | Line total (piasters)              |
| `reason`           | VARCHAR(255)    | No       | Item-specific reason               |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |

**Business Rules:**
- Confirming a return creates `purchase_return` stock movements (stock out).
- Return value credited to supplier's account (reduces payable).
- Cannot return more than received quantity.

### 2.7 Purchase Payments (مدفوعات المشتريات)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `purchase_order_id`| FK → purchase_orders | Yes | Related PO                        |
| `supplier_id`      | FK → suppliers  | Yes      | Supplier                           |
| `payment_date`     | DATE            | Yes      | Payment date                       |
| `amount`           | BIGINT          | Yes      | Payment amount (piasters)          |
| `payment_method`   | VARCHAR(20)     | Yes      | cash/bank_transfer/cheque          |
| `reference_number` | VARCHAR(50)     | No       | Cheque number / transfer reference |
| `notes`            | TEXT            | No       | Notes                              |
| `journal_entry_id` | FK → journal_entries | No  | Linked accounting entry            |
| `created_by`       | FK → users      | Yes      | Who recorded                       |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

**Business Rules:**
- Payment creates a journal entry: Debit Accounts Payable, Credit Cash/Bank.
- PO `paid_amount` updated, `payment_status` recalculated.
- Cannot pay more than `total_amount - paid_amount`.
- Payment cannot be deleted — only reversed with a new entry.

---

## 3. API Endpoints

### 3.1 Purchase Orders

| Method   | Endpoint                                | Permission                  | Description              |
| -------- | --------------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/purchases/orders`                     | `pur.orders.view`           | List orders (paginated)  |
| `POST`   | `/purchases/orders`                     | `pur.orders.create`         | Create order             |
| `GET`    | `/purchases/orders/{id}`                | `pur.orders.view`           | Get order details        |
| `PUT`    | `/purchases/orders/{id}`                | `pur.orders.update`         | Update draft/pending order|
| `PATCH`  | `/purchases/orders/{id}/approve`        | `pur.orders.approve`        | Approve order            |
| `PATCH`  | `/purchases/orders/{id}/cancel`         | `pur.orders.cancel`         | Cancel order             |
| `DELETE` | `/purchases/orders/{id}`                | `pur.orders.delete`         | Delete draft order only  |

### 3.2 Goods Receiving

| Method   | Endpoint                                | Permission                  | Description              |
| -------- | --------------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/purchases/receiving`                  | `pur.receiving.view`        | List GRNs               |
| `POST`   | `/purchases/receiving`                  | `pur.receiving.create`      | Create GRN (from PO)    |
| `GET`    | `/purchases/receiving/{id}`             | `pur.receiving.view`        | Get GRN details          |
| `PUT`    | `/purchases/receiving/{id}`             | `pur.receiving.update`      | Update draft GRN         |
| `PATCH`  | `/purchases/receiving/{id}/confirm`     | `pur.receiving.confirm`     | Confirm GRN → stock update|

### 3.3 Purchase Returns

| Method   | Endpoint                                | Permission                  | Description              |
| -------- | --------------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/purchases/returns`                    | `pur.returns.view`          | List returns             |
| `POST`   | `/purchases/returns`                    | `pur.returns.create`        | Create return            |
| `GET`    | `/purchases/returns/{id}`               | `pur.returns.view`          | Get return details       |
| `PATCH`  | `/purchases/returns/{id}/confirm`       | `pur.returns.confirm`       | Confirm return           |

### 3.4 Payments

| Method   | Endpoint                                | Permission                  | Description              |
| -------- | --------------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/purchases/payments`                   | `pur.payments.view`         | List payments            |
| `POST`   | `/purchases/payments`                   | `pur.payments.create`       | Record payment           |
| `GET`    | `/purchases/payments/{id}`              | `pur.payments.view`         | Get payment details      |

---

## 4. Purchase Order Workflow

```
┌───────┐    Submit    ┌─────────┐   Approve   ┌──────────┐
│ Draft │────────────→│ Pending │────────────→│ Approved │
└───┬───┘              └────┬────┘              └────┬─────┘
    │                       │                       │
    │ Delete                │ Cancel                 │ Receive (partial)
    ▼                       ▼                       ▼
  (removed)            ┌──────────┐          ┌──────────────────┐
                       │Cancelled │          │Partially Received│
                       └──────────┘          └────────┬─────────┘
                                                      │ Receive (complete)
                                                      ▼
                                                ┌──────────┐
                                                │ Received │
                                                └──────────┘
```

---

## 5. Accounting Integration

### 5.1 Goods Receiving (GRN Confirmed)

| Account              | Debit              | Credit             |
| -------------------- | ------------------ | ------------------ |
| Inventory Asset      | Received Value     |                    |
| Accounts Payable     |                    | Received Value     |

### 5.2 Payment to Supplier

| Account              | Debit              | Credit             |
| -------------------- | ------------------ | ------------------ |
| Accounts Payable     | Payment Amount     |                    |
| Cash / Bank          |                    | Payment Amount     |

### 5.3 Purchase Return (Confirmed)

| Account              | Debit              | Credit             |
| -------------------- | ------------------ | ------------------ |
| Accounts Payable     | Return Value       |                    |
| Inventory Asset      |                    | Return Value       |

---

## 6. Permissions

```
pur.orders.view
pur.orders.create
pur.orders.update
pur.orders.approve
pur.orders.cancel
pur.orders.delete
pur.orders.export

pur.receiving.view
pur.receiving.create
pur.receiving.update
pur.receiving.confirm

pur.returns.view
pur.returns.create
pur.returns.confirm

pur.payments.view
pur.payments.create

pur.reports.view
pur.reports.export
```

---

## 7. Reports

| Report                    | Description                                    |
| ------------------------- | ---------------------------------------------- |
| Purchase Orders Report    | Orders by status, date range, supplier         |
| Receiving Report          | GRNs by date range, supplier                   |
| Purchase Returns Report   | Returns by date range, supplier, reason        |
| Supplier Purchase Summary | Total purchases per supplier in a period       |
| Item Purchase History     | Purchase history for specific items            |
| Outstanding Orders        | Approved but not fully received                |
| Accounts Payable Aging    | Unpaid amounts by supplier, aging buckets      |
| Payment History           | All payments by date range, method             |
| Price Variance Report     | Price changes for items across purchases       |
