<?php

declare(strict_types=1);

namespace App\Services\Hr;

use App\Enums\Hr\TransactionType;
use App\Models\Hr\Employee;
use App\Models\Hr\EmployeeAccountLedger;
use Illuminate\Support\Facades\DB;

final class EmployeeLedgerService
{
    /**
     * Record a transaction in employee running ledger and calculate the running balance automatically.
     */
    public function recordTransaction(
        int $branchId,
        int $employeeId,
        TransactionType $type,
        int $amountInPiasters,
        string $description,
        string $referenceNumber,
        ?string $payrollPeriod = null,
        ?string $relatedDocType = null,
        ?int $relatedDocId = null,
        ?string $attachmentPath = null,
        ?int $userId = null,
        ?string $notes = null
    ): EmployeeAccountLedger {
        return DB::transaction(function () use (
            $branchId,
            $employeeId,
            $type,
            $amountInPiasters,
            $description,
            $referenceNumber,
            $payrollPeriod,
            $relatedDocType,
            $relatedDocId,
            $attachmentPath,
            $userId,
            $notes
        ) {
            $employee = Employee::where('id', $employeeId)->lockForUpdate()->firstOrFail();

            // Get last ledger record running balance
            $lastEntry = EmployeeAccountLedger::where('employee_id', $employeeId)
                ->orderBy('transaction_date', 'desc')
                ->orderBy('id', 'desc')
                ->first();

            $previousBalance = $lastEntry ? $lastEntry->running_balance : 0;

            $debit = 0;
            $credit = 0;
            $newBalance = $previousBalance;

            if ($type->isDebit()) { // Earnings added / money owed to employee (+)
                $debit = $amountInPiasters;
                $newBalance = $previousBalance + $amountInPiasters;
            } else { // Deductions / payments / advances (-)
                $credit = $amountInPiasters;
                $newBalance = $previousBalance - $amountInPiasters;
            }

            $txnNumber = sprintf('TXN-%s-%05d', date('Ym'), rand(1000, 9999));

            return EmployeeAccountLedger::create([
                'branch_id' => $branchId,
                'employee_id' => $employeeId,
                'transaction_number' => $txnNumber,
                'payroll_period' => $payrollPeriod,
                'transaction_date' => now(),
                'recording_date' => now(),
                'transaction_type' => $type,
                'description' => $description,
                'debit' => $debit,
                'credit' => $credit,
                'running_balance' => $newBalance,
                'reference_number' => $referenceNumber,
                'related_document_type' => $relatedDocType,
                'related_document_id' => $relatedDocId,
                'attachment_path' => $attachmentPath,
                'created_by' => $userId,
                'notes' => $notes,
            ]);
        });
    }

    /**
     * Create an offset reversal entry for a historical transaction without destroying financial records.
     */
    public function reverseTransaction(int $ledgerId, string $reason, int $userId): EmployeeAccountLedger
    {
        return DB::transaction(function () use ($ledgerId, $reason, $userId) {
            $original = EmployeeAccountLedger::findOrFail($ledgerId);

            $reversedType = TransactionType::ManualAdjustment;
            $reversedAmount = $original->debit > 0 ? $original->debit : $original->credit;

            return $this->recordTransaction(
                $original->branch_id,
                $original->employee_id,
                $reversedType,
                $reversedAmount,
                sprintf('عكس حركة مالي سابقة رقم %s: %s', $original->transaction_number, $reason),
                sprintf('REV-%s', $original->transaction_number),
                $original->payroll_period,
                'reversal',
                $original->id,
                null,
                $userId,
                $reason
            );
        });
    }

    /**
     * Get live financial position for employee YTD.
     */
    public function getFinancialPosition(int $employeeId): array
    {
        $entries = EmployeeAccountLedger::where('employee_id', $employeeId)->get();

        $lastEntry = EmployeeAccountLedger::where('employee_id', $employeeId)
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->first();

        $currentBalance = $lastEntry ? $lastEntry->running_balance : 0;

        $totalBonuses = (int) $entries->whereIn('transaction_type', [TransactionType::Bonus, TransactionType::Reward])->sum('debit');
        $totalDeductions = (int) $entries->whereIn('transaction_type', [TransactionType::Penalty, TransactionType::Deduction, TransactionType::LateDeduction, TransactionType::AttendanceDeduction])->sum('credit');
        $totalOvertime = (int) $entries->where('transaction_type', TransactionType::OvertimePayment)->sum('debit');
        $totalNetSalary = (int) $entries->where('transaction_type', TransactionType::SalaryPayment)->sum('credit');

        return [
            'current_balance' => $currentBalance,
            'current_balance_egp' => $currentBalance / 100,
            'total_bonuses_ytd' => $totalBonuses,
            'total_bonuses_ytd_egp' => $totalBonuses / 100,
            'total_deductions_ytd' => $totalDeductions,
            'total_deductions_ytd_egp' => $totalDeductions / 100,
            'total_overtime_ytd' => $totalOvertime,
            'total_overtime_ytd_egp' => $totalOvertime / 100,
            'total_net_salary_ytd' => $totalNetSalary,
            'total_net_salary_ytd_egp' => $totalNetSalary / 100,
        ];
    }
}
