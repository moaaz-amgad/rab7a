<?php

declare(strict_types=1);

namespace App\Models\Hr;

use App\Enums\Hr\EmployeeStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class Employee extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'employees';

    protected $fillable = [
        'branch_id',
        'employee_number',
        'name_ar',
        'name_en',
        'nickname',
        'national_id',
        'phone',
        'phone_secondary',
        'email',
        'address',
        'date_of_birth',
        'gender',
        'department_id',
        'job_title_id',
        'hire_date',
        'termination_date',
        'base_salary',
        'contract_type',
        'status',
        'photo_path',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'hire_date' => 'date',
        'termination_date' => 'date',
        'date_of_birth' => 'date',
        'base_salary' => 'integer',
        'status' => EmployeeStatus::class,
    ];

    // Accessors for Display (Piasters to EGP)
    public function getBaseSalaryEgpAttribute(): float
    {
        return $this->base_salary / 100;
    }

    // Relationships
    public function branch(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Branch::class, 'branch_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Department::class, 'department_id');
    }

    public function jobTitle(): BelongsTo
    {
        return $this->belongsTo(\App\Models\JobTitle::class, 'job_title_id');
    }

    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(EmployeeAccountLedger::class, 'employee_id')->orderBy('transaction_date', 'asc');
    }

    public function financialTransactions(): HasMany
    {
        return $this->hasMany(EmployeeFinancialTransaction::class, 'employee_id');
    }

    public function loans(): HasMany
    {
        return $this->hasMany(EmployeeLoan::class, 'employee_id');
    }

    public function attendanceRecords(): HasMany
    {
        return $this->hasMany(\App\Models\AttendanceRecord::class, 'employee_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(\App\Models\EmployeeDocument::class, 'employee_id');
    }

    public function payrollDetails(): HasMany
    {
        return $this->hasMany(\App\Models\Payroll\PayrollDetail::class, 'employee_id');
    }
}
