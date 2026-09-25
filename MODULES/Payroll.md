# Module: Payroll (المرتبات)

> Salary calculation, deductions, allowances, payroll processing, and pay slip generation.

---

## 1. Module Overview

| Property         | Value                                         |
| ---------------- | --------------------------------------------- |
| **Module Code**  | `pay`                                         |
| **API Prefix**   | `/api/v1/payroll`                             |
| **Branch Scoped**| Yes                                           |
| **Depends On**   | HR (employees, salaries), Attendance (records)|
| **Depended By**  | Accounting (journal entries), Expenses        |

---

## 2. Entities

### 2.1 Salary Structure (هيكل المرتبات)

Defines the components that make up an employee's salary.

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `name_ar`          | VARCHAR(255)    | Yes      | Component name in Arabic           |
| `name_en`          | VARCHAR(255)    | Yes      | Component name in English          |
| `code`             | VARCHAR(30)     | Yes      | Unique code (e.g., BASE, HOUSING)  |
| `type`             | VARCHAR(20)     | Yes      | earning / deduction                |
| `category`         | VARCHAR(30)     | Yes      | fixed/variable/attendance_based    |
| `calculation_method`| VARCHAR(20)    | Yes      | fixed_amount / percentage / formula|
| `default_amount`   | BIGINT          | No       | Default amount (piasters)          |
| `default_percentage`| DECIMAL(5,2)   | No       | Default percentage                 |
| `base_component_id`| FK → self       | No       | Calculate percentage of this component |
| `is_taxable`       | BOOLEAN         | Yes      | Subject to tax                     |
| `is_social_insurance`| BOOLEAN       | Yes      | Subject to social insurance        |
| `is_active`        | BOOLEAN         | Yes      | Active/inactive                    |
| `sort_order`       | INT             | Yes      | Display order                      |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`       | TIMESTAMP       | No       | Soft delete                        |

**Default Salary Components:**

| Code              | Name (AR)           | Type      | Category   | Taxable | Notes                    |
| ----------------- | ------------------- | --------- | ---------- | ------- | ------------------------ |
| `BASE`            | الراتب الأساسي       | earning   | fixed      | Yes     | From employee record     |
| `HOUSING`         | بدل سكن             | earning   | fixed      | Yes     | Configurable per employee|
| `TRANSPORT`       | بدل مواصلات          | earning   | fixed      | Yes     | Configurable per employee|
| `MEALS`           | بدل وجبات           | earning   | fixed      | No      | Restaurant-specific      |
| `OVERTIME`        | أجر إضافي           | earning   | attendance | Yes     | From attendance records  |
| `BONUS`           | مكافأة              | earning   | variable   | Yes     | Manual per payroll run   |
| `SOCIAL_INS`      | تأمينات اجتماعية     | deduction | fixed      | No      | Egyptian social insurance|
| `TAX`             | ضريبة كسب العمل      | deduction | fixed      | No      | Egyptian income tax      |
| `ABSENCE`         | خصم غياب            | deduction | attendance | No      | From attendance records  |
| `LATE_PENALTY`    | خصم تأخير           | deduction | attendance | No      | From attendance records  |
| `ADVANCE`         | سلفة                | deduction | variable   | No      | Manual deduction         |
| `OTHER_DEDUCT`    | خصومات أخرى         | deduction | variable   | No      | Manual deduction         |

### 2.2 Employee Salary Components (مكونات راتب الموظف)

Override default salary structure values per employee.

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `employee_id`      | FK → employees  | Yes      | Employee                           |
| `salary_component_id` | FK → salary_structure | Yes | Salary component             |
| `amount`           | BIGINT          | No       | Fixed amount override (piasters)   |
| `percentage`       | DECIMAL(5,2)    | No       | Percentage override                |
| `effective_from`   | DATE            | Yes      | Effective start date               |
| `effective_to`     | DATE            | No       | Effective end date (null=ongoing)  |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

### 2.3 Payroll Runs (دورات المرتبات)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `reference`        | VARCHAR(30)     | Yes      | Auto-generated (PAY-2026-07)       |
| `period_start`     | DATE            | Yes      | Payroll period start               |
| `period_end`       | DATE            | Yes      | Payroll period end                 |
| `month`            | INT             | Yes      | Payroll month (1-12)               |
| `year`             | INT             | Yes      | Payroll year                       |
| `total_employees`  | INT             | Yes      | Number of employees in this run    |
| `total_earnings`   | BIGINT          | Yes      | Sum of all earnings (piasters)     |
| `total_deductions` | BIGINT          | Yes      | Sum of all deductions (piasters)   |
| `total_net_salary` | BIGINT          | Yes      | Sum of net salaries (piasters)     |
| `status`           | VARCHAR(20)     | Yes      | draft/calculated/approved/paid/cancelled |
| `calculated_at`    | TIMESTAMP       | No       | When calculation was run           |
| `calculated_by`    | FK → users      | No       | Who ran the calculation            |
| `approved_by`      | FK → users      | No       | Who approved                       |
| `approved_at`      | TIMESTAMP       | No       | Approval timestamp                 |
| `paid_at`          | TIMESTAMP       | No       | When marked as paid                |
| `paid_by`          | FK → users      | No       | Who marked as paid                 |
| `journal_entry_id` | FK → journal_entries | No  | Linked accounting entry            |
| `notes`            | TEXT            | No       | Notes                              |
| `created_by`       | FK → users      | Yes      | Who created                        |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

**Business Rules:**
- One payroll run per branch per month (unique: `branch_id + month + year`).
- Status workflow: `draft` → `calculated` → `approved` → `paid`.
- Only `draft` and `calculated` status can be recalculated.
- `approved` status cannot be modified without cancelling first.
- `paid` status is final — corrections via next month's adjustments.
- `cancelled` payroll creates a reversal journal entry in accounting.
- Approval requires a different user than the one who calculated.

### 2.4 Payroll Details (تفاصيل المرتبات)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `payroll_run_id`   | FK → payroll_runs | Yes   | Parent payroll run                 |
| `employee_id`      | FK → employees  | Yes      | Employee                           |
| `base_salary`      | BIGINT          | Yes      | Base salary at time of run (piasters) |
| `total_earnings`   | BIGINT          | Yes      | Total earnings (piasters)          |
| `total_deductions` | BIGINT          | Yes      | Total deductions (piasters)        |
| `net_salary`       | BIGINT          | Yes      | Net salary (piasters)              |
| `working_days`     | INT             | Yes      | Working days in period             |
| `present_days`     | INT             | Yes      | Days present                       |
| `absent_days`      | INT             | Yes      | Days absent                        |
| `late_count`       | INT             | Yes      | Number of late arrivals            |
| `overtime_hours`   | DECIMAL(5,2)    | Yes      | Total overtime hours               |
| `leave_days`       | INT             | Yes      | Days on leave                      |
| `notes`            | TEXT            | No       | Per-employee notes                 |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

### 2.5 Payroll Detail Lines (بنود المرتبات)

Individual line items for each salary component per employee.

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `payroll_detail_id`| FK → payroll_details | Yes | Parent detail record              |
| `salary_component_id` | FK → salary_structure | Yes | Salary component             |
| `type`             | VARCHAR(20)     | Yes      | earning / deduction                |
| `amount`           | BIGINT          | Yes      | Amount (piasters)                  |
| `description`      | VARCHAR(255)    | No       | Calculation description            |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |

---

## 3. API Endpoints

### 3.1 Salary Structure

| Method   | Endpoint                              | Permission                  | Description              |
| -------- | ------------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/payroll/salary-structure`           | `pay.structure.view`        | List components          |
| `POST`   | `/payroll/salary-structure`           | `pay.structure.create`      | Create component         |
| `PUT`    | `/payroll/salary-structure/{id}`      | `pay.structure.update`      | Update component         |
| `DELETE` | `/payroll/salary-structure/{id}`      | `pay.structure.delete`      | Deactivate component     |

### 3.2 Employee Salary Components

| Method   | Endpoint                                       | Permission                  | Description              |
| -------- | ---------------------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/payroll/employees/{id}/components`            | `pay.employee_salary.view`  | Get employee components  |
| `POST`   | `/payroll/employees/{id}/components`            | `pay.employee_salary.update`| Set employee components  |

### 3.3 Payroll Runs

| Method   | Endpoint                              | Permission                  | Description              |
| -------- | ------------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/payroll/runs`                       | `pay.runs.view`             | List payroll runs        |
| `POST`   | `/payroll/runs`                       | `pay.runs.create`           | Create payroll run       |
| `GET`    | `/payroll/runs/{id}`                  | `pay.runs.view`             | Get run details          |
| `POST`   | `/payroll/runs/{id}/calculate`        | `pay.runs.process`          | Calculate payroll        |
| `POST`   | `/payroll/runs/{id}/recalculate`      | `pay.runs.process`          | Recalculate payroll      |
| `PATCH`  | `/payroll/runs/{id}/approve`          | `pay.runs.approve`          | Approve payroll          |
| `PATCH`  | `/payroll/runs/{id}/pay`              | `pay.runs.process`          | Mark as paid             |
| `PATCH`  | `/payroll/runs/{id}/cancel`           | `pay.runs.cancel`           | Cancel payroll run       |
| `GET`    | `/payroll/runs/{id}/details`          | `pay.runs.view`             | Get all employee details |
| `GET`    | `/payroll/runs/{id}/details/{empId}`  | `pay.runs.view`             | Get single employee detail|
| `GET`    | `/payroll/runs/{id}/payslip/{empId}`  | `pay.payslips.view`         | Generate pay slip PDF    |
| `GET`    | `/payroll/runs/{id}/payslips`         | `pay.payslips.view`         | Generate all pay slips   |
| `GET`    | `/payroll/runs/{id}/export`           | `pay.runs.export`           | Export to Excel          |

---

## 4. Calculation Engine

### 4.1 Payroll Calculation Flow

```
1. Identify all active employees in the branch
2. For each employee:
   a. Get base salary from employee record
   b. Get employee-specific salary component overrides
   c. Get attendance summary for the period:
      - Working days, present days, absent days
      - Late count, overtime hours, leave days
   d. Calculate each earning component:
      - BASE: employee.base_salary
      - Fixed allowances: from employee_salary_components
      - OVERTIME: overtime_hours × (hourly_rate × overtime_multiplier)
      - Variable: manually entered amounts
   e. Calculate each deduction component:
      - SOCIAL_INS: calculated per Egyptian law brackets
      - TAX: calculated per Egyptian tax brackets
      - ABSENCE: (daily_rate × absent_days) for unpaid absences
      - LATE_PENALTY: per branch penalty policy
      - Variable: manually entered amounts
   f. Net = Total Earnings - Total Deductions
3. Aggregate totals for the payroll run
4. Save all records in a single transaction
```

### 4.2 Key Calculations

#### Hourly Rate
```
hourly_rate = base_salary / (working_days_in_month × working_hours_per_day)
All in piasters (integer math)
```

#### Daily Rate
```
daily_rate = base_salary / working_days_in_month
All in piasters (integer math)
```

#### Overtime Pay
```
Regular overtime (weekdays): hourly_rate × 1.5
Holiday/weekend overtime: hourly_rate × 2.0
Per Egyptian Labor Law Article 85
```

#### Absence Deduction
```
unpaid_absence_deduction = daily_rate × unpaid_absent_days
Paid leave days are NOT deducted
```

#### Late Penalty
```
Configurable per branch policy. Common policies:
- Warning for first 3 lates per month
- Deduction of X piasters per late after 3rd
- Or: deduction per late minute
```

### 4.3 Egyptian Social Insurance Calculation

```
Employee share: based on insurance salary brackets
Employer share: based on insurance salary brackets

Insurance salary = base_salary (capped per law)

Current rates (update as law changes):
- Employee contribution: 11% of insurance salary
- Employer contribution: 18.75% of insurance salary
- Minimum insurable salary: per current legislation
- Maximum insurable salary: per current legislation

Note: Rates and brackets must be configurable in settings
to accommodate annual changes per Egyptian law.
```

### 4.4 Egyptian Income Tax (ضريبة كسب العمل)

```
Taxable income = Total Earnings - Social Insurance Employee Share - Personal Exemption

Tax brackets (annual, configurable):
- Up to 40,000 EGP: 0%
- 40,001 - 55,000: 10%
- 55,001 - 70,000: 15%
- 70,001 - 200,000: 20%
- 200,001 - 400,000: 22.5%
- Above 400,000: 25%

Monthly tax = Annual tax / 12

Note: Tax brackets change periodically. Must be configurable
in system settings, not hardcoded.
```

---

## 5. Pay Slip (كشف المرتب)

### 5.1 Pay Slip Content

```
┌─────────────────────────────────────────────────────────┐
│                    شركة ربحة                             │
│              كشف مرتب - يوليو 2026                       │
├─────────────────────────────────────────────────────────┤
│  الموظف: أحمد محمد حسن          الرقم الوظيفي: EMP-0001 │
│  القسم: المطبخ                  المسمى: شيف رئيسي       │
│  الفرع: القاهرة                                         │
├──────────────────────────┬──────────────────────────────┤
│  المستحقات               │  الاستقطاعات                 │
│  ─────────               │  ───────────                 │
│  الراتب الأساسي  5,000.00│  تأمينات اجتماعية    550.00 │
│  بدل سكن          500.00 │  ضريبة كسب العمل     125.00 │
│  بدل مواصلات      300.00 │  خصم غياب (1 يوم)    238.10 │
│  بدل وجبات        200.00 │  خصم تأخير            50.00 │
│  أجر إضافي (8 س)  571.43 │                              │
│  ─────────               │  ───────────                 │
│  إجمالي المستحقات 6,571.43│  إجمالي الاستقطاعات  963.10 │
├──────────────────────────┴──────────────────────────────┤
│                                                         │
│  صافي المرتب: ٥,٦٠٨.٣٣ ج.م                            │
│                                                         │
│  أيام العمل: 26  |  أيام الحضور: 25  |  غياب: 1         │
│  تأخير: 2 مرات   |  ساعات إضافية: 8                     │
├─────────────────────────────────────────────────────────┤
│  تاريخ الطباعة: 2026/07/31          صفحة 1 من 1         │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Pay Slip Rules

- Generated as PDF (server-side, DomPDF).
- Bilingual (Arabic primary, English labels optional).
- Shows all earning and deduction components with amounts.
- Shows attendance summary for the period.
- Company branding (logo, name, address).
- Individual or bulk generation.
- Never show other employees' data.

---

## 6. Permissions

```
pay.structure.view
pay.structure.create
pay.structure.update
pay.structure.delete

pay.employee_salary.view
pay.employee_salary.update

pay.runs.view
pay.runs.create
pay.runs.process
pay.runs.approve
pay.runs.cancel
pay.runs.export

pay.payslips.view
pay.payslips.print

pay.reports.view
pay.reports.export
```

---

## 7. Accounting Integration

When a payroll run is marked as `paid`, the system automatically creates a journal entry:

| Account                    | Debit              | Credit             |
| -------------------------- | ------------------ | ------------------ |
| Salaries Expense           | Total Earnings     |                    |
| Social Insurance Payable   |                    | Employee SS Share  |
| Tax Payable                |                    | Tax Deductions     |
| Other Deductions Payable   |                    | Other Deductions   |
| Salaries Payable / Cash    |                    | Net Salary         |

The `journal_entry_id` is stored on the payroll run for traceability.

---

## 8. Reports

| Report                    | Description                                    |
| ------------------------- | ---------------------------------------------- |
| Payroll Summary           | Per-run totals by component                    |
| Payroll Comparison        | Month-over-month comparison                    |
| Department Salary Report  | Salary distribution by department              |
| Bank Transfer Report      | Net salaries for bank transfer file            |
| Social Insurance Report   | Employee + employer contributions              |
| Tax Report                | Monthly tax deductions summary                 |
| Salary Component Report   | Breakdown by component across employees        |
| Annual Tax Statement      | Per-employee annual tax summary (for filing)   |
