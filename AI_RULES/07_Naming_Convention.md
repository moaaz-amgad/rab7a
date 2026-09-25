# 07 — Naming Convention

> Consistent naming across all layers of the application. No exceptions.

---

## 1. General Principles

- Names must be **descriptive and unambiguous**.
- Names must be in **English** (except for user-facing translated strings).
- **Avoid abbreviations** unless universally understood (e.g., `id`, `url`, `api`).
- **Avoid single-letter variables** except in short lambdas (`$q`, `$e`).
- Names should reveal **intent** — a reader should understand purpose without context.

---

## 2. PHP / Laravel Naming

### 2.1 Classes

| Type               | Convention      | Example                              |
| ------------------ | --------------- | ------------------------------------ |
| **Controller**     | PascalCase      | `EmployeeController`                 |
| **Model**          | PascalCase, Singular | `Employee`, `PurchaseOrder`      |
| **Service**        | PascalCase      | `EmployeeService`, `PayrollService`  |
| **Repository**     | PascalCase      | `EloquentEmployeeRepository`        |
| **Interface**      | PascalCase      | `EmployeeRepositoryInterface`       |
| **FormRequest**    | PascalCase      | `StoreEmployeeRequest`, `UpdateEmployeeRequest` |
| **Resource**       | PascalCase      | `EmployeeResource`, `EmployeeCollection` |
| **Policy**         | PascalCase      | `EmployeePolicy`                    |
| **Event**          | PascalCase, Past Tense | `EmployeeCreated`, `PayrollProcessed` |
| **Listener**       | PascalCase, Action | `SendWelcomeEmail`, `UpdateInventory` |
| **Job**            | PascalCase, Action | `ProcessPayroll`, `GenerateReport` |
| **Enum**           | PascalCase      | `EmployeeStatus`, `PaymentMethod`   |
| **Observer**       | PascalCase      | `EmployeeObserver`                  |
| **Middleware**      | PascalCase      | `SetBranchContext`, `CheckPermission` |
| **Exception**      | PascalCase      | `InsufficientStockException`        |
| **Trait**          | PascalCase      | `HasBranch`, `Auditable`            |
| **Scope**          | PascalCase      | `BranchScope`, `ActiveScope`        |

### 2.2 Methods

| Type               | Convention      | Example                              |
| ------------------ | --------------- | ------------------------------------ |
| **Controller methods** | camelCase   | `index`, `store`, `show`, `update`, `destroy` |
| **Service methods**    | camelCase   | `calculateSalary`, `processPayroll` |
| **Repository methods** | camelCase   | `findById`, `paginate`, `findByNationalId` |
| **Accessor**       | camelCase, `get{Name}Attribute` | `getBaseSalaryEgpAttribute` |
| **Mutator**        | camelCase, `set{Name}Attribute` | `setPhoneAttribute`       |
| **Scope**          | camelCase, `scope{Name}` | `scopeActive`, `scopeByDepartment` |
| **Relationship**   | camelCase       | `department`, `attendanceRecords`    |
| **Boolean methods**| camelCase, `is/has/can` prefix | `isActive`, `hasPermission`, `canApprove` |

### 2.3 Variables & Properties

| Type               | Convention      | Example                              |
| ------------------ | --------------- | ------------------------------------ |
| **Variables**      | camelCase       | `$totalAmount`, `$employeeCount`     |
| **Properties**     | camelCase       | `$baseSalary`, `$branchId`           |
| **Constants**      | UPPER_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS`, `DEFAULT_PER_PAGE` |
| **Config keys**    | snake_case       | `payroll.tax_rate`, `app.per_page`   |

### 2.4 Files & Directories

| Type               | Convention      | Example                              |
| ------------------ | --------------- | ------------------------------------ |
| **PHP class files** | PascalCase     | `EmployeeController.php`             |
| **Config files**   | snake_case      | `payroll.php`, `branch_settings.php` |
| **Migration files**| Laravel default | `2026_07_22_000001_create_employees_table.php` |
| **Directories**    | PascalCase (classes), snake_case (configs) | `Controllers/Hr/`, `config/` |

---

## 3. TypeScript / React Naming

### 3.1 Files & Directories

| Type               | Convention      | Example                              |
| ------------------ | --------------- | ------------------------------------ |
| **Component files** | PascalCase     | `EmployeeForm.tsx`, `DataTable.tsx`  |
| **Hook files**     | camelCase       | `useEmployees.ts`, `useAuth.ts`      |
| **Utility files**  | camelCase       | `money.ts`, `validators.ts`         |
| **Type files**     | camelCase       | `hr.types.ts`, `api.types.ts`       |
| **API files**      | camelCase       | `hr.api.ts`, `inventory.api.ts`     |
| **Store files**    | camelCase       | `authStore.ts`, `uiStore.ts`        |
| **Style files**    | PascalCase      | `EmployeeForm.module.css`           |
| **Test files**     | PascalCase      | `EmployeeForm.test.tsx`             |
| **Translation files** | camelCase   | `hr.json`, `common.json`            |
| **Directories**    | camelCase       | `components/`, `hooks/`, `utils/`   |
| **Component dirs** | PascalCase      | `EmployeeForm/`, `DataTable/`       |

### 3.2 Components

| Type               | Convention      | Example                              |
| ------------------ | --------------- | ------------------------------------ |
| **Component names** | PascalCase     | `EmployeeForm`, `DataTable`         |
| **Page components** | PascalCase + Page suffix | `EmployeeListPage`, `DashboardPage` |
| **Layout components** | PascalCase  | `AppShell`, `Sidebar`, `Header`     |

### 3.3 Functions & Variables

| Type               | Convention      | Example                              |
| ------------------ | --------------- | ------------------------------------ |
| **Functions**      | camelCase       | `formatMoney`, `calculateTotal`      |
| **Variables**      | camelCase       | `employeeList`, `isLoading`          |
| **Constants**      | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_FILE_SIZE`     |
| **Boolean vars**   | camelCase, `is/has/should/can` prefix | `isActive`, `hasError`, `canEdit` |
| **Handlers**       | camelCase, `handle` prefix | `handleSubmit`, `handleDelete` |
| **Callbacks (props)** | camelCase, `on` prefix | `onSubmit`, `onChange`, `onDelete` |

### 3.4 Types & Interfaces

| Type               | Convention      | Example                              |
| ------------------ | --------------- | ------------------------------------ |
| **Interfaces**     | PascalCase      | `Employee`, `EmployeeFormProps`      |
| **Types**          | PascalCase      | `EmployeeStatus`, `ApiResponse<T>`  |
| **Enums**          | PascalCase      | `PaymentMethod`, `OrderStatus`       |
| **Generic params** | Single uppercase | `T`, `K`, `V`                        |

> **Note**: Do NOT prefix interfaces with `I` (no `IEmployee`). Do NOT prefix types with `T` (no `TEmployee`).

### 3.5 React Query Keys

```typescript
const QUERY_KEYS = {
  employees: 'employees',
  employee: (id: number) => ['employee', id] as const,
  departments: 'departments',
};
```

### 3.6 Zustand Stores

```typescript
// Store hook: use{Name}Store
export const useAuthStore = create<AuthState>()(...);
export const useBranchStore = create<BranchState>()(...);
export const useUiStore = create<UiState>()(...);
```

---

## 4. Database Naming

### 4.1 Tables

| Rule               | Convention      | Example                              |
| ------------------ | --------------- | ------------------------------------ |
| **Tables**         | snake_case, plural | `employees`, `purchase_orders`    |
| **Pivot tables**   | snake_case, singular, alphabetical | `employee_role`     |
| **Log/history**    | snake_case + `_logs` or `_history` | `stock_movement_logs` |

### 4.2 Columns

| Rule               | Convention      | Example                              |
| ------------------ | --------------- | ------------------------------------ |
| **General columns** | snake_case     | `employee_number`, `base_salary`     |
| **Primary key**    | `id`            | `id`                                 |
| **Foreign keys**   | `{singular_table}_id` | `branch_id`, `department_id`   |
| **Booleans**       | `is_` or `has_` prefix | `is_active`, `has_discount`   |
| **Dates**          | `_date` suffix  | `hire_date`, `due_date`              |
| **Timestamps**     | `_at` suffix    | `created_at`, `approved_at`          |
| **Arabic text**    | `_ar` suffix    | `name_ar`, `description_ar`          |
| **English text**   | `_en` suffix    | `name_en`, `description_en`          |

### 4.3 Indexes

| Type               | Convention      | Example                              |
| ------------------ | --------------- | ------------------------------------ |
| **Regular index**  | `idx_{table}_{columns}` | `idx_employees_branch_status` |
| **Unique index**   | `uq_{table}_{columns}` | `uq_employees_branch_national_id` |
| **Foreign key**    | `fk_{table}_{ref}_{col}` | `fk_employees_branches_branch_id` |
| **Full-text**      | `ft_{table}_{columns}` | `ft_employees_name`            |

---

## 5. API Naming

### 5.1 URL Paths

| Rule               | Convention      | Example                              |
| ------------------ | --------------- | ------------------------------------ |
| **Resources**      | kebab-case, plural | `/hr/employees`, `/purchase-orders` |
| **Nested resources** | parent/id/child | `/hr/employees/1/documents`       |
| **Actions**        | kebab-case verbs | `/payroll/runs/1/approve`          |
| **Version prefix** | `/api/v1/`      | `/api/v1/hr/employees`             |

### 5.2 Query Parameters

| Rule               | Convention      | Example                              |
| ------------------ | --------------- | ------------------------------------ |
| **Filters**        | snake_case       | `?department_id=1&status=active`    |
| **Sorting**        | `sort_by`, `sort_dir` | `?sort_by=hire_date&sort_dir=desc` |
| **Pagination**     | `page`, `per_page` | `?page=1&per_page=25`            |
| **Search**         | `search`         | `?search=أحمد`                      |
| **Date range**     | `date_from`, `date_to` | `?date_from=2026-01-01&date_to=2026-01-31` |
| **Includes**       | `include`        | `?include=department,jobTitle`       |

---

## 6. Translation Keys

### 6.1 Key Structure

```
{namespace}.{group}.{item}
```

### 6.2 Examples

```json
{
  "module_title": "الموارد البشرية",
  "employee": {
    "title": "الموظفون",
    "add": "إضافة موظف",
    "edit": "تعديل بيانات الموظف",
    "name_ar": "الاسم بالعربية",
    "name_en": "الاسم بالإنجليزية",
    "created_success": "تم إضافة الموظف بنجاح",
    "updated_success": "تم تحديث بيانات الموظف بنجاح",
    "deleted_success": "تم حذف الموظف بنجاح",
    "delete_confirm": "هل أنت متأكد من حذف هذا الموظف؟"
  },
  "validation": {
    "national_id_length": "الرقم القومي يجب أن يكون 14 رقم",
    "national_id_unique": "الرقم القومي مسجل بالفعل"
  }
}
```

### 6.3 Common Keys

```json
// common.json — shared across all modules
{
  "actions": {
    "save": "حفظ",
    "cancel": "إلغاء",
    "delete": "حذف",
    "edit": "تعديل",
    "view": "عرض",
    "search": "بحث",
    "filter": "تصفية",
    "export": "تصدير",
    "import": "استيراد",
    "print": "طباعة",
    "refresh": "تحديث",
    "back": "رجوع",
    "confirm": "تأكيد",
    "approve": "موافقة",
    "reject": "رفض",
    "close": "إغلاق"
  },
  "labels": {
    "status": "الحالة",
    "date": "التاريخ",
    "branch": "الفرع",
    "created_at": "تاريخ الإنشاء",
    "updated_at": "تاريخ التعديل",
    "created_by": "أنشأ بواسطة",
    "actions": "إجراءات",
    "notes": "ملاحظات",
    "total": "الإجمالي"
  },
  "messages": {
    "loading": "جاري التحميل...",
    "no_data": "لا توجد بيانات",
    "no_results": "لا توجد نتائج للبحث",
    "error_occurred": "حدث خطأ، يرجى المحاولة مرة أخرى",
    "unsaved_changes": "لديك تعديلات غير محفوظة. هل تريد المتابعة؟",
    "delete_confirm": "هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء."
  },
  "pagination": {
    "showing": "عرض {{from}} - {{to}} من {{total}}",
    "per_page": "عرض لكل صفحة"
  }
}
```

---

## 7. Git Naming

### 7.1 Branches

```
main                          # Production
develop                       # Staging
feature/hr-employee-crud      # New feature
fix/payroll-calculation-bug   # Bug fix
hotfix/security-patch         # Production hotfix
refactor/inventory-service    # Code refactoring
docs/api-documentation        # Documentation
```

### 7.2 Commit Messages

```
feat(hr): add employee creation endpoint
fix(payroll): correct overtime calculation for night shifts
refactor(inventory): extract stock movement service
docs(api): document employee endpoints
test(accounting): add journal entry balance tests
chore(deps): update laravel to 12.0
style(frontend): fix RTL alignment in sidebar
```

Format: `{type}({scope}): {description}`

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `ci`

---

## 8. Environment Variables

```
# Naming: UPPER_SNAKE_CASE with category prefix
APP_NAME=Rabha
APP_ENV=production
APP_DEBUG=false

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rabha_erp
DB_USERNAME=rabha_app
DB_PASSWORD=***

CACHE_DRIVER=file
QUEUE_CONNECTION=database
SESSION_DRIVER=database

MAIL_MAILER=smtp
MAIL_HOST=***
MAIL_PORT=587

# Frontend
VITE_API_BASE_URL=/api/v1
VITE_APP_NAME=Rabha
```
