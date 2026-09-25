<?php

declare(strict_types=1);

namespace App\Models\Suppliers;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class SupplierAccountLedger extends Model
{
    use HasFactory;

    protected $table = 'supplier_account_ledger';

    protected $fillable = [
        'branch_id',
        'supplier_id',
        'transaction_date',
        'reference_number',
        'transaction_type',
        'description',
        'debit',
        'credit',
        'running_balance',
        'created_by',
        'notes',
    ];

    protected $casts = [
        'transaction_date' => 'datetime',
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

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }
}
