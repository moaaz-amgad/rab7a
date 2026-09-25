<?php

declare(strict_types=1);

namespace App\Services\Inventory;

use App\Enums\Inventory\StockMovementType;
use App\Models\Inventory\InventoryItem;
use App\Models\Inventory\StockMovement;
use Illuminate\Support\Facades\DB;

final class InventoryService
{
    /**
     * Record stock movement and recalculate Weighted Average Cost (WAC) dynamically upon GRNs.
     */
    public function recordMovement(
        int $branchId,
        int $warehouseId,
        int $itemId,
        StockMovementType $type,
        float $quantity,
        int $unitCostInPiasters,
        string $referenceNumber,
        ?int $userId = null,
        ?string $notes = null
    ): StockMovement {
        return DB::transaction(function () use (
            $branchId,
            $warehouseId,
            $itemId,
            $type,
            $quantity,
            $unitCostInPiasters,
            $referenceNumber,
            $userId,
            $notes
        ) {
            $item = InventoryItem::where('id', $itemId)->lockForUpdate()->firstOrFail();

            $oldStock = $item->current_stock;
            $oldWac = $item->wac_unit_cost;

            $newStock = $type->isAddition() ? $oldStock + $quantity : $oldStock - $quantity;
            $newWac = $oldWac;

            // Recalculate WAC if addition via Purchase GRN
            if ($type === StockMovementType::PurchaseGrn && $newStock > 0) {
                $totalOldValuation = (int) round($oldStock * $oldWac);
                $totalNewValuation = (int) round($quantity * $unitCostInPiasters);
                $newWac = (int) round(($totalOldValuation + $totalNewValuation) / $newStock);
            }

            $totalCost = (int) round($quantity * $unitCostInPiasters);

            // Create movement record
            $movement = StockMovement::create([
                'branch_id' => $branchId,
                'warehouse_id' => $warehouseId,
                'item_id' => $itemId,
                'movement_date' => now(),
                'movement_type' => $type->value,
                'reference_number' => $referenceNumber,
                'quantity' => $quantity,
                'unit_cost' => $unitCostInPiasters,
                'total_cost' => $totalCost,
                'stock_after' => $newStock,
                'created_by' => $userId,
                'notes' => $notes,
            ]);

            // Update item stock & WAC
            $item->update([
                'current_stock' => $newStock,
                'wac_unit_cost' => $newWac,
                'last_purchase_price' => $type === StockMovementType::PurchaseGrn ? $unitCostInPiasters : $item->last_purchase_price,
            ]);

            return $movement;
        });
    }
}
