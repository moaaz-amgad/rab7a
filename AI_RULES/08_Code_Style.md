# 08 — Code Style

> Formatting rules enforced across all code. Consistency is mandatory.

---

## 1. PHP Code Style

### 1.1 Standard

- Follow **PSR-12** coding standard.
- Use **PHP CS Fixer** or **Laravel Pint** for automated formatting.

### 1.2 Rules

```php
// ✅ CORRECT

declare(strict_types=1);

namespace App\Services\Hr;

use App\Models\Hr\Employee;
use App\Repositories\Hr\EmployeeRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Manages employee lifecycle operations.
 *
 * Handles creation, updates, status changes, and deletion
 * of employee records within a branch context.
 */
final class EmployeeService
{
    public function __construct(
        private readonly EmployeeRepositoryInterface $employeeRepository,
    ) {}

    /**
     * Create a new employee with all required initial records.
     *
     * @param array<string, mixed> $data Validated employee data
     * @return Employee The created employee
     *
     * @throws \App\Exceptions\BusinessException If employee number already exists
     */
    public function create(array $data): Employee
    {
        return DB::transaction(function () use ($data): Employee {
            $data['employee_number'] = $this->generateEmployeeNumber($data['branch_id']);

            $employee = $this->employeeRepository->create($data);

            // Create initial attendance configuration
            $this->createDefaultAttendanceConfig($employee);

            return $employee;
        });
    }

    /**
     * Generate the next sequential employee number for a branch.
     */
    private function generateEmployeeNumber(int $branchId): string
    {
        $lastNumber = $this->employeeRepository->getLastEmployeeNumber($branchId);
        $nextSequence = $lastNumber ? ((int) substr($lastNumber, 4)) + 1 : 1;

        return sprintf('EMP-%04d', $nextSequence);
    }
}
```

### 1.3 Specific Rules

| Rule                           | Requirement                                    |
| ------------------------------ | ---------------------------------------------- |
| **`declare(strict_types=1)`**  | Required in every file                         |
| **Final classes**              | All controllers, services, repositories, models |
| **Readonly properties**        | Constructor-promoted dependencies              |
| **Type declarations**          | All parameters, return types, properties       |
| **Trailing comma**             | In multi-line arrays, parameters, arguments    |
| **Imports**                    | Ordered: PHP core → Framework → App classes    |
| **No unused imports**          | Remove all unused `use` statements             |
| **DocBlocks**                  | Required for all public methods                |
| **Line length**               | Maximum 120 characters                         |
| **Indentation**               | 4 spaces (no tabs)                             |
| **Blank lines**               | 1 blank line between methods, after namespace  |
| **String quotes**             | Single quotes for simple strings               |
| **Array syntax**              | Short array syntax `[]` (not `array()`)        |
| **Ternary**                   | Avoid nested ternaries; use `match` instead    |
| **Early return**              | Prefer early return over deep nesting          |

### 1.4 PHPDoc Standards

```php
/**
 * Calculate the net salary for an employee for a given period.
 *
 * Computes gross salary from base salary + allowances,
 * then subtracts deductions (insurance, tax, penalties).
 * All amounts are in piasters (integer arithmetic).
 *
 * @param int $employeeId The employee ID
 * @param string $periodStart Period start date (Y-m-d)
 * @param string $periodEnd Period end date (Y-m-d)
 * @return array{
 *   gross_salary: int,
 *   total_deductions: int,
 *   net_salary: int,
 *   breakdown: array<string, int>
 * }
 *
 * @throws \App\Exceptions\EmployeeNotFoundException
 * @throws \App\Exceptions\PayrollAlreadyProcessedException
 */
public function calculateNetSalary(int $employeeId, string $periodStart, string $periodEnd): array
```

---

## 2. TypeScript / React Code Style

### 2.1 Tools

- **ESLint** with recommended TypeScript rules.
- **Prettier** for formatting.
- Configuration shared across the team.

### 2.2 ESLint Configuration

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### 2.3 Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "always",
  "bracketSpacing": true,
  "jsxSingleQuote": false,
  "endOfLine": "lf"
}
```

### 2.4 Component Style

```tsx
// ✅ CORRECT

import { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Space, Tag } from 'antd';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '@/hooks/queries/useEmployees';
import { PageHeader } from '@/components/common/PageHeader';
import { MoneyDisplay } from '@/components/common/MoneyDisplay';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { Employee, EmployeeFilters } from '@/types/models/hr.types';
import type { ColumnsType } from 'antd/es/table';

export const EmployeeListPage: FC = () => {
  const { t } = useTranslation(['hr', 'common']);
  const navigate = useNavigate();
  const [filters, setFilters] = useState<EmployeeFilters>({ page: 1, per_page: 25 });
  const { data, isLoading } = useEmployees(filters);

  const columns: ColumnsType<Employee> = useMemo(
    () => [
      {
        title: t('hr:employee.employee_number'),
        dataIndex: 'employee_number',
        key: 'employee_number',
        sorter: true,
        width: 120,
      },
      {
        title: t('hr:employee.name_ar'),
        dataIndex: 'name_ar',
        key: 'name_ar',
        sorter: true,
      },
      {
        title: t('hr:employee.department'),
        dataIndex: ['department', 'name_ar'],
        key: 'department',
      },
      {
        title: t('hr:employee.status'),
        dataIndex: 'status',
        key: 'status',
        render: (status: string, record: Employee) => (
          <StatusBadge status={status} label={record.status_label} />
        ),
      },
      {
        title: t('common:labels.actions'),
        key: 'actions',
        width: 120,
        render: (_: unknown, record: Employee) => (
          <Space size="small">
            <Button size="small" onClick={() => navigate(`/hr/employees/${record.id}`)}>
              {t('common:actions.view')}
            </Button>
          </Space>
        ),
      },
    ],
    [t, navigate],
  );

  const handleCreateClick = useCallback(() => {
    navigate('/hr/employees/create');
  }, [navigate]);

  return (
    <>
      <PageHeader
        title={t('hr:employee.title')}
        breadcrumb={[t('hr:module_title'), t('hr:employee.title')]}
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateClick}>
            {t('hr:employee.add')}
          </Button>
        }
      />
      <Table<Employee>
        columns={columns}
        dataSource={data?.data}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: data?.meta?.current_page,
          pageSize: data?.meta?.per_page,
          total: data?.meta?.total,
          showSizeChanger: true,
          showTotal: (total, range) =>
            t('common:pagination.showing', { from: range[0], to: range[1], total }),
        }}
        onChange={(pagination, _filters, sorter) => {
          setFilters((prev) => ({
            ...prev,
            page: pagination.current,
            per_page: pagination.pageSize,
          }));
        }}
      />
    </>
  );
};

export default EmployeeListPage;
```

### 2.5 Specific Rules

| Rule                           | Requirement                                    |
| ------------------------------ | ---------------------------------------------- |
| **No `any` type**              | Use `unknown` and narrow                       |
| **Explicit return types**      | On all exported functions                      |
| **Const assertions**           | For constant arrays and objects                |
| **Destructuring**              | Prefer destructuring for props and state       |
| **Arrow functions**            | For callbacks and short functions              |
| **Named exports**              | Prefer over default exports (except pages)     |
| **Import order**               | React → Libraries → Components → Hooks → Types → Styles |
| **Self-closing tags**          | For components without children                |
| **Key prop**                   | Always use stable, unique keys (never index)   |
| **Event handlers**             | `handle` prefix: `handleClick`, `handleSubmit` |
| **Boolean props**              | Positive naming: `isVisible` not `isNotHidden` |
| **Indentation**                | 2 spaces                                       |
| **Line length**                | Maximum 100 characters                         |
| **Semicolons**                 | Required                                       |
| **Quotes**                     | Single for JS, double for JSX attributes       |
| **Trailing comma**             | Required in multi-line                         |

---

## 3. CSS Code Style

### 3.1 Methodology

- Use **CSS Modules** for component-scoped styles.
- Use **CSS Custom Properties** (variables) for design tokens.
- Use **Ant Design's** built-in styles as the foundation.
- Custom styles only when Ant Design doesn't cover the need.

### 3.2 CSS Rules

```css
/* ✅ CORRECT — variables.css */
:root {
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Colors */
  --color-primary: #1890ff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-error: #ff4d4f;

  /* Typography */
  --font-family-ar: 'Cairo', 'Noto Sans Arabic', sans-serif;
  --font-family-en: 'Inter', -apple-system, sans-serif;
  --font-size-body: 14px;
  --font-size-caption: 12px;
  --font-size-h1: 24px;

  /* Layout */
  --sidebar-width: 240px;
  --sidebar-collapsed-width: 64px;
  --header-height: 56px;
  --content-max-width: 1400px;
}

/* ✅ CORRECT — Component.module.css */
.container {
  padding: var(--spacing-lg);
  max-width: var(--content-max-width);
  margin-inline: auto;
}

.title {
  font-size: var(--font-size-h1);
  font-weight: 700;
  margin-block-end: var(--spacing-md);
}

.moneyCell {
  font-family: var(--font-family-mono);
  font-variant-numeric: tabular-nums;
  text-align: end; /* Works for both LTR and RTL */
}

.negativeAmount {
  color: var(--color-error);
}
```

### 3.3 CSS Naming (within modules)

- Use **camelCase** for class names in CSS Modules.
- Use **BEM-like** naming for complex components: `.formField`, `.formFieldError`.
- Use **logical properties**: `margin-inline-start`, `padding-block-end` (not left/right).
- Use **`var()`** for all design tokens — never hardcode values.

---

## 4. SQL / Migration Code Style

```php
// ✅ CORRECT

Schema::create('employees', function (Blueprint $table) {
    // Primary Key
    $table->id();

    // Branch Scope
    $table->foreignId('branch_id')
          ->constrained('branches')
          ->cascadeOnUpdate()
          ->restrictOnDelete();

    // Core Fields (grouped logically)
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

    // Financial
    $table->bigInteger('base_salary')->default(0);

    // Status
    $table->string('status', 50)->default('active');

    // Audit
    $table->foreignId('created_by')->nullable()->constrained('users');
    $table->foreignId('updated_by')->nullable()->constrained('users');

    // Timestamps
    $table->timestamps();
    $table->softDeletes();

    // Indexes (at the end, grouped)
    $table->unique(['branch_id', 'employee_number']);
    $table->unique(['branch_id', 'national_id']);
    $table->index(['branch_id', 'status']);
    $table->index('deleted_at');
});
```

### 4.1 SQL Style Rules

- Group columns logically with comments.
- Foreign keys defined inline with `constrained()`.
- Indexes defined at the end of the table definition.
- One blank line between column groups.
- Comments for non-obvious columns.

---

## 5. Comment Standards

### 5.1 When to Comment

- **Always**: Class-level docblocks explaining purpose.
- **Always**: Public method docblocks with @param, @return, @throws.
- **Always**: Complex business logic or calculations.
- **Always**: Non-obvious decisions or workarounds.
- **Never**: Obvious code that is self-documenting.
- **Never**: Commented-out code (remove it, use git history).

### 5.2 Comment Style

```php
// ✅ CORRECT — Explains WHY, not WHAT
// Egyptian labor law requires overtime to be calculated at 1.5x
// for the first 2 hours and 2x for subsequent hours.
$overtimeRate = $overtimeHours <= 2 ? 1.5 : 2.0;

// ❌ WRONG — States the obvious
// Multiply overtime hours by rate
$overtimeRate = $overtimeHours <= 2 ? 1.5 : 2.0;
```

```typescript
// ✅ CORRECT — Documents a workaround
// Ant Design's DatePicker doesn't support hijri calendar natively.
// We use a custom overlay component for hijri date selection.
```

---

## 6. Tool Configuration Files

### 6.1 Laravel Pint (PHP Formatter)

```json
// pint.json
{
  "preset": "psr12",
  "rules": {
    "declare_strict_types": true,
    "final_class": true,
    "trailing_comma_in_multiline": true,
    "ordered_imports": {
      "sort_algorithm": "alpha"
    },
    "no_unused_imports": true,
    "single_quote": true,
    "blank_line_after_namespace": true,
    "blank_line_after_opening_tag": true
  }
}
```

### 6.2 EditorConfig

```ini
# .editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.php]
indent_style = space
indent_size = 4
max_line_length = 120

[*.{ts,tsx,js,jsx,css,json}]
indent_style = space
indent_size = 2
max_line_length = 100

[*.md]
trim_trailing_whitespace = false
```
