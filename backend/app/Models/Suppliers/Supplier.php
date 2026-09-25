<?php

declare(strict_types=1);

namespace App\Models\Suppliers;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class Supplier extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'suppliers';

    protected $fillable = [
        'branch_id',
        'code',
        'name_ar',
        'name_en',
        'company_name',
        'tax_number',
        'phone',
        'email',
        'address',
        'payment_terms_days',
        'credit_limit',
        'current_balance',
        'status',
        'notes',
    ];

    protected $casts = [
        'credit_limit' => 'integer',
        'current_balance' => 'integer',
        'payment_terms_days' => 'integer',
    ];

    public function getCurrentBalanceEgpAttribute(): float
    {
        return $this->current_balance / 100;
    }

    public function ledgerEntries(): HasMany
    {
        return $this->hasMany(SupplierAccountLedger::class, 'supplier_id')->orderBy('transaction_date', 'asc');
    }
}
