# Module: Suppliers (الموردون)

> Supplier profiles, contracts, performance evaluation, and payment tracking.

---

## 1. Module Overview

| Property         | Value                                         |
| ---------------- | --------------------------------------------- |
| **Module Code**  | `sup`                                         |
| **API Prefix**   | `/api/v1/suppliers`                           |
| **Branch Scoped**| Yes (optionally shared across branches)       |
| **Depends On**   | Settings (branches)                           |
| **Depended By**  | Purchases (PO supplier), Inventory (default supplier) |

---

## 2. Entities

### 2.1 Suppliers (الموردون)

| Field                | Type            | Required | Description                        |
| -------------------- | --------------- | -------- | ---------------------------------- |
| `id`                 | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`          | FK → branches   | Yes      | Branch scope                       |
| `code`               | VARCHAR(20)     | Yes      | Supplier code (auto/manual, unique)|
| `name_ar`            | VARCHAR(255)    | Yes      | Supplier name in Arabic            |
| `name_en`            | VARCHAR(255)    | Yes      | Supplier name in English           |
| `company_name`       | VARCHAR(255)    | No       | Legal company name                 |
| `tax_registration`   | VARCHAR(50)     | No       | Tax registration number            |
| `commercial_register`| VARCHAR(50)     | No       | Commercial register number         |
| `contact_person`     | VARCHAR(255)    | No       | Primary contact person             |
| `phone`              | VARCHAR(20)     | Yes      | Primary phone                      |
| `phone_secondary`    | VARCHAR(20)     | No       | Secondary phone                    |
| `email`              | VARCHAR(255)    | No       | Email address                      |
| `website`            | VARCHAR(255)    | No       | Website URL                        |
| `address`            | TEXT            | No       | Full address                       |
| `city`               | VARCHAR(100)    | No       | City                               |
| `payment_terms`      | VARCHAR(50)     | No       | Default payment terms              |
| `credit_limit`       | BIGINT          | No       | Credit limit (piasters)            |
| `current_balance`    | BIGINT          | Yes      | Current outstanding balance (piasters) |
| `category`           | VARCHAR(50)     | No       | Supplier category                  |
| `rating`             | INT             | No       | Rating 1-5                         |
| `bank_name`          | VARCHAR(255)    | No       | Bank name                          |
| `bank_account`       | VARCHAR(50)     | No       | Bank account number                |
| `bank_iban`          | VARCHAR(50)     | No       | IBAN                               |
| `is_active`          | BOOLEAN         | Yes      | Active/inactive                    |
| `notes`              | TEXT            | No       | Internal notes                     |
| `created_by`         | FK → users      | No       | Audit                              |
| `updated_by`         | FK → users      | No       | Audit                              |
| `created_at`         | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`         | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`         | TIMESTAMP       | No       | Soft delete                        |

**Business Rules:**
- Supplier code auto-generated: `SUP-{4-digit sequence}` per branch.
- `current_balance` represents amount owed TO the supplier (accounts payable).
- Updated automatically when: PO received (increase), payment made (decrease), return (decrease).
- Cannot delete a supplier with outstanding balance or linked open POs.
- Suppliers with `is_active = false` cannot be selected for new POs.

### 2.2 Supplier Contracts (عقود الموردين)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `supplier_id`      | FK → suppliers  | Yes      | Supplier                           |
| `contract_number`  | VARCHAR(50)     | Yes      | Contract reference number          |
| `title`            | VARCHAR(255)    | Yes      | Contract title/description         |
| `start_date`       | DATE            | Yes      | Contract start date                |
| `end_date`         | DATE            | Yes      | Contract end date                  |
| `value`            | BIGINT          | No       | Contract value (piasters)          |
| `payment_terms`    | VARCHAR(100)    | No       | Payment terms                      |
| `delivery_terms`   | VARCHAR(255)    | No       | Delivery terms                     |
| `status`           | VARCHAR(20)     | Yes      | active/expired/terminated          |
| `auto_renew`       | BOOLEAN         | Yes      | Auto-renew on expiry               |
| `file_path`        | VARCHAR(500)    | No       | Contract document file             |
| `notes`            | TEXT            | No       | Notes                              |
| `created_by`       | FK → users      | Yes      | Who created                        |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`       | TIMESTAMP       | No       | Soft delete                        |

### 2.3 Supplier Price Lists (قوائم أسعار الموردين)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `supplier_id`      | FK → suppliers  | Yes      | Supplier                           |
| `item_id`          | FK → items      | Yes      | Inventory item                     |
| `unit_id`          | FK → units      | Yes      | Unit of measure                    |
| `unit_price`       | BIGINT          | Yes      | Price per unit (piasters)          |
| `minimum_order`    | DECIMAL(15,3)   | No       | Minimum order quantity             |
| `lead_time_days`   | INT             | No       | Delivery lead time in days         |
| `effective_from`   | DATE            | Yes      | Price effective date               |
| `effective_to`     | DATE            | No       | Price expiry date                  |
| `notes`            | TEXT            | No       | Notes                              |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

**Business Rules:**
- Price lists help auto-fill PO line items when selecting supplier + item.
- Multiple suppliers can supply the same item — comparison facilitated.
- Historical prices preserved for trend analysis.

---

## 3. API Endpoints

| Method   | Endpoint                                | Permission                  | Description              |
| -------- | --------------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/suppliers`                            | `sup.suppliers.view`        | List suppliers           |
| `POST`   | `/suppliers`                            | `sup.suppliers.create`      | Create supplier          |
| `GET`    | `/suppliers/{id}`                       | `sup.suppliers.view`        | Get supplier details     |
| `PUT`    | `/suppliers/{id}`                       | `sup.suppliers.update`      | Update supplier          |
| `DELETE` | `/suppliers/{id}`                       | `sup.suppliers.delete`      | Soft delete supplier     |
| `GET`    | `/suppliers/{id}/purchase-history`      | `sup.suppliers.view`        | Supplier's PO history    |
| `GET`    | `/suppliers/{id}/payments`              | `sup.payments.view`         | Supplier's payment history|
| `GET`    | `/suppliers/{id}/balance`               | `sup.suppliers.view`        | Supplier balance summary |
| `GET`    | `/suppliers/{id}/contracts`             | `sup.contracts.view`        | Supplier's contracts     |
| `POST`   | `/suppliers/{id}/contracts`             | `sup.contracts.create`      | Add contract             |
| `PUT`    | `/suppliers/{id}/contracts/{cid}`       | `sup.contracts.update`      | Update contract          |
| `GET`    | `/suppliers/{id}/price-list`            | `sup.price_lists.view`      | Supplier's price list    |
| `POST`   | `/suppliers/{id}/price-list`            | `sup.price_lists.create`    | Add/update prices        |
| `GET`    | `/suppliers/{id}/statement`             | `sup.statements.view`       | Account statement        |

---

## 4. Supplier Statement (كشف حساب المورد)

```
┌─────────────────────────────────────────────────────────────┐
│  كشف حساب المورد: شركة الأمل للتوريدات                      │
│  الفترة: 01/07/2026 - 31/07/2026                            │
├──────────┬──────────────────┬──────────┬──────────┬──────────┤
│ التاريخ  │ البيان            │ مدين     │ دائن     │ الرصيد   │
├──────────┼──────────────────┼──────────┼──────────┼──────────┤
│ 01/07    │ رصيد أول المدة    │          │          │ 5,000.00 │
│ 05/07    │ استلام PO-2026-07-001 │ 3,500.00│       │ 8,500.00 │
│ 10/07    │ دفعة نقدية        │          │ 4,000.00 │ 4,500.00 │
│ 15/07    │ استلام PO-2026-07-002 │ 2,200.00│       │ 6,700.00 │
│ 18/07    │ مرتجع PR-2026-07-001 │        │   500.00 │ 6,200.00 │
│ 25/07    │ تحويل بنكي        │          │ 3,000.00 │ 3,200.00 │
├──────────┼──────────────────┼──────────┼──────────┼──────────┤
│          │ الإجمالي          │ 5,700.00 │ 7,500.00 │ 3,200.00 │
└──────────┴──────────────────┴──────────┴──────────┴──────────┘
```

---

## 5. Permissions

```
sup.suppliers.view
sup.suppliers.create
sup.suppliers.update
sup.suppliers.delete
sup.suppliers.export

sup.contracts.view
sup.contracts.create
sup.contracts.update
sup.contracts.delete

sup.price_lists.view
sup.price_lists.create
sup.price_lists.update

sup.payments.view
sup.statements.view

sup.reports.view
sup.reports.export
```

---

## 6. Reports

| Report                    | Description                                    |
| ------------------------- | ---------------------------------------------- |
| Supplier Directory        | All suppliers with contact info                |
| Supplier Balance Report   | Outstanding balances per supplier              |
| Supplier Aging Report     | Payable aging (30/60/90+ days)                 |
| Supplier Purchase Summary | Purchases per supplier in a period             |
| Contract Expiry Report    | Contracts expiring within configurable period  |
| Price Comparison          | Same item prices across multiple suppliers     |
| Supplier Performance      | Delivery timeliness, quality acceptance rate   |
| Top Suppliers             | Ranked by purchase volume                      |
