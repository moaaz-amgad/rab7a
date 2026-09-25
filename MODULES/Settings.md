# Module: Settings (الإعدادات والتبيئة)

> System configuration, company profile, branch management, user administration, RBAC, and tax setup.

---

## 1. Module Overview

| Property         | Value                                         |
| ---------------- | --------------------------------------------- |
| **Module Code**  | `set`                                         |
| **API Prefix**   | `/api/v1/settings`                            |
| **Branch Scoped**| Mixed (Global system settings & branch settings)|
| **Depends On**   | None                                          |
| **Depended By**  | All system modules                            |

---

## 2. Entities

### 2.1 Company Profile & System Info (بيانات الشركة)

| Field                | Type            | Required | Description                        |
| -------------------- | --------------- | -------- | ---------------------------------- |
| `company_name_ar`    | VARCHAR(255)    | Yes      | Legal name in Arabic ("شركة ربحة")|
| `company_name_en`    | VARCHAR(255)    | Yes      | Legal name in English ("Rabha")    |
| `tax_registration_no`| VARCHAR(50)     | Yes      | Egyptian Tax Registration Number   |
| `commercial_reg_no`  | VARCHAR(50)     | Yes      | Commercial Register Number         |
| `logo_path`          | VARCHAR(500)    | No       | Official logo                      |
| `primary_currency`   | VARCHAR(3)      | Yes      | Currency code (`EGP`)              |
| `timezone`           | VARCHAR(50)     | Yes      | System timezone (`Africa/Cairo`)   |
| `default_language`   | VARCHAR(5)      | Yes      | `ar` / `en`                        |

### 2.2 Branches (الفروع)

| Field                | Type            | Required | Description                        |
| -------------------- | --------------- | -------- | ---------------------------------- |
| `id`                 | BIGINT PK       | Auto     | Primary key                        |
| `code`               | VARCHAR(20)     | Yes      | Branch code (e.g. `BR-CAIRO`)      |
| `name_ar`            | VARCHAR(255)    | Yes      | Branch name in Arabic              |
| `name_en`            | VARCHAR(255)    | Yes      | Branch name in English             |
| `phone`              | VARCHAR(20)     | Yes      | Primary branch contact             |
| `address_ar`         | TEXT            | Yes      | Physical address Arabic            |
| `address_en`         | TEXT            | No       | Physical address English           |
| `city`               | VARCHAR(100)    | Yes      | City (e.g., Cairo, Alexandria)     |
| `is_main_branch`     | BOOLEAN         | Yes      | Main branch flag                   |
| `is_active`          | BOOLEAN         | Yes      | Active status                      |
| `created_at`         | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`         | TIMESTAMP       | Auto     | Update timestamp                   |

### 2.3 System Users (المستخدمون)

| Field                | Type            | Required | Description                        |
| -------------------- | --------------- | -------- | ---------------------------------- |
| `id`                 | BIGINT PK       | Auto     | Primary key                        |
| `username`           | VARCHAR(50)     | Yes      | Unique login username              |
| `name`               | VARCHAR(255)    | Yes      | Full display name                  |
| `email`              | VARCHAR(255)    | Yes      | Unique email                       |
| `password`           | VARCHAR(255)    | Yes      | bcrypt hash (cost 12)              |
| `branch_id`          | FK → branches   | Yes      | Primary assigned branch            |
| `is_owner`           | BOOLEAN         | Yes      | Cross-branch owner flag            |
| `is_active`          | BOOLEAN         | Yes      | Active status                      |
| `last_login_at`      | TIMESTAMP       | No       | Last authentication timestamp      |
| `created_at`         | TIMESTAMP       | Auto     | Creation timestamp                 |
| `updated_at`         | TIMESTAMP       | Auto     | Update timestamp                   |

### 2.4 Roles & Permissions (الصلاحيات)

- **Roles**: Owner, Branch Manager, Accountant, HR Manager, Cashier, Purchasing Officer, Data Entry, Viewer.
- **Permissions**: Granular permission tags formatted as `{module}.{resource}.{action}` (over 60+ permissions defined across module specs).

---

## 3. Tax & Regulatory Configuration (Egyptian Tax Rules)

| Setting Key                | Value          | Description                                  |
| -------------------------- | -------------- | -------------------------------------------- |
| `tax_default_rate`         | `14.00`        | Egyptian VAT standard rate (%)               |
| `tax_service_charge_rate`  | `12.00`        | Restaurant service charge rate (if enabled)  |
| `tax_service_charge_taxable`| `true`        | Is service charge subject to VAT             |
| `e_invoicing_enabled`      | `true`         | Egyptian ETA e-invoicing compliance flag     |

---

## 4. API Endpoints

| Method   | Endpoint                              | Permission                  | Description              |
| -------- | ------------------------------------- | --------------------------- | ------------------------ |
| `GET`    | `/settings/company`                   | `set.company.view`          | Get company profile      |
| `PUT`    | `/settings/company`                   | `set.company.update`        | Update company profile   |
| `GET`    | `/settings/branches`                  | `set.branches.view`         | List all branches        |
| `POST`   | `/settings/branches`                  | `set.branches.create`       | Create new branch        |
| `PUT`    | `/settings/branches/{id}`             | `set.branches.update`       | Update branch info       |
| `GET`    | `/settings/users`                     | `set.users.view`            | List users               |
| `POST`   | `/settings/users`                     | `set.users.create`          | Create new user          |
| `PUT`    | `/settings/users/{id}`                | `set.users.update`          | Update user & roles      |
| `GET`    | `/settings/roles`                     | `set.roles.view`            | List roles & permissions |
| `POST`   | `/settings/roles`                     | `set.roles.create`          | Create custom role       |
| `GET`    | `/settings/tax`                       | `set.tax.view`              | Get tax settings         |
| `PUT`    | `/settings/tax`                       | `set.tax.update`            | Update tax settings      |
