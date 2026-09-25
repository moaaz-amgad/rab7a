# 04 — Database Standards (MySQL)

> All database design, migrations, and queries must follow these standards. No exceptions.

---

## 1. General Rules

- **Engine**: InnoDB (required for transactions and foreign keys).
- **Charset**: `utf8mb4` (full Unicode support including Arabic).
- **Collation**: `utf8mb4_unicode_ci` (case-insensitive, accent-insensitive).
- **Strict Mode**: Enabled (`STRICT_TRANS_TABLES`).
- **Time Zone**: All timestamps stored in UTC. Convert to local timezone at display layer.
- **Max identifier length**: 64 characters (MySQL limit).

---

## 2. Table Naming

| Rule                    | Convention                          | Example                        |
| ----------------------- | ----------------------------------- | ------------------------------ |
| **Case**                | `snake_case`                        | `purchase_orders`              |
| **Plurality**           | Plural                              | `employees`, `branches`        |
| **Module prefix**       | Not required (avoid ambiguity only) | `pos_orders`, `pos_sessions`   |
| **Pivot tables**        | Alphabetical, singular, underscore  | `employee_role`                |
| **History/log tables**  | `{table}_logs` or `{table}_history` | `stock_movement_logs`          |

---

## 3. Column Naming

| Rule                    | Convention                          | Example                        |
| ----------------------- | ----------------------------------- | ------------------------------ |
| **Case**                | `snake_case`                        | `employee_number`              |
| **Primary key**         | `id` (auto-increment `BIGINT`)      | `id`                           |
| **Foreign keys**        | `{singular_table}_id`               | `branch_id`, `employee_id`     |
| **Boolean**             | `is_` or `has_` prefix              | `is_active`, `has_discount`    |
| **Date**                | `_date` suffix                      | `hire_date`, `due_date`        |
| **Datetime**            | `_at` suffix                        | `created_at`, `approved_at`    |
| **Amount/Money**        | Descriptive name, stored as INT     | `base_salary`, `total_amount`  |
| **Arabic text**         | `_ar` suffix                        | `name_ar`, `description_ar`    |
| **English text**        | `_en` suffix                        | `name_en`, `description_en`    |
| **Status/Type fields**  | Use `VARCHAR` with enum validation  | `status`, `payment_type`       |
| **Quantities**          | `DECIMAL(15,3)` for fractional      | `quantity`                     |
| **Percentages**         | `DECIMAL(5,2)`                      | `tax_rate`, `discount_rate`    |

---

## 4. Standard Columns

Every table MUST include these columns unless explicitly justified:

```sql
-- Standard columns for all tables
id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

-- Branch-scoped tables additionally include:
branch_id       BIGINT UNSIGNED NOT NULL,

-- Business entity tables additionally include:
deleted_at      TIMESTAMP NULL DEFAULT NULL,  -- Soft delete
created_by      BIGINT UNSIGNED NULL,         -- User who created
updated_by      BIGINT UNSIGNED NULL,         -- User who last updated
```

---

## 5. Data Types

### 5.1 Type Selection Rules

| Data Type             | MySQL Type                     | Notes                                        |
| --------------------- | ------------------------------ | -------------------------------------------- |
| **Primary Keys**      | `BIGINT UNSIGNED`              | Auto-increment                               |
| **Foreign Keys**      | `BIGINT UNSIGNED`              | Must match referenced PK type                |
| **Money/Currency**    | `BIGINT`                       | Stored in piasters (1 EGP = 100 piasters)    |
| **Quantities**        | `DECIMAL(15,3)`                | 3 decimal places for fractional quantities   |
| **Percentages**       | `DECIMAL(5,2)`                 | e.g., 15.00 for 15%                          |
| **Short strings**     | `VARCHAR(n)`                   | Specify max length                           |
| **Long text**         | `TEXT`                         | For descriptions, notes                      |
| **Boolean**           | `TINYINT(1)`                   | 0 = false, 1 = true                          |
| **Date only**         | `DATE`                         | YYYY-MM-DD                                   |
| **Date + Time**       | `TIMESTAMP`                    | UTC, auto-managed                            |
| **Enum values**       | `VARCHAR(50)`                  | NOT MySQL ENUM type — use VARCHAR + CHECK    |
| **JSON data**         | `JSON`                         | For flexible/metadata fields                 |
| **IP Address**        | `VARCHAR(45)`                  | IPv4 and IPv6                                |
| **File paths**        | `VARCHAR(500)`                 | Relative paths to storage                    |

### 5.2 Why NOT MySQL ENUM

- Adding/removing values requires `ALTER TABLE`.
- Difficult to manage across migrations.
- Validation should happen at the application layer.
- Use `VARCHAR` with a `CHECK` constraint or application-level enum validation.

---

## 6. Money Storage Standard

> **CRITICAL**: All monetary values are stored as **integers** in the smallest currency unit (piasters).

```sql
-- Correct: Store in piasters
base_salary     BIGINT NOT NULL DEFAULT 0,        -- 500000 = 5000.00 EGP
total_amount    BIGINT NOT NULL DEFAULT 0,        -- 15075 = 150.75 EGP
discount_amount BIGINT NOT NULL DEFAULT 0,        -- 250 = 2.50 EGP

-- WRONG: Never use DECIMAL or FLOAT for money
-- base_salary DECIMAL(10,2) -- DO NOT DO THIS
-- total_amount FLOAT        -- ABSOLUTELY NOT
```

**Conversion Rules:**
- Database ↔ Application: Values in piasters (integers)
- Application → Display: `piasters / 100` at the presentation layer
- User Input → Application: `egp * 100` at the input layer
- All arithmetic in piasters, convert only for display

---

## 7. Indexing Strategy

### 7.1 Mandatory Indexes

```sql
-- Every branch-scoped table
INDEX idx_{table}_branch_id (branch_id)

-- Every table with soft deletes
INDEX idx_{table}_deleted_at (deleted_at)

-- Common query patterns
INDEX idx_{table}_status (status)
INDEX idx_{table}_created_at (created_at)

-- Foreign keys (automatically indexed by InnoDB in most cases)
```

### 7.2 Composite Indexes

```sql
-- For queries that filter by branch + another column
INDEX idx_{table}_branch_status (branch_id, status)
INDEX idx_{table}_branch_date (branch_id, created_at)

-- For unique constraints within a branch
UNIQUE INDEX uq_{table}_branch_field (branch_id, field_name)
```

### 7.3 Index Rules

- **Always** index columns used in `WHERE`, `JOIN`, `ORDER BY`.
- **Always** create composite indexes for multi-column queries (leftmost prefix rule).
- **Never** over-index — each index adds write overhead.
- **Use** `EXPLAIN` to verify query plans during development.
- **Name** indexes consistently: `idx_{table}_{columns}` for regular, `uq_{table}_{columns}` for unique.
- **Full-text** indexes for search functionality: `FULLTEXT idx_{table}_search (name_ar, name_en)`.

---

## 8. Foreign Key Constraints

### 8.1 Rules

- **Every** foreign key must have an explicit constraint.
- **Naming**: `fk_{table}_{referenced_table}_{column}`
- **ON DELETE**: 
  - `RESTRICT` (default) — prevent deletion if referenced.
  - `CASCADE` — only for child records that cannot exist without parent (e.g., order items).
  - `SET NULL` — only when null is a valid business state.
- **ON UPDATE**: `CASCADE` (always).

### 8.2 Example

```sql
ALTER TABLE employees
  ADD CONSTRAINT fk_employees_branches_branch_id
    FOREIGN KEY (branch_id) REFERENCES branches(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  ADD CONSTRAINT fk_employees_departments_department_id
    FOREIGN KEY (department_id) REFERENCES departments(id)
    ON UPDATE CASCADE ON DELETE RESTRICT;
```

---

## 9. Migration Standards (Laravel)

### 9.1 Migration Naming

```
{timestamp}_create_{table}_table.php          -- New table
{timestamp}_add_{columns}_to_{table}_table.php -- Add columns
{timestamp}_modify_{column}_in_{table}_table.php -- Alter column
{timestamp}_create_{table1}_{table2}_table.php -- Pivot table
```

### 9.2 Migration Template

```php
declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create the employees table.
     * Stores employee personal and employment information.
     * Branch-scoped: each branch manages its own employees.
     */
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            // Primary Key
            $table->id();

            // Branch Scope
            $table->foreignId('branch_id')
                  ->constrained('branches')
                  ->cascadeOnUpdate()
                  ->restrictOnDelete();

            // Core Fields
            $table->string('employee_number', 20);
            $table->string('name_ar', 255);
            $table->string('name_en', 255);
            $table->string('national_id', 14);
            $table->string('phone', 20);
            $table->string('email', 255)->nullable();

            // Relationships
            $table->foreignId('department_id')
                  ->constrained('departments')
                  ->cascadeOnUpdate()
                  ->restrictOnDelete();

            $table->foreignId('job_title_id')
                  ->constrained('job_titles')
                  ->cascadeOnUpdate()
                  ->restrictOnDelete();

            // Employment Details
            $table->date('hire_date');
            $table->bigInteger('base_salary')->default(0); // piasters
            $table->string('status', 50)->default('active');

            // Audit Fields
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');

            // Timestamps & Soft Delete
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->unique(['branch_id', 'employee_number']);
            $table->unique(['branch_id', 'national_id']);
            $table->index(['branch_id', 'status']);
            $table->index(['branch_id', 'department_id']);
            $table->index('deleted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
```

### 9.3 Migration Rules

- **Every migration must be reversible** (`down()` method required).
- **Never modify existing migrations** that have been run in production — create new migrations.
- **Comment every migration** with its purpose.
- **Use `foreignId()->constrained()`** for foreign keys.
- **Define indexes in the same migration** as the table creation.
- **Test migrations** both up and down before committing.

---

## 10. Query Standards

### 10.1 Eloquent Rules

- Use Eloquent ORM for all queries — no raw SQL unless justified.
- **Eager load** relationships: `with(['department', 'jobTitle'])`.
- **Use scopes** for reusable query conditions.
- **Use `chunk()` or `cursor()`** for large datasets (never `all()`).
- **Use transactions** for multi-table writes.
- **Use `lockForUpdate()`** for concurrent-edit scenarios.

### 10.2 N+1 Prevention

```php
// WRONG — N+1 query (loads department for each employee individually)
$employees = Employee::all();
foreach ($employees as $employee) {
    echo $employee->department->name; // Extra query per employee
}

// CORRECT — Eager loaded
$employees = Employee::with('department')->get();
foreach ($employees as $employee) {
    echo $employee->department->name; // No extra query
}
```

### 10.3 Branch Scoping

```php
// HasBranch trait auto-applies global scope
// All queries on branch-scoped models automatically include:
// WHERE branch_id = {authenticated_user_branch_id}

// For owner consolidated views, explicitly remove the scope:
Employee::withoutGlobalScope(BranchScope::class)->get();
```

---

## 11. Seed Data

### 11.1 Required Seeds

- **Roles & Permissions**: All system roles and granular permissions.
- **Branches**: At least one default branch.
- **Admin User**: System administrator account.
- **Chart of Accounts**: Default chart of accounts template.
- **Default Settings**: System configuration defaults.

### 11.2 Seeder Rules

- Use **factories** for realistic test data.
- **Never** seed fake data into production — use environment checks.
- **Idempotent** seeders — safe to run multiple times.
- **Separate** production seeds from development seeds.

---

## 12. Backup & Data Protection

- Automated daily database backups.
- Backup retention: minimum 30 days.
- Backup encryption at rest.
- Tested restore procedure documented.
- Financial data tables never truncated — only soft-deleted.
- Audit logs never deleted — archive after 2 years if needed.
