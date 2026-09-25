<?php

declare(strict_types=1);

namespace App\Http\Controllers\Hr;

use App\Http\Controllers\Controller;
use App\Models\Hr\Employee;
use App\Models\Hr\EmployeeAccountLedger;
use App\Services\Hr\EmployeeLedgerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class EmployeeStatementController extends Controller
{
    public function __construct(
        private readonly EmployeeLedgerService $employeeLedgerService
    ) {}

    /**
     * Get complete chronological bank-style statement of account for employee ("كشف حساب الموظف").
     */
    public function statement(Request $request, int $id): JsonResponse
    {
        $employee = Employee::with(['department', 'job_title', 'branch'])->findOrFail($id);

        $query = EmployeeAccountLedger::where('employee_id', $id);

        if ($fromDate = $request->query('from_date')) {
            $query->where('transaction_date', '>=', $fromDate);
        }

        if ($toDate = $request->query('to_date')) {
            $query->where('transaction_date', '<=', $toDate . ' 23:59:59');
        }

        if ($type = $request->query('transaction_type')) {
            $query->where('transaction_type', $type);
        }

        if ($period = $request->query('payroll_period')) {
            $query->where('payroll_period', $period);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'LIKE', "%{$search}%")
                    ->orWhere('reference_number', 'LIKE', "%{$search}%")
                    ->orWhere('transaction_number', 'LIKE', "%{$search}%");
            });
        }

        $entries = $query->orderBy('transaction_date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $position = $this->employeeLedgerService->getFinancialPosition($id);

        return response()->json([
            'success' => true,
            'data' => [
                'employee' => $employee,
                'financial_position' => $position,
                'summary' => [
                    'total_debit' => (int) $entries->sum('debit'),
                    'total_debit_egp' => $entries->sum('debit') / 100,
                    'total_credit' => (int) $entries->sum('credit'),
                    'total_credit_egp' => $entries->sum('credit') / 100,
                    'count' => $entries->count(),
                ],
                'entries' => $entries,
            ],
        ]);
    }

    /**
     * Get complete details of a specific ledger transaction for interactive popups.
     */
    public function transactionDetail(int $employeeId, int $txnId): JsonResponse
    {
        $entry = EmployeeAccountLedger::where('employee_id', $employeeId)
            ->where('id', $txnId)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => [
                'transaction' => $entry,
                'details' => [
                    'transaction_number' => $entry->transaction_number,
                    'type_label' => $entry->transaction_type->label(),
                    'amount_egp' => ($entry->debit > 0 ? $entry->debit : $entry->credit) / 100,
                    'is_debit' => $entry->debit > 0,
                    'approved_by' => 'مدير الموارد البشرية',
                    'attachment_url' => $entry->attachment_path ? asset($entry->attachment_path) : null,
                ],
            ],
        ]);
    }
}
