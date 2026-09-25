<?php

declare(strict_types=1);

namespace App\Http\Controllers\Purchases;

use App\Enums\Inventory\StockMovementType;
use App\Http\Controllers\Controller;
use App\Models\Inventory\InventoryItem;

use App\Models\Purchases\PurchaseOrder;

use App\Services\Inventory\InventoryService;
use App\Services\Suppliers\SupplierLedgerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class PurchaseController extends Controller
{
    public function __construct(
        private readonly InventoryService $inventoryService,
        private readonly SupplierLedgerService $supplierLedgerService
    ) {}

    /**
     * List purchase orders.
     */
    public function index(Request $request): JsonResponse
    {
        $branchId = (int) $request->query('branch_id', 1);

        $pos = DB::table('purchase_orders')
            ->join('suppliers', 'purchase_orders.supplier_id', '=', 'suppliers.id')
            ->select('purchase_orders.*', 'suppliers.name_ar as supplier_name')
            ->where('purchase_orders.branch_id', $branchId)
            ->orderBy('purchase_orders.order_date', 'desc')
            ->paginate((int) $request->query('per_page', 25));

        return response()->json([
            'success' => true,
            'data' => $pos->items(),
            'meta' => [
                'current_page' => $pos->currentPage(),
                'total' => $pos->total(),
            ],
        ]);
    }

    /**
     * Receive Goods Received Note (GRN) — Triggers WAC recalculation & Supplier Ledger posting.
     */
    public function receiveGrn(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => 'required|integer',
            'warehouse_id' => 'required|integer',
            'supplier_id' => 'required|integer',
            'po_id' => 'nullable|integer',
            'supplier_dn_number' => 'nullable|string|max:50',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|integer',
            'items.*.received_qty' => 'required|numeric|gt:0',
            'items.*.unit_cost' => 'required|integer|min:0', // Piasters
        ]);

        return DB::transaction(function () use ($validated) {
            $branchId = (int) $validated['branch_id'];
            $warehouseId = (int) $validated['warehouse_id'];
            $supplierId = (int) $validated['supplier_id'];
            $grnNumber = sprintf('GRN-%s-%04d', date('Ymd'), rand(100, 999));

            $totalGrnAmount = 0;

            foreach ($validated['items'] as $itemData) {
                $itemId = (int) $itemData['item_id'];
                $qty = (float) $itemData['received_qty'];
                $unitCost = (int) $itemData['unit_cost'];

                // 1. Record stock movement & dynamically update WAC
                $movement = $this->inventoryService->recordMovement(
                    $branchId,
                    $warehouseId,
                    $itemId,
                    StockMovementType::PurchaseGrn,
                    $qty,
                    $unitCost,
                    $grnNumber,
                    auth()->id() ?? 1,
                    'استلام بضاعة إذن توريد'
                );

                $totalGrnAmount += (int) round($qty * $unitCost);
            }

            // 2. Post invoice transaction to Supplier Account Ledger ("كشف حساب المورد")
            $this->supplierLedgerService->recordTransaction(
                $branchId,
                $supplierId,
                'purchase_invoice',
                $totalGrnAmount,
                $grnNumber,
                sprintf('إذن استلام بضاعة رقم %s (فاتورة توريد)', $grnNumber),
                true, // Credit = Money owed to supplier
                auth()->id() ?? 1
            );

            return response()->json([
                'success' => true,
                'message' => 'تم استلام البضاعة، إعادت تقييم المتوسط المرجح (WAC)، وترحيل الفاتورة لكشف حساب المورد بنجاح',
                'data' => [
                    'grn_number' => $grnNumber,
                    'total_amount' => $totalGrnAmount,
                    'total_amount_egp' => $totalGrnAmount / 100,
                ],
            ]);
        });
    }
}
