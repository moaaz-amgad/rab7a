<?php

declare(strict_types=1);

namespace App\Models\Inventory;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class InventoryItem extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'inventory_items';

    protected $fillable = [
        'branch_id',
        'category_id',
        'uom_id',
        'sku',
        'barcode',
        'name_ar',
        'name_en',
        'type',
        'current_stock',
        'reorder_level',
        'wac_unit_cost',
        'last_purchase_price',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'current_stock' => 'float',
        'reorder_level' => 'float',
        'wac_unit_cost' => 'integer',
        'last_purchase_price' => 'integer',
        'is_active' => 'boolean',
    ];

    public function getWacUnitCostEgpAttribute(): float
    {
        return $this->wac_unit_cost / 100;
    }

    public function getTotalValuationEgpAttribute(): float
    {
        return ($this->current_stock * $this->wac_unit_cost) / 100;
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(InventoryCategory::class, 'category_id');
    }

    public function uom(): BelongsTo
    {
        return $this->belongsTo(UnitOfMeasure::class, 'uom_id');
    }

    public function movements(): HasMany
    {
        return $this->hasMany(StockMovement::class, 'item_id')->orderBy('movement_date', 'desc');
    }
}
