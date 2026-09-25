# Module: POS (نقطة البيع)

> Point of Sale: order entry, payment processing, receipts, sessions, and cash drawer management.

---

## 1. Module Overview

| Property         | Value                                         |
| ---------------- | --------------------------------------------- |
| **Module Code**  | `pos`                                         |
| **API Prefix**   | `/api/v1/pos`                                 |
| **Branch Scoped**| Yes                                           |
| **Depends On**   | Inventory, Customers, Accounting, Settings    |
| **Depended By**  | Reports, Accounting (sales revenue entries)   |

---

## 2. Entities

### 2.1 Menu Categories (تصنيفات القائمة)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `name_ar`          | VARCHAR(255)    | Yes      | Category name in Arabic            |
| `name_en`          | VARCHAR(255)    | Yes      | Category name in English           |
| `code`             | VARCHAR(20)     | Yes      | Category code (unique per branch)  |
| `parent_id`        | FK → self       | No       | Parent category                    |
| `image_path`       | VARCHAR(500)    | No       | Category image                     |
| `color`            | VARCHAR(7)      | No       | Display color (hex)                |
| `icon`             | VARCHAR(50)     | No       | Icon identifier                    |
| `is_active`        | BOOLEAN         | Yes      | Active/inactive                    |
| `sort_order`       | INT             | Yes      | Display order on POS screen        |
| `display_on_pos`   | BOOLEAN         | Yes      | Show on POS terminal               |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`       | TIMESTAMP       | No       | Soft delete                        |

**Default Restaurant Menu Categories:**
- وجبات رئيسية (Main Dishes)
- مقبلات (Appetizers)
- سلطات (Salads)
- مشويات (Grills)
- مشروبات ساخنة (Hot Drinks)
- مشروبات باردة (Cold Drinks)
- حلويات (Desserts)
- وجبات أطفال (Kids Meals)
- عروض (Offers/Combos)

### 2.2 Menu Items (أصناف القائمة)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `category_id`      | FK → menu_categories | Yes | Menu category                     |
| `sku`              | VARCHAR(50)     | Yes      | Unique item code (per branch)      |
| `barcode`          | VARCHAR(50)     | No       | Barcode                            |
| `name_ar`          | VARCHAR(255)    | Yes      | Item name in Arabic                |
| `name_en`          | VARCHAR(255)    | Yes      | Item name in English               |
| `description_ar`   | TEXT            | No       | Description in Arabic              |
| `description_en`   | TEXT            | No       | Description in English             |
| `price`            | BIGINT          | Yes      | Selling price (piasters)           |
| `cost_price`       | BIGINT          | No       | Estimated cost (piasters)          |
| `tax_rate`         | DECIMAL(5,2)    | Yes      | Tax percentage (e.g., 14.00)       |
| `tax_inclusive`     | BOOLEAN         | Yes      | Price includes tax                 |
| `image_path`       | VARCHAR(500)    | No       | Item image                         |
| `is_active`        | BOOLEAN         | Yes      | Active/inactive                    |
| `is_available`     | BOOLEAN         | Yes      | Currently available (86'd = false) |
| `sort_order`       | INT             | Yes      | Display order in category          |
| `display_on_pos`   | BOOLEAN         | Yes      | Show on POS terminal               |
| `has_variants`     | BOOLEAN         | Yes      | Has size/variant options           |
| `has_modifiers`    | BOOLEAN         | Yes      | Has add-on modifiers               |
| `preparation_time` | INT             | No       | Estimated prep time (minutes)      |
| `calories`         | INT             | No       | Calorie count                      |
| `notes`            | TEXT            | No       | Internal notes                     |
| `created_by`       | FK → users      | No       | Audit                              |
| `updated_by`       | FK → users      | No       | Audit                              |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`       | TIMESTAMP       | No       | Soft delete                        |

**Business Rules:**
- `price` in piasters (integer). Display as EGP at presentation layer.
- `is_available` is a quick toggle for items that are temporarily out of stock ("86'd").
- `tax_inclusive`: if true, `price` already includes tax; system extracts tax. If false, tax added on top.
- Items can exist without inventory linkage (e.g., prepared dishes).
- `cost_price` can be manually set or calculated from recipe ingredients.

### 2.3 Menu Item Variants (أحجام / متغيرات)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `menu_item_id`     | FK → menu_items | Yes      | Parent item                        |
| `name_ar`          | VARCHAR(100)    | Yes      | Variant name Arabic (e.g., كبير)   |
| `name_en`          | VARCHAR(100)    | Yes      | Variant name English (e.g., Large) |
| `price`            | BIGINT          | Yes      | Variant price (piasters)           |
| `sku`              | VARCHAR(50)     | No       | Variant-specific SKU               |
| `is_active`        | BOOLEAN         | Yes      | Active/inactive                    |
| `sort_order`       | INT             | Yes      | Display order                      |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

**Example:** Pepsi: Small (15 EGP), Medium (20 EGP), Large (25 EGP).

### 2.4 Menu Item Modifiers (إضافات)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `group_name_ar`    | VARCHAR(100)    | Yes      | Group name Arabic (e.g., الإضافات) |
| `group_name_en`    | VARCHAR(100)    | Yes      | Group name English (e.g., Add-ons) |
| `name_ar`          | VARCHAR(100)    | Yes      | Modifier name Arabic               |
| `name_en`          | VARCHAR(100)    | Yes      | Modifier name English              |
| `price`            | BIGINT          | Yes      | Additional price (piasters, 0 if free) |
| `is_active`        | BOOLEAN         | Yes      | Active/inactive                    |
| `sort_order`       | INT             | Yes      | Display order                      |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

**Pivot table:** `menu_item_modifier` links items to applicable modifiers.

**Examples:**
- Extras group: Extra cheese (+10 EGP), Extra sauce (+5 EGP)
- Preparation: Well done (0), Medium (0), Rare (0)
- Remove: No onions (0), No pickles (0)

### 2.5 POS Sessions (جلسات البيع)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `reference`        | VARCHAR(30)     | Yes      | Auto-generated (SES-2026-07-22-001)|
| `cashier_id`       | FK → users      | Yes      | Cashier user                       |
| `terminal_name`    | VARCHAR(50)     | No       | POS terminal identifier            |
| `opening_time`     | TIMESTAMP       | Yes      | Session start time                 |
| `closing_time`     | TIMESTAMP       | No       | Session end time                   |
| `opening_cash`     | BIGINT          | Yes      | Opening cash in drawer (piasters)  |
| `closing_cash`     | BIGINT          | No       | Actual cash at closing (piasters)  |
| `expected_cash`    | BIGINT          | No       | System-calculated expected cash    |
| `cash_difference`  | BIGINT          | No       | Actual - Expected (piasters)       |
| `total_sales`      | BIGINT          | Yes      | Total sales in session (piasters)  |
| `total_orders`     | INT             | Yes      | Number of orders                   |
| `total_cash_sales` | BIGINT          | Yes      | Cash sales total (piasters)        |
| `total_card_sales` | BIGINT          | Yes      | Card/electronic sales (piasters)   |
| `total_discounts`  | BIGINT          | Yes      | Total discounts given (piasters)   |
| `total_refunds`    | BIGINT          | Yes      | Total refunds/voids (piasters)     |
| `total_tax`        | BIGINT          | Yes      | Total tax collected (piasters)     |
| `status`           | VARCHAR(20)     | Yes      | open/closed                        |
| `closing_notes`    | TEXT            | No       | Notes at session close             |
| `closed_by`        | FK → users      | No       | Who closed (may differ from cashier)|
| `journal_entry_id` | FK → journal_entries | No  | Linked accounting entry            |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

**Business Rules:**
- A cashier must open a session before creating orders.
- Only one open session per cashier at a time.
- Opening cash is the amount counted in the drawer at session start.
- At closing, cashier counts actual cash → system calculates expected → records difference.
- Cash difference (shortage/overage) logged and tracked.
- Session closing creates a journal entry for the day's sales.
- Manager can close another cashier's session (with override permission).

### 2.6 POS Orders (طلبات البيع)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `session_id`       | FK → pos_sessions | Yes   | POS session                        |
| `order_number`     | VARCHAR(20)     | Yes      | Display order number (daily reset) |
| `reference`        | VARCHAR(30)     | Yes      | Unique reference (ORD-20260722-001)|
| `order_type`       | VARCHAR(20)     | Yes      | dine_in/takeaway/delivery          |
| `table_number`     | VARCHAR(20)     | No       | Table number (for dine-in)         |
| `customer_id`      | FK → customers  | No       | Customer (optional)                |
| `customer_name`    | VARCHAR(255)    | No       | Quick customer name (if no profile)|
| `subtotal`         | BIGINT          | Yes      | Sum of items before discount/tax   |
| `discount_type`    | VARCHAR(10)     | No       | percentage / fixed                 |
| `discount_value`   | BIGINT          | No       | Discount amount/percentage         |
| `discount_amount`  | BIGINT          | Yes      | Calculated discount (piasters)     |
| `discount_reason`  | VARCHAR(255)    | No       | Reason for discount                |
| `tax_amount`       | BIGINT          | Yes      | Total tax (piasters)               |
| `total_amount`     | BIGINT          | Yes      | Grand total (piasters)             |
| `paid_amount`      | BIGINT          | Yes      | Amount paid (piasters)             |
| `change_amount`    | BIGINT          | Yes      | Change given (piasters)            |
| `status`           | VARCHAR(20)     | Yes      | active/completed/voided/held       |
| `payment_status`   | VARCHAR(20)     | Yes      | unpaid/paid/partial                |
| `void_reason`      | TEXT            | No       | Reason for voiding                 |
| `voided_by`        | FK → users      | No       | Who voided                         |
| `voided_at`        | TIMESTAMP       | No       | Void timestamp                     |
| `notes`            | TEXT            | No       | Order notes                        |
| `created_by`       | FK → users      | Yes      | Cashier who created                |
| `created_at`       | TIMESTAMP       | Auto     | Order timestamp                    |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

**Business Rules:**
- `order_number` resets daily (1, 2, 3...) for easy verbal reference.
- `reference` is globally unique: `ORD-{YYYYMMDD}-{sequence}`.
- `total_amount = subtotal - discount_amount + tax_amount`.
- `change_amount = paid_amount - total_amount` (for cash payments).
- Status transitions:
  - `active` → `completed` (payment received)
  - `active` → `held` (parked for later)
  - `active` → `voided` (cancelled before completion)
  - `completed` → `voided` (requires manager permission + reason)
  - `held` → `active` (resumed) → `completed` / `voided`
- Voiding a completed order creates a reversal journal entry.
- Discounts above a configurable threshold require manager authorization.
- Linked customer earns loyalty points on `completed` orders.

### 2.7 POS Order Items (بنود الطلب)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `order_id`         | FK → pos_orders | Yes      | Parent order                       |
| `menu_item_id`     | FK → menu_items | Yes      | Menu item                          |
| `variant_id`       | FK → variants   | No       | Selected variant (if applicable)   |
| `item_name_ar`     | VARCHAR(255)    | Yes      | Item name snapshot (Arabic)        |
| `item_name_en`     | VARCHAR(255)    | Yes      | Item name snapshot (English)       |
| `quantity`         | INT             | Yes      | Quantity ordered                   |
| `unit_price`       | BIGINT          | Yes      | Price per unit at time of order    |
| `discount_amount`  | BIGINT          | Yes      | Line discount (piasters)           |
| `tax_rate`         | DECIMAL(5,2)    | Yes      | Tax rate at time of order          |
| `tax_amount`       | BIGINT          | Yes      | Line tax (piasters)                |
| `total_amount`     | BIGINT          | Yes      | Line total (piasters)              |
| `modifiers`        | JSON            | No       | Selected modifiers with prices     |
| `modifiers_total`  | BIGINT          | Yes      | Total modifier cost (piasters)     |
| `special_request`  | VARCHAR(500)    | No       | Special preparation instructions   |
| `is_void`          | BOOLEAN         | Yes      | Individual item voided             |
| `void_reason`      | VARCHAR(255)    | No       | Void reason                        |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |

**Business Rules:**
- `item_name_ar/en` and `unit_price` are **snapshots** — preserved even if menu item changes later.
- `total_amount = (unit_price + modifiers_total) × quantity - discount_amount + tax_amount`.
- `modifiers` stored as JSON: `[{"id": 1, "name_ar": "جبنة إضافية", "price": 1000}]`.
- Individual items can be voided without voiding the entire order.

### 2.8 POS Payments (مدفوعات الطلب)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `order_id`         | FK → pos_orders | Yes      | Parent order                       |
| `payment_method`   | VARCHAR(20)     | Yes      | cash/card/loyalty/split            |
| `amount`           | BIGINT          | Yes      | Payment amount (piasters)          |
| `reference`        | VARCHAR(50)     | No       | Card/transaction reference         |
| `loyalty_points_used` | INT          | No       | Loyalty points redeemed            |
| `created_at`       | TIMESTAMP       | Auto     | Payment timestamp                  |

**Business Rules:**
- An order can have multiple payments (split payment).
- `sum(payments.amount) >= order.total_amount` to mark as `paid`.
- Loyalty points redemption counts as a payment method.
- Cash payment calculates change: `paid_amount - total_amount`.

### 2.9 Cash Drawer Operations (عمليات درج النقدية)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `session_id`       | FK → pos_sessions | Yes   | POS session                        |
| `type`             | VARCHAR(20)     | Yes      | cash_in/cash_out/float             |
| `amount`           | BIGINT          | Yes      | Amount (piasters)                  |
| `reason`           | VARCHAR(255)    | Yes      | Reason for operation               |
| `created_by`       | FK → users      | Yes      | Who performed                      |
| `created_at`       | TIMESTAMP       | Auto     | Timestamp                          |

**Business Rules:**
- `cash_in`: Adding cash to drawer (e.g., float, change replenishment).
- `cash_out`: Removing cash (e.g., expense payment, bank deposit).
- `float`: Initial cash balance (same as opening_cash on session).
- All operations factor into `expected_cash` calculation at session close.

---

## 3. Tax Calculation

### 3.1 Tax-Inclusive Price

```
If tax_inclusive = true:
  tax_amount = price - (price / (1 + tax_rate/100))
  net_price = price - tax_amount

Example: Item price 114 EGP (14% VAT inclusive)
  tax = 11400 - (11400 / 1.14) = 11400 - 10000 = 1400 piasters (14 EGP)
  net = 10000 piasters (100 EGP)
```

### 3.2 Tax-Exclusive Price

```
If tax_inclusive = false:
  tax_amount = price × (tax_rate / 100)
  total = price + tax_amount

Example: Item price 100 EGP (14% VAT exclusive)
  tax = 10000 × 0.14 = 1400 piasters (14 EGP)
  total = 10000 + 1400 = 11400 piasters (114 EGP)
```

---

## 4. API Endpoints

### 4.1 Menu Management

| Method   | Endpoint                              | Permission                  | Description              |
| -------- | ------------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/pos/menu/categories`                | `pos.menu.view`             | List menu categories     |
| `POST`   | `/pos/menu/categories`                | `pos.menu.manage`           | Create category          |
| `PUT`    | `/pos/menu/categories/{id}`           | `pos.menu.manage`           | Update category          |
| `DELETE` | `/pos/menu/categories/{id}`           | `pos.menu.manage`           | Delete category          |
| `GET`    | `/pos/menu/items`                     | `pos.menu.view`             | List menu items          |
| `POST`   | `/pos/menu/items`                     | `pos.menu.manage`           | Create item              |
| `GET`    | `/pos/menu/items/{id}`                | `pos.menu.view`             | Get item details         |
| `PUT`    | `/pos/menu/items/{id}`                | `pos.menu.manage`           | Update item              |
| `PATCH`  | `/pos/menu/items/{id}/availability`   | `pos.menu.manage`           | Toggle availability      |
| `DELETE` | `/pos/menu/items/{id}`                | `pos.menu.manage`           | Delete item              |

### 4.2 POS Terminal (Optimized for Speed)

| Method   | Endpoint                              | Permission                  | Description              |
| -------- | ------------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/pos/terminal/menu`                  | `pos.orders.create`         | Full menu for POS screen |
| `POST`   | `/pos/sessions/open`                  | `pos.sessions.open`         | Open new session         |
| `POST`   | `/pos/sessions/{id}/close`            | `pos.sessions.close`        | Close session            |
| `GET`    | `/pos/sessions/current`               | `pos.sessions.view`         | Get current open session |
| `POST`   | `/pos/orders`                         | `pos.orders.create`         | Create order             |
| `PUT`    | `/pos/orders/{id}`                    | `pos.orders.create`         | Update active order      |
| `POST`   | `/pos/orders/{id}/complete`           | `pos.orders.create`         | Complete & pay order     |
| `POST`   | `/pos/orders/{id}/hold`               | `pos.orders.create`         | Hold/park order          |
| `POST`   | `/pos/orders/{id}/resume`             | `pos.orders.create`         | Resume held order        |
| `POST`   | `/pos/orders/{id}/void`               | `pos.orders.void`           | Void order               |
| `GET`    | `/pos/orders/held`                    | `pos.orders.view`           | List held orders         |
| `POST`   | `/pos/cash-drawer/operation`          | `pos.cash_drawer.manage`    | Cash in/out operation    |
| `GET`    | `/pos/cash-drawer/balance`            | `pos.cash_drawer.view`      | Current drawer balance   |

### 4.3 Order History

| Method   | Endpoint                              | Permission                  | Description              |
| -------- | ------------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/pos/orders`                         | `pos.orders.view`           | List orders (paginated)  |
| `GET`    | `/pos/orders/{id}`                    | `pos.orders.view`           | Get order details        |
| `GET`    | `/pos/orders/{id}/receipt`            | `pos.orders.view`           | Get receipt data         |
| `GET`    | `/pos/sessions`                       | `pos.sessions.view`         | List sessions            |
| `GET`    | `/pos/sessions/{id}`                  | `pos.sessions.view`         | Get session details      |
| `GET`    | `/pos/sessions/{id}/report`           | `pos.sessions.view`         | Session summary report   |

---

## 5. Receipt Format

```
┌────────────────────────────────┐
│         مطعم ربحة              │
│    القاهرة - شارع التحرير      │
│      تليفون: 02-12345678      │
├────────────────────────────────┤
│  فاتورة رقم: ORD-20260722-015 │
│  التاريخ: 22/07/2026  14:35   │
│  الكاشير: أحمد                │
│  نوع الطلب: محلي              │
│  الطاولة: 5                   │
├────────────────────────────────┤
│  الصنف           الكمية  السعر │
│  ─────────────── ────── ───── │
│  برجر كلاسيك        2  120.00│
│    + جبنة إضافية        20.00│
│  بطاطس كبير          1   35.00│
│  بيبسي كبير          2   50.00│
├────────────────────────────────┤
│  المجموع:              225.00 │
│  الخصم (10%):          (22.50)│
│  بعد الخصم:            202.50 │
│  ضريبة (14%):           28.35 │
│  ────────────────────────────  │
│  الإجمالي:             230.85 │
│  ────────────────────────────  │
│  المدفوع (نقدي):       250.00 │
│  الباقي:                19.15 │
├────────────────────────────────┤
│  نقاط الولاء المكتسبة: 23     │
│  رصيد النقاط: 156             │
├────────────────────────────────┤
│       شكراً لزيارتكم!          │
│    نتمنى لكم وجبة شهية        │
│                                │
│  [الرقم الضريبي: 123-456-789] │
└────────────────────────────────┘
```

---

## 6. POS Session Closing Report

```
┌─────────────────────────────────────────────────────┐
│  تقرير إغلاق الجلسة                                 │
│  الجلسة: SES-2026-07-22-001                         │
│  الكاشير: أحمد محمد                                  │
│  الفترة: 08:00 - 16:00                              │
├─────────────────────────────────────────────────────┤
│  ملخص المبيعات                                       │
│  ──────────────                                      │
│  عدد الطلبات:                    45                  │
│  إجمالي المبيعات:            8,500.00 ج.م            │
│  إجمالي الخصومات:             (350.00) ج.م           │
│  إجمالي الضريبة:             1,141.00 ج.م            │
│  صافي المبيعات:              9,291.00 ج.م            │
│  الطلبات الملغية:                  2                  │
│  قيمة الملغي:                 (180.00) ج.م           │
├─────────────────────────────────────────────────────┤
│  تحصيلات حسب طريقة الدفع                             │
│  ────────────────────────                            │
│  نقدي:                       6,291.00 ج.م            │
│  بطاقة:                      2,800.00 ج.م            │
│  نقاط ولاء:                    200.00 ج.م            │
├─────────────────────────────────────────────────────┤
│  حركة الصندوق                                        │
│  ───────────                                         │
│  رصيد الافتتاح:              1,000.00 ج.م            │
│  + مبيعات نقدية:             6,291.00 ج.م            │
│  + إضافة نقدية:                    0.00              │
│  - سحب نقدية:                (500.00) ج.م            │
│  ──────────────                                      │
│  المتوقع بالصندوق:           6,791.00 ج.م            │
│  الفعلي بالصندوق:            6,785.00 ج.م            │
│  الفرق:                         (6.00) ج.م (عجز)    │
└─────────────────────────────────────────────────────┘
```

---

## 7. Accounting Integration

### 7.1 Order Completed (Per Session Close)

| Account              | Debit              | Credit             |
| -------------------- | ------------------ | ------------------ |
| Cash on Hand         | Cash Sales Amount  |                    |
| Bank / Card Receivable | Card Sales Amount |                    |
| Loyalty Liability    | Points Redeemed    |                    |
|                      |                    | Sales Revenue      |
|                      |                    | Tax Payable        |
| Sales Discounts      | Discount Amount    |                    |

### 7.2 Order Voided (After Completion)

Reversal of the original entry.

### 7.3 Cash Drawer Shortage/Overage

| Account              | Debit              | Credit             |
| -------------------- | ------------------ | ------------------ |
| Cash Shortage Expense| Shortage Amount    |                    |
| Cash on Hand         |                    | Shortage Amount    |

---

## 8. Performance Requirements

| Operation            | Target Response Time |
| -------------------- | -------------------- |
| Load menu            | < 300ms              |
| Create order         | < 500ms              |
| Add item to order    | < 100ms (client-side)|
| Complete & pay       | < 500ms              |
| Search customer      | < 200ms              |
| Print receipt        | < 1s                 |

---

## 9. Permissions

```
pos.menu.view
pos.menu.manage

pos.orders.view
pos.orders.create
pos.orders.void
pos.orders.apply_discount
pos.orders.export

pos.sessions.view
pos.sessions.open
pos.sessions.close
pos.sessions.close_others

pos.cash_drawer.view
pos.cash_drawer.manage

pos.reports.view
pos.reports.export
```
