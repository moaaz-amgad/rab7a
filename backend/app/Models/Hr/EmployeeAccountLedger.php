<?php

declare(strict_types=1);

namespace App\Models\Hr;

use App\Enums\Hr\TransactionType;
use App\Models\Branch;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class EmployeeAccountLedger extends Model
{
    use HasFactory;

    protected $table = 'employee_account_ledger';

    protected $fillable = [
        'branch_id',
        'employee_id',
        'transaction_number',
        'payroll_period',
        'transaction_date',
        'recording_date',
        'transaction_type',
        'description',
        'debit',
        'credit',
        'running_balance',
        'reference_number',
        'related_document_type',
        'related_document_id',
        'attachment_path',
        'created_by',
        'last_modified_by',
        'notes',
    ];

    protected $casts = [
        'transaction_date' => 'datetime',
        'recording_date' => 'datetime',
        'transaction_type' => TransactionType::class,
        'debit' => 'integer',
        'credit' => 'integer',
        'running_balance' => 'integer',
    ];

    public function getDebitEgpAttribute(): float
    {
        return $this->debit / 100;
    }

    public function getCreditEgpAttribute(): float
    {
        return $this->credit / 100;
    }

    public function getRunningBalanceEgpAttribute(): float
    {
        return $this->running_balance / 100;
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
