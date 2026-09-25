# Rabha ERP — Project Specification

## 1. Project Identity

| Field              | Value                                              |
| ------------------ | -------------------------------------------------- |
| **Project Name**   | Rabha ERP                                          |
| **Type**           | Enterprise Restaurant Management System            |
| **Version**        | 1.0.0                                              |
| **Classification** | Commercial / Production Software                   |
| **License**        | Proprietary                                        |
| **Created**        | 2026-07-22                                         |

---

## 2. Project Overview

Rabha ERP is a full-featured, production-grade Enterprise Resource Planning system purpose-built for the restaurant industry. It manages daily operations including human resources, payroll, attendance, inventory, purchasing, supplier relations, customer management, accounting, point-of-sale, expenses, and reporting.

The system is designed for real-world daily use by:

- **Owners** — consolidated cross-branch dashboards and financial oversight
- **Managers** — branch-level operations, approvals, and monitoring
- **Accountants** — general ledger, journal entries, financial statements
- **HR Staff** — employee lifecycle, attendance, payroll processing
- **Cashiers** — POS terminal, order processing, payment collection
- **Purchasing Staff** — purchase orders, supplier management, receiving
- **Data Entry** — inventory counts, expense recording, data maintenance

---

## 3. Business Context

| Parameter              | Value                                                     |
| ---------------------- | --------------------------------------------------------- |
| **Country**            | Egypt                                                     |
| **Currency**           | Egyptian Pound (EGP)                                      |
| **Tax System**         | Egyptian tax regulations (VAT / Sales Tax as applicable)  |
| **Language**           | Bilingual — Arabic (primary, RTL) / English (secondary)   |
| **Calendar**           | Gregorian (Hijri display optional)                        |
| **Number Format**      | Arabic-Indic numerals supported, Western default          |
| **Fiscal Year**        | Configurable (default: January–December)                  |

---

## 4. Architecture Overview

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  React SPA   │  │  POS Terminal│  │  Mobile View  │  │
│  │  (Dashboard) │  │  (Optimized) │  │  (Responsive) │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
│         └─────────────────┼──────────────────┘          │
│                           │                             │
├───────────────────────────┼─────────────────────────────┤
│                    API Gateway                           │
│              Laravel (RESTful API)                       │
│         ┌─────────────────┼─────────────────┐           │
│         │                 │                 │           │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌───────┴─────┐    │
│  │ Auth & ACL  │  │  Business   │  │   Audit     │    │
│  │ Middleware  │  │  Logic      │  │   Logger    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                    Data Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   MySQL      │  │  File        │  │  Queue       │  │
│  │   Database   │  │  Storage     │  │  (Jobs)      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Tech Stack

| Layer            | Technology                                        |
| ---------------- | ------------------------------------------------- |
| **Frontend**     | React 18+ with TypeScript                         |
| **UI Framework** | Ant Design (RTL-native) + Custom Design System    |
| **State Mgmt**   | React Query (server state) + Zustand (UI state)   |
| **Backend**      | Laravel 12+ (PHP 8.3+)                            |
| **API Style**    | RESTful with JSON:API conventions                  |
| **Database**     | MySQL 8.0+                                        |
| **Auth**         | Laravel Sanctum (SPA token-based)                 |
| **Queue**        | Laravel Queue (database driver, Redis-ready)      |
| **Cache**        | File/Redis (configurable)                          |
| **File Storage** | Laravel Filesystem (local, S3-ready)              |
| **Search**       | MySQL Full-Text (Scout/Meilisearch-ready)         |
| **PDF/Export**   | DomPDF / Laravel Excel                            |
| **Localization** | i18next (frontend) / Laravel Lang (backend)       |

### 4.3 Deployment Model

| Parameter                | Value                                          |
| ------------------------ | ---------------------------------------------- |
| **Primary**              | Self-hosted / On-premise                       |
| **Architecture**         | Single server, multi-branch data isolation     |
| **Cloud Migration Path** | Containerized (Docker-ready), SaaS-extendable  |
| **Branch Isolation**     | Tenant-per-branch via `branch_id` scoping      |
| **Consolidated View**    | Owner role aggregates across all branches      |

---

## 5. Branch Architecture

### 5.1 Data Isolation Model

Every branch operates as an isolated data context. Core entities are scoped by `branch_id`:

- **Independent per branch**: Employees, Inventory, Purchases, Suppliers, Expenses, Sales, POS, Attendance, Payroll
- **Shared across branches**: Users (with branch assignments), Roles/Permissions, System Settings, Chart of Accounts template, Product catalog (optional)
- **Consolidated for owner**: Revenue, Expenses, Profit/Loss, Inventory valuation, Head count

### 5.2 Branch Scoping Strategy

```
Global Scope (no branch_id)
├── users
├── roles
├── permissions
├── system_settings
├── chart_of_accounts_templates
└── audit_logs (includes branch context)

Branch Scope (filtered by branch_id)
├── employees
├── attendance_records
├── payroll_runs
├── inventory_items
├── stock_movements
├── purchase_orders
├── suppliers (can be shared optionally)
├── customers
├── expenses
├── journal_entries
├── pos_orders
├── pos_sessions
└── daily_reports
```

---

## 6. Module Registry

| #  | Module        | Code     | Description                                    | Spec File              |
| -- | ------------- | -------- | ---------------------------------------------- | ---------------------- |
| 1  | HR            | `hr`     | Employee lifecycle, documents, contracts       | `MODULES/HR.md`        |
| 2  | Attendance    | `att`    | Clock in/out, shifts, overtime, absence        | `MODULES/Attendance.md`|
| 3  | Payroll       | `pay`    | Salary calculation, deductions, pay slips      | `MODULES/Payroll.md`   |
| 4  | Inventory     | `inv`    | Stock tracking, movements, counts, alerts      | `MODULES/Inventory.md` |
| 5  | Purchases     | `pur`    | Purchase orders, receiving, returns            | `MODULES/Purchases.md` |
| 6  | Suppliers     | `sup`    | Supplier profiles, contracts, evaluations      | `MODULES/Suppliers.md` |
| 7  | Customers     | `cust`   | Customer profiles, loyalty, history            | `MODULES/Customers.md` |
| 8  | Expenses      | `exp`    | Expense categories, recording, approval        | `MODULES/Expenses.md`  |
| 9  | Accounting    | `acc`    | Chart of accounts, journal, financial reports  | `MODULES/Accounting.md`|
| 10 | POS           | `pos`    | Order entry, payments, receipts, sessions      | `MODULES/POS.md`       |
| 11 | Reports       | `rpt`    | Cross-module analytics and export              | `MODULES/Reports.md`   |
| 12 | Settings      | `set`    | System configuration, branches, users, roles   | `MODULES/Settings.md`  |

---

## 7. User Roles

| Role             | Scope    | Primary Modules                                    |
| ---------------- | -------- | -------------------------------------------------- |
| **Owner**        | Global   | All modules, consolidated reports, system settings  |
| **Manager**      | Branch   | All branch modules, approvals, branch reports       |
| **Accountant**   | Branch   | Accounting, Expenses, Payroll, Reports              |
| **HR Officer**   | Branch   | HR, Attendance, Payroll                             |
| **Cashier**      | Branch   | POS, Customers                                      |
| **Purchasing**   | Branch   | Purchases, Suppliers, Inventory                     |
| **Data Entry**   | Branch   | Inventory, Expenses, limited module access          |
| **Viewer**       | Branch   | Read-only access to assigned modules                |

---

## 8. Non-Functional Requirements

### 8.1 Performance

- API response time: < 200ms for standard CRUD, < 2s for complex reports
- POS order creation: < 500ms end-to-end
- Dashboard load: < 3s with cached data
- Support 50+ concurrent users per branch
- Database queries must use indexes; no N+1 queries

### 8.2 Security

- All API endpoints authenticated (except login)
- Role-Based Access Control (RBAC) with granular permissions
- Branch-level data isolation enforced at query level (global scopes)
- All financial operations require double-entry audit trail
- Password hashing via bcrypt (cost factor 12)
- CSRF protection on all state-changing operations
- Rate limiting on authentication endpoints
- Input validation on every request (FormRequest classes)
- SQL injection prevention via Eloquent ORM / prepared statements
- XSS prevention via React's default escaping + server-side sanitization

### 8.3 Auditability

- Every create, update, delete operation logged with:
  - `user_id`, `branch_id`, `action`, `model`, `model_id`
  - `old_values`, `new_values` (JSON diff)
  - `ip_address`, `user_agent`, `timestamp`
- Financial transactions are immutable (soft-delete + reversal entries only)
- Audit logs are append-only, never deletable by any user role

### 8.4 Reliability

- Database transactions for all multi-step operations
- Optimistic locking on concurrent-edit-sensitive records
- Graceful error handling with structured error responses
- Automated database backups (configurable schedule)

### 8.5 Maintainability

- PSR-12 coding standard (PHP)
- ESLint + Prettier (TypeScript/React)
- Comprehensive PHPDoc and JSDoc documentation
- Feature-based code organization
- Repository pattern for data access
- Service layer for business logic
- Form Request classes for validation
- Resource classes for API responses

---

## 9. Directory Structure

### 9.1 Backend (Laravel)

```
backend/
├── app/
│   ├── Enums/                    # PHP enums for statuses, types
│   ├── Events/                   # Domain events
│   ├── Exceptions/               # Custom exception classes
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Hr/               # HR module controllers
│   │   │   ├── Attendance/       # Attendance module controllers
│   │   │   ├── Payroll/          # Payroll module controllers
│   │   │   ├── Inventory/        # Inventory module controllers
│   │   │   ├── Purchases/        # Purchases module controllers
│   │   │   ├── Suppliers/        # Suppliers module controllers
│   │   │   ├── Customers/        # Customers module controllers
│   │   │   ├── Expenses/         # Expenses module controllers
│   │   │   ├── Accounting/       # Accounting module controllers
│   │   │   ├── Pos/              # POS module controllers
│   │   │   ├── Reports/          # Reports module controllers
│   │   │   └── Settings/         # Settings module controllers
│   │   ├── Middleware/           # Custom middleware
│   │   ├── Requests/             # Form Request validation classes
│   │   └── Resources/            # API Resource transformers
│   ├── Listeners/                # Event listeners
│   ├── Models/                   # Eloquent models
│   │   ├── Traits/               # Model traits (HasBranch, Auditable)
│   │   └── Scopes/               # Global & local scopes
│   ├── Observers/                # Model observers
│   ├── Policies/                 # Authorization policies
│   ├── Repositories/             # Repository interfaces & implementations
│   ├── Services/                 # Business logic services
│   └── Support/                  # Helpers, utilities, value objects
├── config/                       # Configuration files
├── database/
│   ├── factories/                # Model factories (testing)
│   ├── migrations/               # Timestamped migrations
│   └── seeders/                  # Database seeders
├── routes/
│   └── api.php                   # API route definitions
├── storage/                      # File storage, logs
└── tests/                        # Feature & unit tests
```

### 9.2 Frontend (React)

```
frontend/
├── public/
│   ├── locales/
│   │   ├── ar/                   # Arabic translations
│   │   └── en/                   # English translations
│   └── index.html
├── src/
│   ├── api/                      # API client & endpoint definitions
│   ├── assets/                   # Static assets (images, fonts)
│   ├── components/
│   │   ├── common/               # Shared UI components
│   │   ├── layout/               # App shell, sidebar, header
│   │   └── modules/              # Module-specific components
│   │       ├── hr/
│   │       ├── attendance/
│   │       ├── payroll/
│   │       ├── inventory/
│   │       ├── purchases/
│   │       ├── suppliers/
│   │       ├── customers/
│   │       ├── expenses/
│   │       ├── accounting/
│   │       ├── pos/
│   │       ├── reports/
│   │       └── settings/
│   ├── config/                   # App configuration
│   ├── hooks/                    # Custom React hooks
│   ├── i18n/                     # i18n configuration
│   ├── pages/                    # Page-level components (routes)
│   ├── store/                    # Zustand stores
│   ├── styles/                   # Global styles, theme
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Utility functions
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 10. API Conventions

### 10.1 URL Structure

```
/api/v1/{module}/{resource}
/api/v1/{module}/{resource}/{id}
/api/v1/{module}/{resource}/{id}/{sub-resource}
```

### 10.2 Standard Response Format

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "meta": {
    "current_page": 1,
    "per_page": 25,
    "total": 150,
    "last_page": 6
  }
}
```

### 10.3 Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "field_name": ["Error message 1", "Error message 2"]
  },
  "error_code": "VALIDATION_ERROR"
}
```

### 10.4 HTTP Methods

| Method   | Purpose            | Example                              |
| -------- | ------------------ | ------------------------------------ |
| `GET`    | Retrieve           | `GET /api/v1/hr/employees`           |
| `POST`   | Create             | `POST /api/v1/hr/employees`          |
| `PUT`    | Full update        | `PUT /api/v1/hr/employees/1`         |
| `PATCH`  | Partial update     | `PATCH /api/v1/hr/employees/1`       |
| `DELETE` | Soft delete        | `DELETE /api/v1/hr/employees/1`      |

---

## 11. Development Phases

### Phase 1 — Foundation (Weeks 1–3)
- Project scaffolding (Laravel + React)
- Authentication & authorization system
- Branch management & data isolation
- Audit logging infrastructure
- Base UI layout with RTL support
- Settings module

### Phase 2 — HR Core (Weeks 4–6)
- HR module (employee management)
- Attendance module
- Payroll module

### Phase 3 — Supply Chain (Weeks 7–9)
- Inventory module
- Purchases module
- Suppliers module

### Phase 4 — Finance (Weeks 10–12)
- Accounting module (Chart of Accounts, Journal Entries)
- Expenses module
- Customers module

### Phase 5 — Operations (Weeks 13–15)
- POS module
- Reports module
- Dashboard & analytics

### Phase 6 — Polish & Deploy (Weeks 16–18)
- Integration testing
- Performance optimization
- Security audit
- Deployment automation
- User documentation

---

## 12. References

All development must comply with:

- `AI_RULES/01_Master_Rules.md` — Overarching development principles
- `AI_RULES/02_Backend_Standards.md` — Laravel/PHP standards
- `AI_RULES/03_Frontend_Standards.md` — React/TypeScript standards
- `AI_RULES/04_Database_Standards.md` — MySQL schema & query standards
- `AI_RULES/05_UI_UX_Standards.md` — Interface design standards
- `AI_RULES/06_Security_Standards.md` — Security requirements
- `AI_RULES/07_Naming_Convention.md` — Naming rules across all layers
- `AI_RULES/08_Code_Style.md` — Formatting and style enforcement
- `AI_RULES/09_Deployment.md` — Deployment and DevOps standards
