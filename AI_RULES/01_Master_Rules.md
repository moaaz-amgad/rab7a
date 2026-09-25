# 01 — Master Rules

> These rules override all other documents. Every AI agent, developer, and contributor must follow them without exception.

---

## 1. Project Classification

This is a **commercial, production-grade restaurant ERP system**. It is NOT a demo, prototype, portfolio piece, or academic project.

Every line of code will be used in a live business environment. Act accordingly.

---

## 2. Core Principles

### 2.1 No Shortcuts

- Never generate placeholder, stub, or TODO implementations in production code.
- Never use `dd()`, `console.log()` for debugging in committed code.
- Never hardcode values that should be configurable.
- Never skip validation, error handling, or edge cases.
- Never use simplified calculations where precision is required.

### 2.2 Financial Accuracy

- All monetary values stored as integers (smallest currency unit: piasters for EGP, 1 EGP = 100 piasters).
- All monetary calculations performed in integer arithmetic — no floating-point math.
- Display formatting happens at the presentation layer only.
- Every financial operation must produce a double-entry accounting record.
- Rounding rules must be explicit and consistent (banker's rounding).
- Tax calculations follow Egyptian tax law precisely.

### 2.3 Data Integrity

- Every database write must be wrapped in a transaction when multiple tables are affected.
- Foreign key constraints are mandatory — no orphaned records.
- Soft deletes for all business entities — hard deletes only for draft/temp data.
- Optimistic locking on concurrently-edited records.
- Unique constraints enforced at the database level, not just application level.

### 2.4 Complete Audit Trail

Every action that creates, modifies, or deletes data must be logged with:

| Field          | Description                               |
| -------------- | ----------------------------------------- |
| `user_id`      | Who performed the action                  |
| `branch_id`    | Which branch context                      |
| `action`       | create / update / delete / restore        |
| `auditable_type` | Model class name                        |
| `auditable_id`   | Record ID                               |
| `old_values`   | Previous state (JSON)                     |
| `new_values`   | New state (JSON)                          |
| `ip_address`   | Client IP                                |
| `user_agent`   | Client browser/device                     |
| `url`          | Request URL                               |
| `created_at`   | Timestamp (UTC)                           |

Audit logs are **append-only** and **immutable**. No user role may delete audit records.

### 2.5 Branch Isolation

- Every branch-scoped query MUST include `branch_id` filtering.
- Use Laravel Global Scopes to enforce branch isolation automatically.
- Never trust client-sent `branch_id` — resolve from authenticated user's session.
- Owner role can override branch scope for consolidated views.
- Cross-branch data access must be explicit and logged.

---

## 3. Architecture Mandates

### 3.1 Separation of Concerns

```
Controller → Service → Repository → Model
     ↑            ↑           ↑
  Validation   Business    Data Access
  (FormRequest) Logic      (Eloquent)
```

- **Controllers**: Receive requests, validate via FormRequest, delegate to Services, return Resources.
- **Services**: Contain all business logic. No Eloquent queries directly in services — use Repositories.
- **Repositories**: Data access abstraction. All database queries go here.
- **Models**: Define relationships, scopes, casts, accessors/mutators. No business logic.
- **Resources**: Transform models to API responses. No business logic.
- **FormRequests**: Validate incoming data. Authorization checks allowed here.
- **Policies**: Authorize user actions on specific models.
- **Observers**: React to model lifecycle events (creating, updating, deleting).
- **Events/Listeners**: Decouple side effects from main operations.

### 3.2 API Design

- All APIs are RESTful and stateless.
- Version prefix: `/api/v1/`
- Authentication: Laravel Sanctum (SPA cookie-based for frontend, token-based for external).
- Every endpoint must specify required permissions.
- Pagination required for all list endpoints (default: 25, max: 100).
- Filtering, sorting, and searching via query parameters.
- Consistent response envelope (see PROJECT.md §10).

### 3.3 Error Handling

- Never expose internal errors, stack traces, or database details to the client.
- Use custom exception classes with error codes.
- Return structured error responses with appropriate HTTP status codes.
- Log all exceptions with full context (but sanitize sensitive data).
- Implement global exception handler in Laravel.

### 3.4 Testing Requirements

- Every Service method must have a corresponding unit test.
- Every API endpoint must have a feature test covering:
  - Success case
  - Validation failure
  - Authorization failure
  - Edge cases
- Financial calculations must have exhaustive test coverage.
- Factories for all models using realistic data.

---

## 4. Localization Rules

### 4.1 General

- All user-facing strings must be translatable — never hardcode display text.
- Backend: Use Laravel's `__()` / `trans()` helpers.
- Frontend: Use i18next `t()` function.
- Date display: Localized format (Arabic: `dd/MM/yyyy`, English: `MM/dd/yyyy`).
- Number display: Support Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) as user preference.
- Currency display: `EGP` symbol or `ج.م` based on locale.

### 4.2 RTL Support

- The entire UI must function correctly in RTL mode.
- Use logical CSS properties (`margin-inline-start` not `margin-left`).
- Icons with directional meaning must flip in RTL.
- Text alignment must respect document direction.
- Test every component in both LTR and RTL.

---

## 5. Performance Standards

| Metric                        | Target       |
| ----------------------------- | ------------ |
| API response (simple CRUD)    | < 200ms      |
| API response (complex report) | < 2,000ms    |
| POS order creation            | < 500ms      |
| Dashboard initial load        | < 3,000ms    |
| Database query                | < 100ms      |
| Frontend bundle (gzipped)     | < 500KB      |

### 5.1 Backend Performance

- Eager load relationships to prevent N+1 queries.
- Use database indexes on all filtered/sorted columns.
- Cache frequently-accessed, rarely-changed data (settings, permissions, menu items).
- Use pagination — never load unbounded result sets.
- Use queued jobs for heavy operations (report generation, bulk imports, email).

### 5.2 Frontend Performance

- Code split by route (lazy loading).
- Use React Query for server state caching and deduplication.
- Virtualize long lists (react-window or similar).
- Optimize images and assets.
- Debounce search inputs and expensive computations.

---

## 6. Git & Version Control

- **Branch Strategy**: `main` (production) → `develop` (staging) → `feature/*`, `fix/*`, `hotfix/*`
- **Commit Messages**: Conventional Commits format (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`)
- **Pull Requests**: Required for all changes to `develop` and `main`.
- **Code Review**: Mandatory before merge.
- **No force pushes** to `main` or `develop`.

---

## 7. Documentation Requirements

- Every API endpoint documented with request/response examples.
- Every Service class must have a class-level docblock explaining its purpose.
- Every complex algorithm or business rule must have inline documentation.
- Database migrations must include comments explaining the purpose of each table/column.
- README files in each major directory explaining its contents.

---

## 8. Rule Precedence

When rules conflict, apply this precedence (highest first):

1. **Security** — Never compromise security for any reason.
2. **Data Integrity** — Financial accuracy and data consistency are paramount.
3. **Auditability** — Every action must be traceable.
4. **Performance** — Fast response times for end users.
5. **Maintainability** — Clean, documented, testable code.
6. **Developer Experience** — Consistent patterns and conventions.
