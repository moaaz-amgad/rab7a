<?php

declare(strict_types=1);

namespace App\Services\Suppliers;

use App\Models\Suppliers\Supplier;
use App\Models\Suppliers\SupplierAccountLedger;
use Illuminate\Support\Facades\DB;

final class SupplierLedgerService
{
    /**
     * Record transaction in supplier running account ledger and update current balance.
     */
    public function recordTransaction(
        int $branchId,
        int $supplierId,
        string $transactionType, // purchase_invoice, payment, purchase_return, manual_adjustment
        int $amountInPiasters,
        string $referenceNumber,
        string $description,
        bool $isCredit, // True = Invoice (money owed to supplier), False = Payment made to supplier
        ?int $userId = null,
        ?string $notes = null
    ): SupplierAccountLedger {
        return DB::transaction(function () use (
            $branchId,
            $supplierId,
            $transactionType,
            $amountInPiasters,
            $referenceNumber,
            $description,
            $isCredit,
            $userId,
            $notes
        ) {
            $supplier = Supplier::where('id', $supplierId)->lockForUpdate()->firstOrFail();

            $previousBalance = $supplier->current_balance;

            $debit = 0;
            $credit = 0;

            if ($isCredit) { // Money owed to supplier (+)
                $credit = $amountInPiasters;
                $newBalance = $previousBalance + $amountInPiasters;
            } else { // Payment made / Return (-)
                $debit = $amountInPiasters;
                $newBalance = $previousBalance - $amountInPiasters;
            }

            $entry = SupplierAccountLedger::create([
                'branch_id' => $branchId,
                'supplier_id' => $supplierId,
                'transaction_date' => now(),
                'reference_number' => $referenceNumber,
                'transaction_type' => $transactionType,
                'description' => $description,
                'debit' => $debit,
                'credit' => $credit,
                'running_balance' => $newBalance,
                'created_by' => $userId,
                'notes' => $notes,
            ]);

            $supplier->update(['current_balance' => $newBalance]);

            return $entry;
        });
    }

    /**
     * Get chronological statement of account for supplier ("كشف حساب المورد").
     */
    public function getStatement(int $supplierId, ?string $fromDate = null, ?string $toDate = null)
    {
        $query = SupplierAccountLedger::where('supplier_id', $supplierId);

        if ($fromDate) {
            $query->where('transaction_date', '>=', $fromDate);
        }

        if ($toDate) {
            $query->where('transaction_date', '<=', $toDate . ' 23:59:59');
        }

        return $query->orderBy('transaction_date', 'asc')
            ->orderBy('id', 'asc')
            ->get();
    }
}
