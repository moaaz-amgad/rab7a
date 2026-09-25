# 02 — Backend Standards (Laravel / PHP)

> All backend code must follow these standards. No exceptions.

---

## 1. PHP Version & Configuration

- **PHP**: 8.3+ (strict types enabled in every file)
- **Laravel**: 12+
- Every PHP file must begin with `declare(strict_types=1);`
- Use PHP 8.3 features: enums, readonly properties, typed properties, named arguments, match expressions, fibers where appropriate.

---

## 2. Laravel Project Structure

### 2.1 Controllers

```php
// Location: app/Http/Controllers/{Module}/
// Naming: {Entity}Controller.php
// Example: app/Http/Controllers/Hr/EmployeeController.php

declare(strict_types=1);

namespace App\Http\Controllers\Hr;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hr\StoreEmployeeRequest;
use App\Http\Requests\Hr\UpdateEmployeeRequest;
use App\Http\Resources\Hr\EmployeeResource;
use App\Http\Resources\Hr\EmployeeCollection;
use App\Services\Hr\EmployeeService;
use Illuminate\Http\JsonResponse;

final class EmployeeController extends Controller
{
    public function __construct(
        private readonly EmployeeService $employeeService,
    ) {}

    public function index(): EmployeeCollection
    {
        $this->authorize('viewAny', Employee::class);
        $employees = $this->employeeService->list(request()->validated());
        return new EmployeeCollection($employees);
    }

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $employee = $this->employeeService->create($request->validated());
        return EmployeeResource::make($employee)
            ->response()
            ->setStatusCode(201);
    }

    public function show(Employee $employee): EmployeeResource
    {
        $this->authorize('view', $employee);
        return EmployeeResource::make(
            $this->employeeService->find($employee->id)
        );
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): EmployeeResource
    {
        $employee = $this->employeeService->update($employee->id, $request->validated());
        return EmployeeResource::make($employee);
    }

    public function destroy(Employee $employee): JsonResponse
    {
        $this->authorize('delete', $employee);
        $this->employeeService->delete($employee->id);
        return response()->json(['success' => true, 'message' => __('hr.employee.deleted')]);
    }
}
```

**Controller Rules:**
- Controllers are `final` classes.
- Maximum 7 methods: `index`, `store`, `show`, `update`, `destroy` + up to 2 custom actions.
- If more actions needed, create a separate controller (e.g., `EmployeeStatusController`).
- No business logic in controllers — delegate to Services.
- No direct Eloquent queries — use Services.
- Always use FormRequest for validation.
- Always use Resources for response transformation.
- Always check authorization via `$this->authorize()` or Policy.

### 2.2 Services

```php
// Location: app/Services/{Module}/
// Naming: {Entity}Service.php
// Example: app/Services/Hr/EmployeeService.php

declare(strict_types=1);

namespace App\Services\Hr;

use App\Repositories\Hr\EmployeeRepositoryInterface;
use App\Models\Hr\Employee;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

final class EmployeeService
{
    public function __construct(
        private readonly EmployeeRepositoryInterface $employeeRepository,
    ) {}

    public function list(array $filters): LengthAwarePaginator
    {
        return $this->employeeRepository->paginate($filters);
    }

    public function create(array $data): Employee
    {
        return DB::transaction(function () use ($data) {
            $employee = $this->employeeRepository->create($data);
            // Additional business logic (e.g., create default records)
            return $employee;
        });
    }

    public function update(int $id, array $data): Employee
    {
        return DB::transaction(function () use ($id, $data) {
            $employee = $this->employeeRepository->update($id, $data);
            // Additional business logic
            return $employee;
        });
    }

    public function delete(int $id): bool
    {
        return DB::transaction(function () use ($id) {
            return $this->employeeRepository->delete($id);
        });
    }
}
```

**Service Rules:**
- Services are `final` classes.
- All business logic lives here — calculations, validations beyond form rules, workflow orchestration.
- Use database transactions for operations affecting multiple records/tables.
- Services may call other services for cross-module operations.
- No HTTP-specific code (no Request, Response objects).
- Return models, collections, or value objects — never raw arrays for complex data.

### 2.3 Repositories

```php
// Location: app/Repositories/{Module}/
// Interface: {Entity}RepositoryInterface.php
// Implementation: Eloquent{Entity}Repository.php

// Interface
declare(strict_types=1);

namespace App\Repositories\Hr;

use App\Models\Hr\Employee;
use Illuminate\Pagination\LengthAwarePaginator;

interface EmployeeRepositoryInterface
{
    public function paginate(array $filters): LengthAwarePaginator;
    public function findById(int $id): Employee;
    public function create(array $data): Employee;
    public function update(int $id, array $data): Employee;
    public function delete(int $id): bool;
}

// Implementation
declare(strict_types=1);

namespace App\Repositories\Hr;

use App\Models\Hr\Employee;
use Illuminate\Pagination\LengthAwarePaginator;

final class EloquentEmployeeRepository implements EmployeeRepositoryInterface
{
    public function __construct(
        private readonly Employee $model,
    ) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = $this->model->query();

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name_ar', 'LIKE', "%{$filters['search']}%")
                  ->orWhere('name_en', 'LIKE', "%{$filters['search']}%")
                  ->orWhere('employee_number', 'LIKE', "%{$filters['search']}%");
            });
        }

        if (isset($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        return $query->paginate($filters['per_page'] ?? 25);
    }

    // ... other methods
}
```

**Repository Rules:**
- Always define an interface + concrete implementation.
- Bind interface to implementation in a ServiceProvider.
- All Eloquent queries go here — nowhere else.
- Repositories handle filtering, sorting, pagination, eager loading.
- Never return query builders — always return models, collections, or paginators.

### 2.4 Models

```php
// Location: app/Models/{Module}/
// Naming: {Entity}.php (singular, PascalCase)

declare(strict_types=1);

namespace App\Models\Hr;

use App\Models\Traits\HasBranch;
use App\Models\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Employee extends Model
{
    use HasFactory;
    use SoftDeletes;
    use HasBranch;     // Auto-scopes by branch_id
    use Auditable;     // Auto-logs changes

    protected $table = 'employees';

    protected $fillable = [
        'branch_id',
        'employee_number',
        'name_ar',
        'name_en',
        'national_id',
        'phone',
        'email',
        'department_id',
        'job_title_id',
        'hire_date',
        'base_salary',   // Stored in piasters (integer)
        'status',
    ];

    protected $casts = [
        'hire_date' => 'date',
        'base_salary' => 'integer',
        'status' => EmployeeStatus::class,  // PHP Enum
    ];

    // --- Relationships ---

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    // --- Accessors ---

    /**
     * Get base salary in EGP (display value).
     * Internal storage is in piasters.
     */
    public function getBaseSalaryEgpAttribute(): float
    {
        return $this->base_salary / 100;
    }
}
```

**Model Rules:**
- Models are `final` classes.
- Use `SoftDeletes` on all business entities.
- Use `HasBranch` trait for branch-scoped models.
- Use `Auditable` trait for audit logging.
- Define `$fillable` explicitly — never use `$guarded = []`.
- Define `$casts` for all non-string columns.
- Use PHP Enums for status/type fields.
- No business logic in models — only relationships, scopes, accessors, mutators.
- Monetary values stored as integers (piasters), display conversion via accessors.

### 2.5 Form Requests

```php
// Location: app/Http/Requests/{Module}/
// Naming: Store{Entity}Request.php, Update{Entity}Request.php

declare(strict_types=1);

namespace App\Http\Requests\Hr;

use App\Enums\Hr\EmployeeStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

final class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Employee::class);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name_ar' => ['required', 'string', 'max:255'],
            'name_en' => ['required', 'string', 'max:255'],
            'national_id' => [
                'required',
                'string',
                'size:14',
                Rule::unique('employees')->where('branch_id', $this->user()->branch_id),
            ],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'job_title_id' => ['required', 'integer', 'exists:job_titles,id'],
            'hire_date' => ['required', 'date', 'before_or_equal:today'],
            'base_salary' => ['required', 'integer', 'min:0'],  // In piasters
            'status' => ['required', new Enum(EmployeeStatus::class)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'national_id.size' => __('hr.validation.national_id_length'),
            'national_id.unique' => __('hr.validation.national_id_unique'),
        ];
    }
}
```

**FormRequest Rules:**
- One FormRequest per action (Store, Update).
- Authorization check in `authorize()` method.
- Comprehensive validation rules — validate everything.
- Custom error messages using localization.
- Use `Rule::unique()` with branch scope where applicable.

### 2.6 API Resources

```php
// Location: app/Http/Resources/{Module}/
// Naming: {Entity}Resource.php, {Entity}Collection.php

declare(strict_types=1);

namespace App\Http\Resources\Hr;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class EmployeeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_number' => $this->employee_number,
            'name_ar' => $this->name_ar,
            'name_en' => $this->name_en,
            'national_id' => $this->when(
                $request->user()->can('viewSensitive', $this->resource),
                $this->national_id
            ),
            'phone' => $this->phone,
            'email' => $this->email,
            'department' => DepartmentResource::make($this->whenLoaded('department')),
            'job_title' => JobTitleResource::make($this->whenLoaded('jobTitle')),
            'hire_date' => $this->hire_date->format('Y-m-d'),
            'base_salary' => $this->when(
                $request->user()->can('viewSalary', $this->resource),
                $this->base_salary
            ),
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
```

**Resource Rules:**
- Sensitive fields conditionally included based on permissions.
- Use `whenLoaded()` for relationships to avoid N+1.
- Format dates consistently (ISO 8601 for timestamps, Y-m-d for dates).
- Include computed/display fields (e.g., `status_label`).
- Never expose internal implementation details (pivots, raw foreign keys without context).

---

## 3. Enums

```php
// Location: app/Enums/{Module}/
// Naming: {Entity}{Field}.php (e.g., EmployeeStatus.php)

declare(strict_types=1);

namespace App\Enums\Hr;

enum EmployeeStatus: string
{
    case Active = 'active';
    case OnLeave = 'on_leave';
    case Suspended = 'suspended';
    case Terminated = 'terminated';
    case Resigned = 'resigned';

    public function label(): string
    {
        return match ($this) {
            self::Active => __('hr.status.active'),
            self::OnLeave => __('hr.status.on_leave'),
            self::Suspended => __('hr.status.suspended'),
            self::Terminated => __('hr.status.terminated'),
            self::Resigned => __('hr.status.resigned'),
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Active => 'green',
            self::OnLeave => 'orange',
            self::Suspended => 'red',
            self::Terminated => 'gray',
            self::Resigned => 'gray',
        };
    }

    /**
     * Statuses that count as "currently employed".
     * @return array<self>
     */
    public static function employed(): array
    {
        return [self::Active, self::OnLeave, self::Suspended];
    }
}
```

---

## 4. Error Handling

### 4.1 Custom Exceptions

```php
// Location: app/Exceptions/

declare(strict_types=1);

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

final class BusinessException extends HttpException
{
    public function __construct(
        string $message,
        private readonly string $errorCode,
        int $statusCode = 422,
        ?\Throwable $previous = null,
    ) {
        parent::__construct($statusCode, $message, $previous);
    }

    public function getErrorCode(): string
    {
        return $this->errorCode;
    }
}
```

### 4.2 Global Exception Handler

- Return JSON for API requests.
- Log full stack trace internally.
- Never expose internal details to client.
- Map exceptions to appropriate HTTP status codes:
  - `ValidationException` → 422
  - `AuthenticationException` → 401
  - `AuthorizationException` → 403
  - `ModelNotFoundException` → 404
  - `BusinessException` → 422 (with error code)
  - `QueryException` → 500 (logged, generic message to client)
  - All others → 500 (logged, generic message to client)

---

## 5. Middleware Standards

### 5.1 Required Middleware Stack

| Middleware            | Purpose                                         |
| --------------------- | ----------------------------------------------- |
| `auth:sanctum`        | Authentication verification                     |
| `SetBranchContext`    | Resolve and set active branch from user session  |
| `CheckPermission`     | Verify user has required permission              |
| `AuditRequest`        | Log API request metadata                         |
| `ForceJsonResponse`   | Ensure all responses are JSON                    |
| `SetLocale`           | Set app locale from user preference / header     |
| `ThrottleRequests`    | Rate limiting                                    |

### 5.2 Branch Context Middleware

```php
// Always resolves branch_id from the authenticated user's session.
// NEVER trusts a client-sent branch_id for scoping.
// Owner users may switch branches via a dedicated endpoint.
```

---

## 6. Queue & Jobs

- Use Laravel's queue system for:
  - Report generation (PDF/Excel)
  - Bulk data imports
  - Email/notification sending
  - Heavy calculations (payroll processing)
  - Backup operations
- Default driver: `database` (easy setup, Redis-ready for scaling).
- Every job must implement `ShouldQueue` and define `$tries`, `$timeout`, `$backoff`.
- Failed jobs must be logged and retriable.

---

## 7. Caching Strategy

| Data Type              | Cache Duration | Invalidation Trigger        |
| ---------------------- | -------------- | --------------------------- |
| System settings        | 24 hours       | On settings update          |
| User permissions       | 1 hour         | On role/permission change   |
| Branch list            | 24 hours       | On branch create/update     |
| Chart of accounts      | 12 hours       | On account create/update    |
| Menu categories/items  | 6 hours        | On menu update              |
| Dashboard stats        | 5 minutes      | TTL-based                   |

- Use cache tags for group invalidation.
- Never cache user-specific or frequently-changing data.
- Cache keys must include `branch_id` for branch-scoped data.

---

## 8. Logging Standards

- Use Laravel's logging with daily rotation.
- Log levels:
  - `emergency`: System is unusable
  - `critical`: Critical conditions (database down)
  - `error`: Runtime errors that need attention
  - `warning`: Unusual but handled situations
  - `info`: Significant events (user login, payroll run)
  - `debug`: Detailed debugging (only in development)
- Include context in every log entry: `user_id`, `branch_id`, `action`.
- Never log sensitive data: passwords, tokens, full credit card numbers.
- Separate channels for: application, audit, security, performance.
