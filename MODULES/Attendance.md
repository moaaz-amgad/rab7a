# Module: Attendance (الحضور والانصراف)

> Employee attendance tracking: clock in/out, shifts, overtime, absences, and leave management.

---

## 1. Module Overview

| Property         | Value                                     |
| ---------------- | ----------------------------------------- |
| **Module Code**  | `att`                                     |
| **API Prefix**   | `/api/v1/attendance`                      |
| **Branch Scoped**| Yes                                       |
| **Depends On**   | HR (employees), Settings (work calendar)  |
| **Depended By**  | Payroll (attendance feeds salary calc)     |

---

## 2. Entities

### 2.1 Shifts (الورديات)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `name_ar`          | VARCHAR(255)    | Yes      | Shift name in Arabic               |
| `name_en`          | VARCHAR(255)    | Yes      | Shift name in English              |
| `code`             | VARCHAR(20)     | Yes      | Shift code (unique per branch)     |
| `start_time`       | TIME            | Yes      | Shift start time                   |
| `end_time`         | TIME            | Yes      | Shift end time                     |
| `break_duration`   | INT             | Yes      | Break duration in minutes          |
| `working_hours`    | DECIMAL(4,2)    | Yes      | Net working hours (excl. break)    |
| `grace_period_in`  | INT             | Yes      | Late arrival grace (minutes)       |
| `grace_period_out` | INT             | Yes      | Early departure grace (minutes)    |
| `is_overnight`     | BOOLEAN         | Yes      | Shift crosses midnight             |
| `is_active`        | BOOLEAN         | Yes      | Active/inactive                    |
| `color`            | VARCHAR(7)      | No       | Display color (hex)                |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`       | TIMESTAMP       | No       | Soft delete                        |

**Business Rules:**
- Working hours auto-calculated from start/end minus break.
- Overnight shifts (e.g., 10PM–6AM) handled with `is_overnight` flag.
- Grace period defines allowable late arrival before it counts as "late".
- Cannot delete a shift that is actively assigned to employees.

### 2.2 Employee Shift Assignments (تعيين الورديات)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `employee_id`      | FK → employees  | Yes      | Assigned employee                  |
| `shift_id`         | FK → shifts     | Yes      | Assigned shift                     |
| `effective_from`   | DATE            | Yes      | Assignment start date              |
| `effective_to`     | DATE            | No       | Assignment end date (null=ongoing) |
| `created_by`       | FK → users      | Yes      | Who assigned                       |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |

**Business Rules:**
- An employee can only have one active shift assignment at a time.
- Date ranges must not overlap for the same employee.
- Effective dates used for historical shift tracking (payroll needs this).

### 2.3 Attendance Records (سجل الحضور)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `employee_id`      | FK → employees  | Yes      | Employee                           |
| `date`             | DATE            | Yes      | Attendance date                    |
| `shift_id`         | FK → shifts     | No       | Expected shift                     |
| `clock_in`         | TIMESTAMP       | No       | Actual clock-in time               |
| `clock_out`        | TIMESTAMP       | No       | Actual clock-out time              |
| `clock_in_method`  | VARCHAR(20)     | No       | manual/device/system               |
| `clock_out_method` | VARCHAR(20)     | No       | manual/device/system               |
| `status`           | VARCHAR(20)     | Yes      | present/absent/late/early_leave/leave/holiday/weekend |
| `late_minutes`     | INT             | Yes      | Minutes late (0 if on time)        |
| `early_leave_minutes` | INT          | Yes      | Minutes left early (0 if full)     |
| `overtime_minutes` | INT             | Yes      | Overtime minutes worked            |
| `working_hours`    | DECIMAL(5,2)    | Yes      | Actual hours worked                |
| `notes`            | TEXT            | No       | Notes/remarks                      |
| `approved_by`      | FK → users      | No       | Manager who approved adjustments   |
| `approved_at`      | TIMESTAMP       | No       | Approval timestamp                 |
| `created_by`       | FK → users      | No       | Who created/entered                |
| `updated_by`       | FK → users      | No       | Who last modified                  |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

**Business Rules:**
- One record per employee per date (unique constraint: `branch_id + employee_id + date`).
- Late minutes calculated: `clock_in - shift_start_time - grace_period` (if positive).
- Early leave calculated: `shift_end_time - clock_out - grace_period` (if positive).
- Overtime calculated: minutes worked beyond shift's `working_hours`.
- Status determined automatically based on clock times vs. shift schedule:
  - `present`: Clocked in within grace period, full shift completed.
  - `late`: Clocked in after grace period.
  - `early_leave`: Clocked out before shift end (beyond grace).
  - `absent`: No clock-in record for a scheduled work day.
  - `leave`: Approved leave request covering this date.
  - `holiday`: Public holiday.
  - `weekend`: Non-working day.
- Manual entries allowed with reason and audit trail.
- Managers can adjust/correct records (logged with `approved_by`).

### 2.4 Leave Types (أنواع الإجازات)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `name_ar`          | VARCHAR(255)    | Yes      | Leave type in Arabic               |
| `name_en`          | VARCHAR(255)    | Yes      | Leave type in English              |
| `code`             | VARCHAR(20)     | Yes      | Leave type code                    |
| `is_paid`          | BOOLEAN         | Yes      | Paid leave or unpaid               |
| `annual_allowance` | INT             | No       | Days allowed per year (null=unlimited) |
| `requires_approval`| BOOLEAN         | Yes      | Requires manager approval          |
| `is_active`        | BOOLEAN         | Yes      | Active/inactive                    |
| `color`            | VARCHAR(7)      | No       | Display color                      |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`       | TIMESTAMP       | No       | Soft delete                        |

**Default Leave Types:**
- إجازة سنوية (Annual Leave) — Paid, 21 days/year (Egyptian labor law)
- إجازة مرضية (Sick Leave) — Paid (varies by duration per law)
- إجازة طارئة (Emergency Leave) — Paid, 6 days/year
- إجازة بدون راتب (Unpaid Leave) — Unpaid, requires approval
- إجازة رسمية (Public Holiday) — System-defined

### 2.5 Leave Requests (طلبات الإجازات)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | Yes      | Branch scope                       |
| `employee_id`      | FK → employees  | Yes      | Requesting employee                |
| `leave_type_id`    | FK → leave_types| Yes      | Type of leave                      |
| `start_date`       | DATE            | Yes      | Leave start date                   |
| `end_date`         | DATE            | Yes      | Leave end date                     |
| `total_days`       | INT             | Yes      | Total leave days requested         |
| `reason`           | TEXT            | No       | Reason for leave                   |
| `status`           | VARCHAR(20)     | Yes      | pending/approved/rejected/cancelled|
| `reviewed_by`      | FK → users      | No       | Who approved/rejected              |
| `reviewed_at`      | TIMESTAMP       | No       | Review timestamp                   |
| `review_notes`     | TEXT            | No       | Reviewer's notes                   |
| `created_by`       | FK → users      | Yes      | Who submitted                      |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |
| `deleted_at`       | TIMESTAMP       | No       | Soft delete                        |

**Business Rules:**
- `total_days` excludes weekends and public holidays within the range.
- Cannot request leave exceeding annual allowance (check remaining balance).
- Leave balance: `annual_allowance - used_days` for the current year.
- Approved leave automatically creates `leave` status attendance records for the date range.
- Cannot approve past-date leave unless user has special permission.
- Status transitions: `pending` → `approved` / `rejected`; `approved` → `cancelled` (with reason).

### 2.6 Public Holidays (الإجازات الرسمية)

| Field              | Type            | Required | Description                        |
| ------------------ | --------------- | -------- | ---------------------------------- |
| `id`               | BIGINT PK       | Auto     | Primary key                        |
| `branch_id`        | FK → branches   | No       | Null = applies to all branches     |
| `name_ar`          | VARCHAR(255)    | Yes      | Holiday name in Arabic             |
| `name_en`          | VARCHAR(255)    | Yes      | Holiday name in English            |
| `date`             | DATE            | Yes      | Holiday date                       |
| `is_recurring`     | BOOLEAN         | Yes      | Repeats every year                 |
| `created_at`       | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`       | TIMESTAMP       | Auto     | Update timestamp                   |

---

## 3. API Endpoints

### 3.1 Shifts

| Method   | Endpoint                         | Permission                  | Description              |
| -------- | -------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/attendance/shifts`             | `att.shifts.view`           | List shifts              |
| `POST`   | `/attendance/shifts`             | `att.shifts.create`         | Create shift             |
| `GET`    | `/attendance/shifts/{id}`        | `att.shifts.view`           | Get shift details        |
| `PUT`    | `/attendance/shifts/{id}`        | `att.shifts.update`         | Update shift             |
| `DELETE` | `/attendance/shifts/{id}`        | `att.shifts.delete`         | Soft delete shift        |

### 3.2 Attendance Records

| Method   | Endpoint                         | Permission                  | Description              |
| -------- | -------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/attendance/records`            | `att.records.view`          | List records (filterable)|
| `POST`   | `/attendance/records`            | `att.records.create`        | Manual clock in/out      |
| `PUT`    | `/attendance/records/{id}`       | `att.records.update`        | Adjust/correct record    |
| `POST`   | `/attendance/clock-in`           | `att.records.create`        | Quick clock-in           |
| `POST`   | `/attendance/clock-out`          | `att.records.create`        | Quick clock-out          |
| `GET`    | `/attendance/daily`              | `att.records.view`          | Today's attendance board |
| `GET`    | `/attendance/report`             | `att.reports.view`          | Attendance summary report|

### 3.3 Leave Management

| Method   | Endpoint                         | Permission                  | Description              |
| -------- | -------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/attendance/leave-types`        | `att.leave_types.view`      | List leave types         |
| `POST`   | `/attendance/leave-types`        | `att.leave_types.create`    | Create leave type        |
| `PUT`    | `/attendance/leave-types/{id}`   | `att.leave_types.update`    | Update leave type        |
| `GET`    | `/attendance/leave-requests`     | `att.leave_requests.view`   | List leave requests      |
| `POST`   | `/attendance/leave-requests`     | `att.leave_requests.create` | Submit leave request     |
| `PATCH`  | `/attendance/leave-requests/{id}/approve` | `att.leave_requests.approve` | Approve request  |
| `PATCH`  | `/attendance/leave-requests/{id}/reject`  | `att.leave_requests.approve` | Reject request   |
| `PATCH`  | `/attendance/leave-requests/{id}/cancel`  | `att.leave_requests.create`  | Cancel own request |
| `GET`    | `/attendance/leave-balance/{employeeId}` | `att.leave_requests.view` | Get leave balance  |

### 3.4 Public Holidays

| Method   | Endpoint                         | Permission                  | Description              |
| -------- | -------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/attendance/holidays`           | `att.holidays.view`         | List holidays            |
| `POST`   | `/attendance/holidays`           | `att.holidays.create`       | Create holiday           |
| `PUT`    | `/attendance/holidays/{id}`      | `att.holidays.update`       | Update holiday           |
| `DELETE` | `/attendance/holidays/{id}`      | `att.holidays.delete`       | Delete holiday           |

---

## 4. Calculations

### 4.1 Late Minutes

```
if clock_in > (shift_start + grace_period_in):
    late_minutes = clock_in - shift_start  (total, not just after grace)
else:
    late_minutes = 0
```

### 4.2 Early Leave Minutes

```
if clock_out < (shift_end - grace_period_out):
    early_leave_minutes = shift_end - clock_out  (total, not just before grace)
else:
    early_leave_minutes = 0
```

### 4.3 Overtime Minutes

```
actual_work_time = clock_out - clock_in - break_duration
if actual_work_time > shift_working_hours:
    overtime_minutes = actual_work_time - shift_working_hours
else:
    overtime_minutes = 0
```

Note: Overtime must be explicitly approved/authorized to count toward payroll. Unapproved overtime is tracked but not compensated.

### 4.4 Working Hours

```
working_hours = clock_out - clock_in - break_duration
Capped at: shift_working_hours + overtime_minutes
```

### 4.5 Leave Balance

```
remaining_balance = annual_allowance - sum(approved_leave_days for current year)
```

---

## 5. Attendance Board (Daily View)

A real-time view of today's attendance for the branch:

```
┌─────────────────────────────────────────────────────────────┐
│  حضور اليوم - الأربعاء 22/07/2026                          │
│  ┌──────┬──────┬──────┬──────┬──────┐                       │
│  │ حاضر │ غائب │ متأخر│ إجازة│ الكل │                       │
│  │  12  │  2   │  3   │  1   │  18  │                       │
│  └──────┴──────┴──────┴──────┴──────┘                       │
├─────────┬──────────┬────────┬────────┬──────────┬───────────┤
│ الموظف  │ الوردية  │ حضور   │ انصراف │ الحالة   │ ملاحظات   │
├─────────┼──────────┼────────┼────────┼──────────┼───────────┤
│ أحمد    │ صباحي   │ 08:02  │  -     │ 🟢 حاضر │           │
│ سارة    │ صباحي   │ 08:35  │  -     │ 🟠 متأخر│ 35 دقيقة  │
│ محمد    │ صباحي   │  -     │  -     │ 🔴 غائب │           │
│ فاطمة   │ -       │  -     │  -     │ 🔵 إجازة│ إجازة سنوية│
└─────────┴──────────┴────────┴────────┴──────────┴───────────┘
```

---

## 6. Permissions

```
att.shifts.view
att.shifts.create
att.shifts.update
att.shifts.delete

att.records.view
att.records.create
att.records.update
att.records.approve

att.leave_types.view
att.leave_types.create
att.leave_types.update

att.leave_requests.view
att.leave_requests.create
att.leave_requests.approve

att.holidays.view
att.holidays.create
att.holidays.update
att.holidays.delete

att.reports.view
att.reports.export
```

---

## 7. Reports

| Report                    | Description                                  |
| ------------------------- | -------------------------------------------- |
| Daily Attendance          | All employees' attendance for a specific day |
| Monthly Attendance        | Summary per employee for a month             |
| Late Report               | Employees with late arrivals in a period     |
| Absence Report            | Absent days per employee in a period         |
| Overtime Report           | Overtime hours per employee in a period      |
| Leave Balance Report      | Remaining leave days per employee per type   |
| Leave Usage Report        | Leave days used in a period by type          |
| Attendance Trend          | Attendance patterns over time (chart)        |
