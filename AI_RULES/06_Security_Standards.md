# 06 — Security Standards

> Security is the highest priority. Every rule here is mandatory. No exceptions, no shortcuts.

---

## 1. Authentication

### 1.1 Authentication Method

- **Laravel Sanctum** for SPA authentication (cookie-based for frontend, token-based for API).
- Session-based authentication for the React SPA (CSRF-protected).
- API tokens for external integrations (if needed in future).

### 1.2 Login Security

| Control                    | Requirement                                          |
| -------------------------- | ---------------------------------------------------- |
| **Password hashing**       | bcrypt with cost factor 12                           |
| **Minimum password length**| 8 characters                                         |
| **Password complexity**    | At least 1 uppercase, 1 lowercase, 1 digit           |
| **Login rate limiting**    | 5 attempts per minute per IP/username                 |
| **Account lockout**        | Lock after 10 failed attempts, unlock after 30 min   |
| **Session timeout**        | 8 hours of inactivity (configurable)                  |
| **Concurrent sessions**    | Configurable — default: allow multiple                |
| **Login logging**          | Every login attempt logged (success and failure)      |

### 1.3 Session Management

```php
// Session security configuration
'session' => [
    'lifetime' => 480,           // 8 hours
    'expire_on_close' => false,
    'encrypt' => true,
    'secure' => true,            // HTTPS only in production
    'http_only' => true,         // No JavaScript access
    'same_site' => 'lax',       // CSRF protection
],
```

### 1.4 Password Reset

- Reset tokens expire after 60 minutes.
- One-time use — token invalidated after use.
- Notify user on password change (email or in-app notification).
- Log all password reset attempts.

---

## 2. Authorization (RBAC)

### 2.1 Permission Model

```
User → belongs to → Role(s)
Role → has many → Permission(s)
User → has many → Branch(es)
```

### 2.2 Permission Granularity

Permissions follow the pattern: `{module}.{resource}.{action}`

```
hr.employees.view
hr.employees.create
hr.employees.update
hr.employees.delete
hr.employees.view_salary     # Sensitive data access
hr.employees.export

attendance.records.view
attendance.records.create
attendance.records.update

payroll.runs.view
payroll.runs.create
payroll.runs.approve         # Workflow action
payroll.runs.process         # Execute payroll

inventory.items.view
inventory.items.create
inventory.items.update
inventory.items.delete
inventory.adjustments.create  # Stock adjustments

purchases.orders.view
purchases.orders.create
purchases.orders.approve
purchases.orders.receive

accounting.journal.view
accounting.journal.create
accounting.journal.approve
accounting.reports.view       # Financial reports

pos.orders.create
pos.orders.void
pos.sessions.open
pos.sessions.close
pos.cash_drawer.view

settings.branches.manage
settings.users.manage
settings.roles.manage
settings.system.manage
```

### 2.3 Default Roles & Permissions

| Role         | Permissions Summary                                         |
| ------------ | ----------------------------------------------------------- |
| **Owner**    | All permissions across all branches                         |
| **Manager**  | All permissions within assigned branch (except system settings) |
| **Accountant**| Accounting full, Expenses full, Payroll view, Reports view |
| **HR Officer**| HR full, Attendance full, Payroll create/view              |
| **Cashier**  | POS full, Customers view                                    |
| **Purchasing**| Purchases full, Suppliers full, Inventory view/update      |
| **Data Entry**| Inventory create/update, Expenses create                   |
| **Viewer**   | View-only on assigned modules                               |

### 2.4 Authorization Enforcement

**Three layers of enforcement:**

1. **Route Middleware** — Check permission before controller executes.
2. **Policy Classes** — Check resource-level access (e.g., "can this user edit THIS employee?").
3. **Global Scope** — Branch isolation at query level (user can only see their branch's data).

```php
// Layer 1: Route middleware
Route::middleware(['auth:sanctum', 'permission:hr.employees.view'])
    ->get('/hr/employees', [EmployeeController::class, 'index']);

// Layer 2: Policy
class EmployeePolicy
{
    public function view(User $user, Employee $employee): bool
    {
        return $user->hasPermission('hr.employees.view')
            && $user->belongsToBranch($employee->branch_id);
    }

    public function viewSalary(User $user, Employee $employee): bool
    {
        return $user->hasPermission('hr.employees.view_salary')
            && $user->belongsToBranch($employee->branch_id);
    }
}

// Layer 3: Global scope (HasBranch trait)
// Automatically filters all queries by user's branch_id
```

---

## 3. Input Validation & Sanitization

### 3.1 Validation Rules

- **Every** API endpoint must validate ALL input via Laravel FormRequest.
- **Type validation**: Ensure correct types (string, integer, date, etc.).
- **Length validation**: Max length on all string fields.
- **Format validation**: Regex for structured data (phone, national ID, email).
- **Range validation**: Min/max for numeric fields.
- **Existence validation**: `exists:table,column` for foreign keys.
- **Uniqueness validation**: `unique:table,column` with proper scoping.
- **Custom validation**: Business rules implemented as custom rules.

### 3.2 Sanitization

```php
// Input sanitization (applied before validation)
// Implemented via middleware or FormRequest prepareForValidation()

public function prepareForValidation(): void
{
    $this->merge([
        'name_ar' => strip_tags(trim($this->name_ar ?? '')),
        'name_en' => strip_tags(trim($this->name_en ?? '')),
        'email' => strtolower(trim($this->email ?? '')),
        'phone' => preg_replace('/[^0-9+]/', '', $this->phone ?? ''),
    ]);
}
```

### 3.3 SQL Injection Prevention

- **Always** use Eloquent ORM or query builder with parameter binding.
- **Never** concatenate user input into raw SQL.
- **Never** use `DB::raw()` with user input.
- If raw expressions are necessary, use `DB::raw()` with bindings.

### 3.4 XSS Prevention

- React escapes output by default — **never** use `dangerouslySetInnerHTML`.
- Server-side: Strip HTML tags from all text inputs.
- Content-Security-Policy header to restrict script sources.
- HttpOnly cookies for session tokens.

---

## 4. CSRF Protection

- Laravel's CSRF middleware enabled for all state-changing requests.
- Sanctum SPA authentication handles CSRF automatically.
- Frontend must call `/sanctum/csrf-cookie` before authentication.
- CSRF token rotated on login.

---

## 5. Rate Limiting

### 5.1 Rate Limit Configuration

| Endpoint Category  | Limit                    | Window   |
| ------------------ | ------------------------ | -------- |
| **Login**          | 5 requests               | 1 minute |
| **Password Reset** | 3 requests               | 1 minute |
| **API (general)**  | 120 requests             | 1 minute |
| **API (reports)**  | 10 requests              | 1 minute |
| **File upload**    | 10 requests              | 1 minute |
| **Export**         | 5 requests               | 1 minute |

### 5.2 Implementation

```php
// RouteServiceProvider or bootstrap/app.php
RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
});

RateLimiter::for('login', function (Request $request) {
    return Limit::perMinute(5)->by($request->input('username') . '|' . $request->ip());
});

RateLimiter::for('reports', function (Request $request) {
    return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
});
```

---

## 6. Data Protection

### 6.1 Sensitive Data Classification

| Classification   | Examples                              | Handling                       |
| ---------------- | ------------------------------------- | ------------------------------ |
| **Highly Sensitive** | Passwords, tokens                | Hashed/encrypted, never logged |
| **Sensitive**    | National IDs, salaries, bank details  | Encrypted at rest, access-logged, masked in UI |
| **Internal**     | Employee names, department data       | Standard access control        |
| **Public**       | Branch names, menu items              | No special handling            |

### 6.2 Encryption

- Passwords: bcrypt (cost 12) — never reversible.
- Sensitive fields (national ID, bank details): Laravel `encrypted` cast.
- Database backups: Encrypted at rest.
- API communication: HTTPS only in production (TLS 1.2+).

### 6.3 Data Masking

```php
// In API Resources, mask sensitive data
'national_id' => $this->when(
    $request->user()->can('viewSensitive', $this->resource),
    $this->national_id,
    fn() => '****' . substr($this->national_id, -4)
),
```

---

## 7. Financial Security

### 7.1 Transaction Integrity

- All financial operations use database transactions.
- Double-entry bookkeeping — every debit has a matching credit.
- Journal entries are immutable — corrections via reversal entries only.
- Financial records are never hard-deleted — soft-delete + reversal.
- Payroll processing requires explicit approval before execution.
- POS void/refund requires manager authorization.

### 7.2 Amount Validation

```php
// Validate that debits equal credits in journal entries
public function validateJournalBalance(array $lines): void
{
    $totalDebits = array_sum(array_column($lines, 'debit_amount'));
    $totalCredits = array_sum(array_column($lines, 'credit_amount'));

    if ($totalDebits !== $totalCredits) {
        throw new BusinessException(
            __('accounting.journal.unbalanced'),
            'JOURNAL_UNBALANCED',
            422
        );
    }
}
```

---

## 8. API Security Headers

```php
// Required response headers (via middleware)
return $next($request)
    ->header('X-Content-Type-Options', 'nosniff')
    ->header('X-Frame-Options', 'DENY')
    ->header('X-XSS-Protection', '1; mode=block')
    ->header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    ->header('Content-Security-Policy', "default-src 'self'")
    ->header('Referrer-Policy', 'strict-origin-when-cross-origin')
    ->header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
```

---

## 9. Audit & Security Logging

### 9.1 Security Events (Always Logged)

| Event                    | Logged Data                                    |
| ------------------------ | ---------------------------------------------- |
| Login success            | User ID, IP, user agent, timestamp             |
| Login failure            | Username attempted, IP, user agent, timestamp  |
| Logout                   | User ID, IP, timestamp                         |
| Password change          | User ID, IP, timestamp                         |
| Permission denied        | User ID, resource, action, IP, timestamp       |
| Branch switch            | User ID, from branch, to branch, timestamp     |
| Role/permission change   | User ID, target user, changes, timestamp       |
| Sensitive data access    | User ID, data type, record ID, timestamp       |
| Export operation          | User ID, data type, record count, timestamp    |

### 9.2 Security Log Storage

- Security logs stored in a separate database table (`security_logs`).
- Security logs are **append-only** — no update or delete operations.
- Retention: Minimum 2 years.
- Accessible only to Owner role.

---

## 10. File Upload Security

### 10.1 Upload Restrictions

| Rule                     | Requirement                                    |
| ------------------------ | ---------------------------------------------- |
| **Allowed types**        | jpg, jpeg, png, pdf, xlsx, xls, csv, doc, docx |
| **Max file size**        | 10MB (configurable)                            |
| **Filename sanitization**| Remove special characters, generate UUID name  |
| **Storage location**     | Outside web root (Laravel storage)             |
| **MIME validation**      | Validate actual content, not just extension     |
| **Virus scanning**       | Recommended for production (ClamAV or similar) |

### 10.2 Implementation

```php
// File upload validation
'document' => [
    'required',
    'file',
    'max:10240',  // 10MB
    'mimes:jpg,jpeg,png,pdf,xlsx,xls,csv,doc,docx',
],

// Storage: Never in public directory
$path = $request->file('document')->store(
    "branches/{$branchId}/employees/{$employeeId}/documents",
    'local'  // Private disk
);
```

---

## 11. Environment Security

### 11.1 Environment Variables

- **Never** commit `.env` file to version control.
- **Never** hardcode secrets, API keys, or credentials in code.
- **Always** use `config()` helper to access environment values (not `env()` directly in code).
- Sensitive config values should be documented in `.env.example` with placeholder values.

### 11.2 Production Checklist

- [ ] `APP_DEBUG=false`
- [ ] `APP_ENV=production`
- [ ] Strong `APP_KEY` generated
- [ ] Database credentials use least-privilege account
- [ ] HTTPS enforced
- [ ] CORS configured for specific domains only
- [ ] Error pages show no stack traces
- [ ] Log files not publicly accessible
- [ ] File permissions properly set (storage, cache)
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Backup encryption enabled
- [ ] Database access restricted by IP/firewall
