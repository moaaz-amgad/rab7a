<?php

declare(strict_types=1);

namespace App\Http\Controllers\Suppliers;

use App\Http\Controllers\Controller;
use App\Models\Suppliers\Supplier;
use App\Services\Suppliers\SupplierLedgerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SupplierController extends Controller
{
    public function __construct(
        private readonly SupplierLedgerService $supplierLedgerService
    ) {}

    /**
     * List suppliers.
     */
    public function index(Request $request): JsonResponse
    {
        $branchId = (int) $request->query('branch_id', 1);

        $query = Supplier::where('branch_id', $branchId);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name_ar', 'LIKE', "%{$search}%")
                    ->orWhere('company_name', 'LIKE', "%{$search}%")
                    ->orWhere('code', 'LIKE', "%{$search}%")
                    ->orWhere('phone', 'LIKE', "%{$search}%");
            });
        }

        $suppliers = $query->paginate((int) $request->query('per_page', 25));

        return response()->json([
            'success' => true,
            'data' => $suppliers->items(),
            'meta' => [
                'current_page' => $suppliers->currentPage(),
                'total' => $suppliers->total(),
            ],
        ]);
    }

    /**
     * Store new supplier.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => 'required|integer',
            'code' => 'required|string|max:20',
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'tax_number' => 'nullable|string|max:50',
            'phone' => 'required|string|max:20',
            'payment_terms_days' => 'required|integer|min:0',
            'credit_limit' => 'required|integer|min:0', // Piasters
        ]);

        $supplier = Supplier::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة المورد بنجاح',
            'data' => $supplier,
        ], 201);
    }

    /**
     * Get running account ledger statement for supplier ("كشف حساب المورد").
     */
    public function statement(Request $request, int $id): JsonResponse
    {
        $supplier = Supplier::findOrFail($id);

        $fromDate = $request->query('from_date');
        $toDate = $request->query('to_date');

        $entries = $this->supplierLedgerService->getStatement($id, $fromDate, $toDate);

        $totalDebit = (int) $entries->sum('debit');
        $totalCredit = (int) $entries->sum('credit');
        $currentBalance = $supplier->current_balance;

        return response()->json([
            'success' => true,
            'data' => [
                'supplier' => $supplier,
                'summary' => [
                    'total_debit' => $totalDebit,
                    'total_debit_egp' => $totalDebit / 100,
                    'total_credit' => $totalCredit,
                    'total_credit_egp' => $totalCredit / 100,
                    'current_balance' => $currentBalance,
                    'current_balance_egp' => $currentBalance / 100,
                ],
                'entries' => $entries,
            ],
        ]);
    }
}
