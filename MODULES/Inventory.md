# Module: Inventory (المخزون)

> Stock tracking, item management, categories, stock movements, physical counts, and alerts.

---

## 1. Module Overview

| Property         | Value                                         |
| ---------------- | --------------------------------------------- |
| **Module Code**  | `inv`                                         |
| **API Prefix**   | `/api/v1/inventory`                           |
| **Branch Scoped**| Yes                                           |
| **Depends On**   | Settings (units, branches)                    |
| **Depended By**  | Purchases (receiving), POS (stock deduction), Accounting |

---

## 2. Entities

### 2.1 Item Categories (تصنيفات الأصناف)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `name_ar`          | VARCHAR(255)    | Yes      | Category name in Arabic            |
| `name_en`          | VARCHAR(255)    | Yes      | Category name in English           |
| `code`             | VARCHAR(20)     | Yes      | Category code (unique per branch)  |
| `parent_id`        | FK → self       | No       | Parent category (hierarchy)        |
| `description`      | TEXT            | No       | Description                        |
| `is_active`        | BOOLEAN         | Yes      | Active/inactive                    |
| `sort_order`       | INT             | Yes      | Display order                      |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`       | TIMESTAMP       | No       | Soft delete                        |

**Default Categories (Restaurant):**
- مواد خام (Raw Materials) — meat, vegetables, dairy, grains
- مشروبات (Beverages) — soft drinks, juices, water
- مواد تغليف (Packaging) — boxes, bags, cups, napkins
- مواد تنظيف (Cleaning Supplies) — detergents, sanitizers
- معدات صغيرة (Small Equipment) — utensils, trays

### 2.2 Units of Measurement (وحدات القياس)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `name_ar`          | VARCHAR(100)    | Yes      | Unit name in Arabic                |
| `name_en`          | VARCHAR(100)    | Yes      | Unit name in English               |
| `abbreviation_ar`  | VARCHAR(10)     | Yes      | Short form Arabic                  |
| `abbreviation_en`  | VARCHAR(10)     | Yes      | Short form English                 |
| `is_active`        | BOOLEAN         | Yes      | Active/inactive                    |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

**Default Units:**
- كيلوجرام / Kilogram (كجم / kg)
- جرام / Gram (جم / g)
- لتر / Liter (لتر / L)
- مللي لتر / Milliliter (مل / mL)
- قطعة / Piece (قطعة / pc)
- صندوق / Box (صندوق / box)
- كرتونة / Carton (كرتونة / ctn)
- كيس / Bag (كيس / bag)
- علبة / Can/Tin (علبة / can)

### 2.3 Unit Conversions (تحويلات الوحدات)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `from_unit_id`     | FK → units      | Yes      | Source unit                        |
| `to_unit_id`       | FK → units      | Yes      | Target unit                        |
| `conversion_factor`| DECIMAL(15,6)   | Yes      | Multiply by this to convert        |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |

**Examples:**
- 1 kg = 1000 g (factor: 1000)
- 1 L = 1000 mL (factor: 1000)
- 1 carton = 24 pieces (factor: 24, item-specific)

### 2.4 Inventory Items (أصناف المخزون)

| Field                | Type            | Required | Description                        |
| -------------------- | --------------- | -------- | ---------------------------------- |
| `id`                 | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`          | FK → branches   | Yes      | Branch scope                       |
| `category_id`        | FK → categories | Yes      | Item category                      |
| `sku`                | VARCHAR(50)     | Yes      | Stock Keeping Unit (unique/branch) |
| `barcode`            | VARCHAR(50)     | No       | Barcode (EAN/UPC)                  |
| `name_ar`            | VARCHAR(255)    | Yes      | Item name in Arabic                |
| `name_en`            | VARCHAR(255)    | Yes      | Item name in English               |
| `description`        | TEXT            | No       | Description                        |
| `primary_unit_id`    | FK → units      | Yes      | Primary unit of measure            |
| `purchase_unit_id`   | FK → units      | No       | Unit used for purchasing           |
| `purchase_conversion`| DECIMAL(15,6)   | No       | Purchase unit to primary unit factor|
| `current_stock`      | DECIMAL(15,3)   | Yes      | Current quantity in stock          |
| `minimum_stock`      | DECIMAL(15,3)   | Yes      | Reorder level (alert threshold)    |
| `maximum_stock`      | DECIMAL(15,3)   | No       | Maximum stock level                |
| `reorder_quantity`   | DECIMAL(15,3)   | No       | Suggested reorder quantity         |
| `cost_price`         | BIGINT          | Yes      | Latest purchase cost (piasters/primary unit) |
| `average_cost`       | BIGINT          | Yes      | Weighted average cost (piasters)   |
| `default_supplier_id`| FK → suppliers  | No       | Preferred supplier                 |
| `storage_location`   | VARCHAR(100)    | No       | Physical storage location          |
| `is_perishable`      | BOOLEAN         | Yes      | Perishable item flag               |
| `expiry_tracking`    | BOOLEAN         | Yes      | Track expiry dates                 |
| `is_active`          | BOOLEAN         | Yes      | Active/inactive                    |
| `image_path`         | VARCHAR(500)    | No       | Item image                         |
| `notes`              | TEXT            | No       | Notes                              |
| `created_by`         | FK → users      | No       | Audit                              |
| `updated_by`         | FK → users      | No       | Audit                              |
| `created_at`         | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`         | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`         | TIMESTAMP       | No       | Soft delete                        |

**Business Rules:**
- SKU auto-generated or manually entered, unique per branch.
- `current_stock` updated ONLY through stock movements — never directly edited.
- `cost_price` updated on each purchase receiving.
- `average_cost` calculated using weighted average method:
  ```
  new_avg = ((current_stock × current_avg) + (received_qty × received_cost)) / (current_stock + received_qty)
  ```
- All cost values in piasters (integer).
- When `current_stock < minimum_stock`, generate a low-stock alert.
- Purchase unit conversion example: buy in cartons (24 pieces), store in pieces.

### 2.5 Stock Movements (حركات المخزون)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `item_id`          | FK → items      | Yes      | Inventory item                     |
| `movement_type`    | VARCHAR(30)     | Yes      | Type of movement (see below)       |
| `direction`        | VARCHAR(3)      | Yes      | in / out                           |
| `quantity`         | DECIMAL(15,3)   | Yes      | Quantity moved                     |
| `unit_cost`        | BIGINT          | Yes      | Cost per unit at time of movement  |
| `total_cost`       | BIGINT          | Yes      | Total cost (qty × unit_cost)       |
| `stock_before`     | DECIMAL(15,3)   | Yes      | Stock level before movement        |
| `stock_after`      | DECIMAL(15,3)   | Yes      | Stock level after movement         |
| `reference_type`   | VARCHAR(50)     | No       | Source model (PurchaseOrder, PosOrder, etc.) |
| `reference_id`     | BIGINT          | No       | Source record ID                   |
| `batch_number`     | VARCHAR(50)     | No       | Batch/lot number                   |
| `expiry_date`      | DATE            | No       | Expiry date (if perishable)        |
| `reason`           | VARCHAR(255)    | No       | Reason for movement                |
| `notes`            | TEXT            | No       | Additional notes                   |
| `created_by`       | FK → users      | Yes      | Who performed                      |
| `created_at`       | TIMESTAMP       | Auto     | Movement timestamp                 |

**Movement Types:**

| Type                | Direction | Trigger                             |
| ------------------- | --------- | ----------------------------------- |
| `purchase_receive`  | in        | Purchase order receiving             |
| `purchase_return`   | out       | Return to supplier                   |
| `pos_sale`          | out       | POS order (if recipe/ingredient tracking) |
| `manual_in`         | in        | Manual stock addition                |
| `manual_out`        | out       | Manual stock removal                 |
| `adjustment_in`     | in        | Stock count adjustment (surplus)     |
| `adjustment_out`    | out       | Stock count adjustment (shortage)    |
| `waste`             | out       | Waste/spoilage                       |
| `transfer_in`       | in        | Transfer from another branch         |
| `transfer_out`      | out       | Transfer to another branch           |
| `opening_balance`   | in        | Initial stock setup                  |

**Business Rules:**
- Stock movements are **immutable** — once created, they cannot be edited or deleted.
- Corrections are made by creating a new opposing movement.
- `stock_before` and `stock_after` provide a full audit trail.
- `current_stock` on the item MUST equal `stock_after` of the latest movement.
- All movements update the item's `current_stock` atomically (use database locks).
- Negative stock is **not allowed** — movement must fail if insufficient stock.

### 2.6 Stock Counts (جرد المخزون)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `reference`        | VARCHAR(30)     | Yes      | Auto-generated (CNT-2026-07-001)   |
| `count_date`       | DATE            | Yes      | Date of physical count             |
| `category_id`      | FK → categories | No       | Count specific category (null=all) |
| `status`           | VARCHAR(20)     | Yes      | draft/in_progress/completed/approved |
| `total_items`      | INT             | Yes      | Number of items counted            |
| `total_variance_amount` | BIGINT     | Yes      | Total variance in piasters         |
| `notes`            | TEXT            | No       | Notes                              |
| `counted_by`       | FK → users      | Yes      | Who performed the count            |
| `approved_by`      | FK → users      | No       | Who approved adjustments           |
| `approved_at`      | TIMESTAMP       | No       | Approval timestamp                 |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

### 2.7 Stock Count Items (بنود الجرد)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `stock_count_id`   | FK → stock_counts | Yes   | Parent count                       |
| `item_id`          | FK → items      | Yes      | Inventory item                     |
| `system_quantity`  | DECIMAL(15,3)   | Yes      | System stock at count time         |
| `counted_quantity` | DECIMAL(15,3)   | No       | Physically counted quantity        |
| `variance`         | DECIMAL(15,3)   | No       | counted - system                   |
| `variance_amount`  | BIGINT          | No       | variance × average_cost (piasters) |
| `notes`            | TEXT            | No       | Notes for this item                |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

**Business Rules:**
- When stock count is `approved`, generate `adjustment_in` or `adjustment_out` movements for variances.
- Variance amount calculated at `average_cost` for accounting purposes.
- Approved stock counts create a journal entry for inventory adjustments.

---

## 3. API Endpoints

### 3.1 Categories

| Method   | Endpoint                         | Permission                  | Description              |
| -------- | -------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/inventory/categories`          | `inv.categories.view`       | List categories (tree)   |
| `POST`   | `/inventory/categories`          | `inv.categories.create`     | Create category          |
| `PUT`    | `/inventory/categories/{id}`     | `inv.categories.update`     | Update category          |
| `DELETE` | `/inventory/categories/{id}`     | `inv.categories.delete`     | Soft delete category     |

### 3.2 Items

| Method   | Endpoint                         | Permission                  | Description              |
| -------- | -------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/inventory/items`               | `inv.items.view`            | List items (paginated)   |
| `POST`   | `/inventory/items`               | `inv.items.create`          | Create item              |
| `GET`    | `/inventory/items/{id}`          | `inv.items.view`            | Get item details         |
| `PUT`    | `/inventory/items/{id}`          | `inv.items.update`          | Update item              |
| `DELETE` | `/inventory/items/{id}`          | `inv.items.delete`          | Soft delete item         |
| `GET`    | `/inventory/items/{id}/movements`| `inv.movements.view`        | Get item movement history|
| `GET`    | `/inventory/items/low-stock`     | `inv.items.view`            | List items below min stock|
| `GET`    | `/inventory/items/expiring`      | `inv.items.view`            | List items nearing expiry|

### 3.3 Stock Movements

| Method   | Endpoint                         | Permission                  | Description              |
| -------- | -------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/inventory/movements`           | `inv.movements.view`        | List movements           |
| `POST`   | `/inventory/movements`           | `inv.movements.create`      | Create manual movement   |

### 3.4 Stock Counts

| Method   | Endpoint                              | Permission                  | Description              |
| -------- | ------------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/inventory/stock-counts`             | `inv.stock_counts.view`     | List stock counts        |
| `POST`   | `/inventory/stock-counts`             | `inv.stock_counts.create`   | Create stock count       |
| `GET`    | `/inventory/stock-counts/{id}`        | `inv.stock_counts.view`     | Get count details        |
| `PUT`    | `/inventory/stock-counts/{id}/items`  | `inv.stock_counts.update`   | Update counted quantities|
| `PATCH`  | `/inventory/stock-counts/{id}/approve`| `inv.stock_counts.approve`  | Approve & apply adjustments |

### 3.5 Units

| Method   | Endpoint                         | Permission                  | Description              |
| -------- | -------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/inventory/units`               | `inv.units.view`            | List units               |
| `POST`   | `/inventory/units`               | `inv.units.create`          | Create unit              |
| `PUT`    | `/inventory/units/{id}`          | `inv.units.update`          | Update unit              |

---

## 4. Costing Method

### 4.1 Weighted Average Cost (WAC)

Rabha uses the **Weighted Average Cost** method for inventory valuation.

```
When receiving new stock:
  new_average_cost = ((existing_qty × existing_avg_cost) + (received_qty × received_unit_cost))
                     / (existing_qty + received_qty)

When issuing stock (sales, waste, etc.):
  cost_of_goods = issued_qty × current_average_cost
  (average cost does not change on outgoing movements)
```

**Why WAC:**
- Simple and widely accepted in Egyptian accounting.
- Smooths out price fluctuations.
- Easy to implement and audit.
- Suitable for restaurant raw materials with frequent, small purchases.

---

## 5. Alerts & Notifications

| Alert Type           | Condition                              | Recipient           |
| -------------------- | -------------------------------------- | -------------------- |
| Low Stock            | `current_stock < minimum_stock`        | Purchasing, Manager  |
| Expiry Warning       | Item expires within 7 days             | Manager, Inventory   |
| Expired Item         | Item past expiry date                  | Manager              |
| Negative Variance    | Stock count shows shortage             | Manager              |
| High Waste           | Waste exceeds threshold (configurable) | Manager, Owner       |

---

## 6. Permissions

```
inv.categories.view
inv.categories.create
inv.categories.update
inv.categories.delete

inv.items.view
inv.items.create
inv.items.update
inv.items.delete
inv.items.export

inv.movements.view
inv.movements.create

inv.stock_counts.view
inv.stock_counts.create
inv.stock_counts.update
inv.stock_counts.approve

inv.units.view
inv.units.create
inv.units.update

inv.reports.view
inv.reports.export
```

---

## 7. Reports

| Report                    | Description                                    |
| ------------------------- | ---------------------------------------------- |
| Current Stock Report      | All items with current quantities and values    |
| Stock Valuation Report    | Total inventory value by category               |
| Stock Movement Report     | Movements filtered by type, item, date range   |
| Low Stock Report          | Items below minimum level                      |
| Expiry Report             | Items expiring within configurable period       |
| Waste Report              | Wasted/spoiled items and amounts               |
| Stock Count Variance      | Variance analysis from physical counts          |
| Consumption Report        | Item consumption trends over time              |
| Supplier Price Comparison | Last purchase prices per item per supplier      |
| ABC Analysis              | Items ranked by value/consumption (A/B/C)       |
