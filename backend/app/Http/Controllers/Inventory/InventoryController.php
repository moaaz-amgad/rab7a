<?php

declare(strict_types=1);

namespace App\Http\Controllers\Inventory;

use App\Enums\Inventory\StockMovementType;
use App\Http\Controllers\Controller;
use App\Models\Inventory\InventoryItem;
use App\Models\Inventory\StockMovement;
use App\Services\Inventory\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class InventoryController extends Controller
{
    public function __construct(
        private readonly InventoryService $inventoryService
    ) {}

    /**
     * List inventory raw materials & prepared items with stock valuation.
     */
    public function index(Request $request): JsonResponse
    {
        $branchId = (int) $request->query('branch_id', 1);

        $query = InventoryItem::with(['category', 'uom'])
            ->where('branch_id', $branchId);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name_ar', 'LIKE', "%{$search}%")
                    ->orWhere('sku', 'LIKE', "%{$search}%")
                    ->orWhere('barcode', 'LIKE', "%{$search}%");
            });
        }

        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        $items = $query->paginate((int) $request->query('per_page', 25));

        return response()->json([
            'success' => true,
            'data' => $items->items(),
            'meta' => [
                'current_page' => $items->currentPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
                'last_page' => $items->lastPage(),
            ],
        ]);
    }

    /**
     * Store new raw material or inventory item.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => 'required|integer',
            'category_id' => 'required|integer',
            'uom_id' => 'required|integer',
            'sku' => 'required|string|max:50',
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'type' => 'required|string',
            'reorder_level' => 'required|numeric|min:0',
            'wac_unit_cost' => 'required|integer|min:0', // In piasters
        ]);

        $item = InventoryItem::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة صنف المخزون بنجاح',
            'data' => $item->load(['category', 'uom']),
        ], 201);
    }

    /**
     * Record inventory waste / kitchen spoilage.
     */
    public function recordWaste(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => 'required|integer',
            'warehouse_id' => 'required|integer',
            'item_id' => 'required|integer',
            'quantity' => 'required|numeric|gt:0',
            'reason' => 'required|string|max:500',
        ]);

        $item = InventoryItem::findOrFail($validated['item_id']);

        $movement = $this->inventoryService->recordMovement(
            (int) $validated['branch_id'],
            (int) $validated['warehouse_id'],
            (int) $validated['item_id'],
            StockMovementType::Waste,
            (float) $validated['quantity'],
            $item->wac_unit_cost,
            sprintf('WST-%s', date('Ymd-His')),
            auth()->id() ?? 1,
            $validated['reason']
        );

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الهالك وتخصيم الكمية من المخزن بنجاح',
            'data' => $movement,
        ]);
    }

    /**
     * Get complete audit trail of stock movements.
     */
    public function movements(Request $request): JsonResponse
    {
        $branchId = (int) $request->query('branch_id', 1);

        $movements = StockMovement::with(['item', 'warehouse'])
            ->where('branch_id', $branchId)
            ->orderBy('movement_date', 'desc')
            ->paginate((int) $request->query('per_page', 25));

        return response()->json([
            'success' => true,
            'data' => $movements->items(),
            'meta' => [
                'current_page' => $movements->currentPage(),
                'total' => $movements->total(),
            ],
        ]);
    }
}
