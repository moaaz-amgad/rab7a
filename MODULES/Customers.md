# Module: Customers (العملاء)

> Customer profiles, loyalty program, and customer history management.

---

## 1. Module Overview

| Property         | Value                                         |
| ---------------- | --------------------------------------------- |
| **Module Code**  | `cust`                                        |
| **API Prefix**   | `/api/v1/customers`                           |
| **Branch Scoped**| Yes                                           |
| **Depends On**   | Settings (branches)                           |
| **Depended By**  | POS (customer assignment on orders)           |

---

## 2. Entities

### 2.1 Customers (العملاء)

| Field                | Type            | Required | Description                        |
| -------------------- | --------------- | -------- | ---------------------------------- |
| `id`                 | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`          | FK → branches   | Yes      | Branch scope                       |
| `code`               | VARCHAR(20)     | Yes      | Customer code (auto, unique/branch)|
| `name_ar`            | VARCHAR(255)    | Yes      | Customer name in Arabic            |
| `name_en`            | VARCHAR(255)    | No       | Customer name in English           |
| `phone`              | VARCHAR(20)     | Yes      | Primary phone (unique per branch)  |
| `phone_secondary`    | VARCHAR(20)     | No       | Secondary phone                    |
| `email`              | VARCHAR(255)    | No       | Email address                      |
| `address`            | TEXT            | No       | Address                            |
| `date_of_birth`      | DATE            | No       | Date of birth                      |
| `gender`             | VARCHAR(10)     | No       | male / female                      |
| `customer_type`      | VARCHAR(20)     | Yes      | individual / corporate             |
| `company_name`       | VARCHAR(255)    | No       | Company name (if corporate)        |
| `tax_registration`   | VARCHAR(50)     | No       | Tax reg number (if corporate)      |
| `loyalty_points`     | INT             | Yes      | Current loyalty points balance     |
| `total_spent`        | BIGINT          | Yes      | Lifetime spending (piasters)       |
| `total_orders`       | INT             | Yes      | Lifetime order count               |
| `last_order_date`    | TIMESTAMP       | No       | Date of last order                 |
| `is_active`          | BOOLEAN         | Yes      | Active/inactive                    |
| `notes`              | TEXT            | No       | Internal notes                     |
| `created_by`         | FK → users      | No       | Audit                              |
| `updated_by`         | FK → users      | No       | Audit                              |
| `created_at`         | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`         | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`         | TIMESTAMP       | No       | Soft delete                        |

**Business Rules:**
- Customer code auto-generated: `CUST-{4-digit sequence}` per branch.
- Phone number unique per branch — used as primary identifier.
- `loyalty_points`, `total_spent`, `total_orders` updated automatically from POS orders.
- `total_spent` stored in piasters (integer).
- Quick customer creation from POS with just name + phone.

### 2.2 Customer Groups (مجموعات العملاء)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `name_ar`          | VARCHAR(255)    | Yes      | Group name in Arabic               |
| `name_en`          | VARCHAR(255)    | Yes      | Group name in English              |
| `discount_percentage` | DECIMAL(5,2) | No       | Default discount for group members |
| `description`      | TEXT            | No       | Description                        |
| `is_active`        | BOOLEAN         | Yes      | Active/inactive                    |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`       | TIMESTAMP       | No       | Soft delete                        |

### 2.3 Loyalty Settings (إعدادات الولاء)

Configurable per branch in settings:

| Setting                    | Type       | Default | Description                      |
| -------------------------- | ---------- | ------- | -------------------------------- |
| `loyalty_enabled`          | BOOLEAN    | true    | Enable/disable loyalty program   |
| `points_per_egp`           | INT        | 1       | Points earned per 1 EGP spent    |
| `point_value_piasters`     | INT        | 10      | Value of 1 point in piasters     |
| `min_redeem_points`        | INT        | 100     | Minimum points to redeem         |
| `max_redeem_percentage`    | INT        | 50      | Max % of order payable by points |
| `points_expiry_months`     | INT        | 12      | Points expire after N months     |

### 2.4 Loyalty Transactions (حركات نقاط الولاء)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `customer_id`      | FK → customers  | Yes      | Customer                           |
| `type`             | VARCHAR(20)     | Yes      | earn / redeem / expire / adjust    |
| `points`           | INT             | Yes      | Points (positive=add, negative=subtract) |
| `balance_after`    | INT             | Yes      | Points balance after transaction   |
| `reference_type`   | VARCHAR(50)     | No       | Source (PosOrder, manual, etc.)    |
| `reference_id`     | BIGINT          | No       | Source record ID                   |
| `description`      | VARCHAR(255)    | No       | Transaction description            |
| `created_by`       | FK → users      | No       | Who created                        |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |

**Business Rules:**
- Loyalty transactions are **immutable** — corrections via new `adjust` transactions.
- Points earned on order completion, reversed if order is voided.
- Points redeemed reduce the order total (recorded as a payment method).
- Expired points processed by a scheduled job (monthly).

---

## 3. API Endpoints

| Method   | Endpoint                              | Permission                  | Description              |
| -------- | ------------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/customers`                          | `cust.customers.view`       | List customers           |
| `POST`   | `/customers`                          | `cust.customers.create`     | Create customer          |
| `GET`    | `/customers/{id}`                     | `cust.customers.view`       | Get customer details     |
| `PUT`    | `/customers/{id}`                     | `cust.customers.update`     | Update customer          |
| `DELETE` | `/customers/{id}`                     | `cust.customers.delete`     | Soft delete customer     |
| `GET`    | `/customers/{id}/orders`              | `cust.customers.view`       | Customer's order history |
| `GET`    | `/customers/{id}/loyalty`             | `cust.loyalty.view`         | Loyalty points history   |
| `POST`   | `/customers/{id}/loyalty/adjust`      | `cust.loyalty.adjust`       | Manual points adjustment |
| `GET`    | `/customers/search`                   | `cust.customers.view`       | Quick search (phone/name)|
| `GET`    | `/customers/groups`                   | `cust.groups.view`          | List customer groups     |
| `POST`   | `/customers/groups`                   | `cust.groups.create`        | Create group             |
| `PUT`    | `/customers/groups/{id}`              | `cust.groups.update`        | Update group             |

---

## 4. Permissions

```
cust.customers.view
cust.customers.create
cust.customers.update
cust.customers.delete
cust.customers.export

cust.groups.view
cust.groups.create
cust.groups.update
cust.groups.delete

cust.loyalty.view
cust.loyalty.adjust

cust.reports.view
cust.reports.export
```

---

## 5. Reports

| Report                    | Description                                    |
| ------------------------- | ---------------------------------------------- |
| Customer Directory        | All customers with contact info and stats      |
| Top Customers             | Ranked by total spending or order count        |
| Customer Spending Report  | Spending per customer in a period              |
| Loyalty Points Report     | Points earned/redeemed/expired per customer    |
| Customer Frequency        | Visit frequency analysis                       |
| Inactive Customers        | Customers with no orders in N days             |
| New Customers Report      | Customers registered in a period               |
| Customer Group Report     | Summary per customer group                     |
