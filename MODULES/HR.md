# Module: HR (الموارد البشرية)

> Human Resources management: employee lifecycle, departments, job titles, and document management.

---

## 1. Module Overview

| Property         | Value                                     |
| ---------------- | ----------------------------------------- |
| **Module Code**  | `hr`                                      |
| **API Prefix**   | `/api/v1/hr`                              |
| **Branch Scoped**| Yes                                       |
| **Depends On**   | Settings (branches, users)                |
| **Depended By**  | Attendance, Payroll, POS (cashier assignment) |

---

## 2. Entities

### 2.1 Departments (الأقسام)

| Field            | Type            | Required | Description                        |
| ---------------- | --------------- | -------- | ---------------------------------- |
| `id`             | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`      | FK → branches   | Yes      | Branch scope                       |
| `name_ar`        | VARCHAR(255)    | Yes      | Arabic name                        |
| `name_en`        | VARCHAR(255)    | Yes      | English name                       |
| `code`           | VARCHAR(20)     | Yes      | Department code (unique per branch)|
| `parent_id`      | FK → departments| No       | Parent department (hierarchy)      |
| `manager_id`     | FK → employees  | No       | Department head                    |
| `is_active`      | BOOLEAN         | Yes      | Active/inactive flag               |
| `sort_order`     | INT             | Yes      | Display sort order                 |
| `description`    | TEXT            | No       | Description/notes                  |
| `created_by`     | FK → users      | No       | Audit: who created                 |
| `updated_by`     | FK → users      | No       | Audit: who updated                 |
| `created_at`     | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`     | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`     | TIMESTAMP       | No       | Soft delete                        |

**Business Rules:**
- Department codes are unique within a branch.
- Cannot delete a department that has active employees.
- Hierarchical structure supported (parent-child).
- Manager must be an active employee in the same branch.

### 2.2 Job Titles (المسميات الوظيفية)

| Field            | Type            | Required | Description                        |
| ---------------- | --------------- | -------- | ---------------------------------- |
| `id`             | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`      | FK → branches   | Yes      | Branch scope                       |
| `name_ar`        | VARCHAR(255)    | Yes      | Arabic title                       |
| `name_en`        | VARCHAR(255)    | Yes      | English title                      |
| `code`           | VARCHAR(20)     | Yes      | Job title code                     |
| `department_id`  | FK → departments| No       | Default department                 |
| `min_salary`     | BIGINT          | No       | Minimum salary range (piasters)    |
| `max_salary`     | BIGINT          | No       | Maximum salary range (piasters)    |
| `is_active`      | BOOLEAN         | Yes      | Active/inactive flag               |
| `description`    | TEXT            | No       | Job description                    |
| `created_at`     | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`     | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`     | TIMESTAMP       | No       | Soft delete                        |

### 2.3 Employees (الموظفون)

| Field               | Type            | Required | Description                        |
| ------------------- | --------------- | -------- | ---------------------------------- |
| `id`                | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`         | FK → branches   | Yes      | Branch scope                       |
| `employee_number`   | VARCHAR(20)     | Yes      | Auto-generated (EMP-XXXX)          |
| `name_ar`           | VARCHAR(255)    | Yes      | Full name in Arabic                |
| `name_en`           | VARCHAR(255)    | Yes      | Full name in English               |
| `national_id`       | VARCHAR(14)     | Yes      | Egyptian National ID (encrypted)   |
| `date_of_birth`     | DATE            | No       | Date of birth                      |
| `gender`            | VARCHAR(10)     | Yes      | male / female                      |
| `marital_status`    | VARCHAR(20)     | No       | single/married/divorced/widowed    |
| `nationality`       | VARCHAR(50)     | No       | Nationality                        |
| `phone`             | VARCHAR(20)     | Yes      | Primary phone number               |
| `phone_secondary`   | VARCHAR(20)     | No       | Secondary phone                    |
| `email`             | VARCHAR(255)    | No       | Email address                      |
| `address`           | TEXT            | No       | Home address                       |
| `emergency_contact` | VARCHAR(255)    | No       | Emergency contact name             |
| `emergency_phone`   | VARCHAR(20)     | No       | Emergency contact phone            |
| `department_id`     | FK → departments| Yes      | Current department                 |
| `job_title_id`      | FK → job_titles | Yes      | Current job title                  |
| `hire_date`         | DATE            | Yes      | Date of hiring                     |
| `termination_date`  | DATE            | No       | Date of termination (if applicable)|
| `base_salary`       | BIGINT          | Yes      | Monthly base salary (piasters)     |
| `contract_type`     | VARCHAR(30)     | Yes      | full_time/part_time/temporary      |
| `status`            | VARCHAR(20)     | Yes      | active/on_leave/suspended/terminated/resigned |
| `photo_path`        | VARCHAR(500)    | No       | Employee photo file path           |
| `notes`             | TEXT            | No       | Internal notes                     |
| `user_id`           | FK → users      | No       | Linked system user (if any)        |
| `created_by`        | FK → users      | No       | Audit: who created                 |
| `updated_by`        | FK → users      | No       | Audit: who updated                 |
| `created_at`        | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`        | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`        | TIMESTAMP       | No       | Soft delete                        |

**Business Rules:**
- Employee number auto-generated per branch (format: `EMP-{4-digit sequence}`).
- National ID unique within a branch, encrypted at rest.
- `base_salary` stored in piasters (integer), displayed in EGP.
- Status transitions follow a defined state machine:
  - `active` → `on_leave`, `suspended`, `terminated`, `resigned`
  - `on_leave` → `active`, `terminated`, `resigned`
  - `suspended` → `active`, `terminated`
  - `terminated` / `resigned` → (final states, no transition out)
- Cannot hard-delete an employee — soft delete only.
- Termination date required when status changes to `terminated` or `resigned`.
- Salary changes must be logged with effective date.

### 2.4 Employee Documents (مستندات الموظف)

| Field            | Type            | Required | Description                        |
| ---------------- | --------------- | -------- | ---------------------------------- |
| `id`             | BIGINT PK       | Auto     | Primary key                        |
| `employee_id`    | FK → employees  | Yes      | Owning employee                    |
| `document_type`  | VARCHAR(50)     | Yes      | national_id/contract/certificate/other |
| `title`          | VARCHAR(255)    | Yes      | Document title                     |
| `file_path`      | VARCHAR(500)    | Yes      | Storage path                       |
| `file_size`      | INT             | Yes      | File size in bytes                 |
| `mime_type`      | VARCHAR(100)    | Yes      | MIME type                          |
| `expiry_date`    | DATE            | No       | Document expiry date               |
| `notes`          | TEXT            | No       | Notes                              |
| `uploaded_by`    | FK → users      | Yes      | Who uploaded                       |
| `created_at`     | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`     | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`     | TIMESTAMP       | No       | Soft delete                        |

### 2.5 Salary History (سجل الرواتب)

| Field            | Type            | Required | Description                        |
| ---------------- | --------------- | -------- | ---------------------------------- |
| `id`             | BIGINT PK       | Auto     | Primary key                        |
| `employee_id`    | FK → employees  | Yes      | Employee                           |
| `previous_salary`| BIGINT          | Yes      | Previous salary (piasters)         |
| `new_salary`     | BIGINT          | Yes      | New salary (piasters)              |
| `effective_date` | DATE            | Yes      | Date salary takes effect           |
| `reason`         | VARCHAR(255)    | No       | Reason for change                  |
| `approved_by`    | FK → users      | No       | Who approved                       |
| `created_by`     | FK → users      | Yes      | Who made the change                |
| `created_at`     | TIMESTAMP       | Auto     | Creation timestamp                 |

**Business Rules:**
- Salary history is immutable — no updates or deletes.
- Every salary change on the employee record automatically creates a history entry.
- The current `base_salary` on the employee must match the latest salary history entry.

---

## 3. API Endpoints

### 3.1 Departments

| Method   | Endpoint                      | Permission              | Description              |
| -------- | ----------------------------- | ----------------------- | ------------------------ |
| `GET`    | `/hr/departments`             | `hr.departments.view`   | List departments         |
| `POST`   | `/hr/departments`             | `hr.departments.create` | Create department        |
| `GET`    | `/hr/departments/{id}`        | `hr.departments.view`   | Get department details   |
| `PUT`    | `/hr/departments/{id}`        | `hr.departments.update` | Update department        |
| `DELETE` | `/hr/departments/{id}`        | `hr.departments.delete` | Soft delete department   |

### 3.2 Job Titles

| Method   | Endpoint                      | Permission              | Description              |
| -------- | ----------------------------- | ----------------------- | ------------------------ |
| `GET`    | `/hr/job-titles`              | `hr.job_titles.view`    | List job titles          |
| `POST`   | `/hr/job-titles`              | `hr.job_titles.create`  | Create job title         |
| `GET`    | `/hr/job-titles/{id}`         | `hr.job_titles.view`    | Get job title details    |
| `PUT`    | `/hr/job-titles/{id}`         | `hr.job_titles.update`  | Update job title         |
| `DELETE` | `/hr/job-titles/{id}`         | `hr.job_titles.delete`  | Soft delete job title    |

### 3.3 Employees

| Method   | Endpoint                           | Permission                | Description              |
| -------- | ---------------------------------- | ------------------------- | ------------------------ |
| `GET`    | `/hr/employees`                    | `hr.employees.view`       | List employees (paginated)|
| `POST`   | `/hr/employees`                    | `hr.employees.create`     | Create employee          |
| `GET`    | `/hr/employees/{id}`               | `hr.employees.view`       | Get employee details     |
| `PUT`    | `/hr/employees/{id}`               | `hr.employees.update`     | Update employee          |
| `DELETE` | `/hr/employees/{id}`               | `hr.employees.delete`     | Soft delete employee     |
| `PATCH`  | `/hr/employees/{id}/status`        | `hr.employees.update`     | Change employee status   |
| `PATCH`  | `/hr/employees/{id}/salary`        | `hr.employees.update_salary` | Update salary         |
| `GET`    | `/hr/employees/{id}/documents`     | `hr.documents.view`       | List employee documents  |
| `POST`   | `/hr/employees/{id}/documents`     | `hr.documents.create`     | Upload document          |
| `DELETE` | `/hr/employees/{id}/documents/{docId}` | `hr.documents.delete` | Delete document         |
| `GET`    | `/hr/employees/{id}/salary-history`| `hr.employees.view_salary`| Get salary history       |

---

## 4. Business Logic

### 4.1 Employee Number Generation

```
Pattern: EMP-{4-digit sequence}
Scope: Per branch (each branch has independent numbering)
Examples: EMP-0001, EMP-0002, EMP-0153
Thread-safe: Use database sequence or locked query to prevent duplicates.
```

### 4.2 Status Transition State Machine

```
         ┌──────────┐
         │  Active   │
         └────┬──┬──┬┘
              │  │  │
    ┌─────────┘  │  └──────────┐
    ▼            ▼              ▼
┌────────┐  ┌──────────┐  ┌───────────┐
│On Leave│  │Suspended │  │Terminated │
└───┬────┘  └────┬─────┘  └───────────┘
    │            │
    ▼            ▼              ┌──────────┐
  Active      Active           │ Resigned  │
                                └──────────┘
```

### 4.3 Salary Update Workflow

1. Manager/HR initiates salary change with new amount and effective date.
2. System validates: new salary within job title range (if defined).
3. System creates salary history record (immutable).
4. System updates employee's `base_salary`.
5. System logs audit trail.
6. If effective date is in current payroll period, flag for recalculation.

---

## 5. Filters & Search

### 5.1 Employee List Filters

| Parameter        | Type     | Description                           |
| ---------------- | -------- | ------------------------------------- |
| `search`         | string   | Name (AR/EN), employee number, phone  |
| `department_id`  | integer  | Filter by department                  |
| `job_title_id`   | integer  | Filter by job title                   |
| `status`         | string   | Filter by status                      |
| `contract_type`  | string   | Filter by contract type               |
| `hire_date_from` | date     | Hired after this date                 |
| `hire_date_to`   | date     | Hired before this date                |
| `sort_by`        | string   | Column to sort by                     |
| `sort_dir`       | string   | asc / desc                            |
| `page`           | integer  | Page number                           |
| `per_page`       | integer  | Items per page (max 100)              |

---

## 6. Permissions

```
hr.departments.view
hr.departments.create
hr.departments.update
hr.departments.delete

hr.job_titles.view
hr.job_titles.create
hr.job_titles.update
hr.job_titles.delete

hr.employees.view
hr.employees.create
hr.employees.update
hr.employees.delete
hr.employees.view_salary
hr.employees.update_salary
hr.employees.export

hr.documents.view
hr.documents.create
hr.documents.delete
```

---

## 7. Reports

| Report                    | Description                                |
| ------------------------- | ------------------------------------------ |
| Employee Directory        | Full list with contact info and status      |
| Department Summary        | Employee count per department               |
| Headcount Report          | Active employees over time                 |
| New Hires Report          | Employees hired in a date range            |
| Turnover Report           | Terminated/resigned employees with reasons |
| Contract Expiry Report    | Temporary contracts nearing expiry         |
| Document Expiry Report    | Employee documents nearing expiry          |
| Salary Report             | Salary distribution by department/title    |
