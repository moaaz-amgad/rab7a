<?php

declare(strict_types=1);

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Payroll\PayrollDetail;
use App\Models\Payroll\PayrollRun;
use App\Services\Payroll\PayrollCalculationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class PayrollController extends Controller
{
    public function __construct(
        private readonly PayrollCalculationService $payrollService
    ) {}

    /**
     * List all payroll runs or employee details for a given period.
     */
    public function index(Request $request): JsonResponse
    {
        $branchId = (int) $request->query('branch_id', 1);
        $month = (int) $request->query('month', (int) date('m'));
        $year = (int) $request->query('year', (int) date('Y'));

        $payrollRun = PayrollRun::with(['details.employee.department', 'details.employee.jobTitle'])
            ->where('branch_id', $branchId)
            ->where('month', $month)
            ->where('year', $year)
            ->first();

        return response()->json([
            'success' => true,
            'data' => $payrollRun,
        ]);
    }

    /**
     * Generate or recalculate automated payroll run.
     */
    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => 'required|integer',
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer|min:2020',
        ]);

        $payrollRun = $this->payrollService->generatePayroll(
            (int) $validated['branch_id'],
            (int) $validated['month'],
            (int) $validated['year'],
            auth()->id() ?? 1
        );

        return response()->json([
            'success' => true,
            'message' => 'تم احتساب دورة المرتبات تلقائياً بنجاح',
            'data' => $payrollRun,
        ]);
    }

    /**
     * Approve payroll run.
     */
    public function approve(int $id): JsonResponse
    {
        $payrollRun = PayrollRun::findOrFail($id);
        $this->payrollService->approvePayroll($payrollRun, auth()->id() ?? 1);

        return response()->json([
            'success' => true,
            'message' => 'تم اعتماد دورة المرتبات بنجاح',
            'data' => $payrollRun->fresh(),
        ]);
    }

    /**
     * Mark payroll as paid and post transactions to employee ledger statement.
     */
    public function pay(Request $request, int $id): JsonResponse
    {
        $payrollRun = PayrollRun::with('details')->findOrFail($id);
        $method = $request->input('payment_method', 'cash');

        $this->payrollService->payPayroll($payrollRun, $method, auth()->id() ?? 1);

        return response()->json([
            'success' => true,
            'message' => 'تم صرف المرتبات وتسجيل الحركة في كشوف حسابات الموظفين بنجاح',
            'data' => $payrollRun->fresh(),
        ]);
    }

    /**
     * Interactive Drill-Down Endpoint for Payroll Details.
     * Clicking any line item (bonuses, advances, penalties, overtime, attendance, absences)
     * returns exact underlying breakdown records.
     */
    public function drilldown(Request $request, int $payrollDetailId, string $type): JsonResponse
    {
        $detail = PayrollDetail::with('employee')->findOrFail($payrollDetailId);
        $employeeId = $detail->employee_id;
        $run = PayrollRun::findOrFail($detail->payroll_run_id);
        $periodStart = $run->period_start;
        $periodEnd = $run->period_end;

        $data = match ($type) {
            'bonuses' => DB::table('employee_financial_transactions')
                ->where('employee_id', $employeeId)
                ->where('type', 'bonus')
                ->whereBetween('transaction_date', [$periodStart, $periodEnd])
                ->get(),

            'rewards' => DB::table('employee_financial_transactions')
                ->where('employee_id', $employeeId)
                ->where('type', 'reward')
                ->whereBetween('transaction_date', [$periodStart, $periodEnd])
                ->get(),

            'allowances' => DB::table('employee_financial_transactions')
                ->where('employee_id', $employeeId)
                ->where('type', 'allowance')
                ->whereBetween('transaction_date', [$periodStart, $periodEnd])
                ->get(),

            'penalties' => DB::table('employee_financial_transactions')
                ->where('employee_id', $employeeId)
                ->where('type', 'penalty')
                ->whereBetween('transaction_date', [$periodStart, $periodEnd])
                ->get(),

            'advances' => DB::table('employee_financial_transactions')
                ->where('employee_id', $employeeId)
                ->where('type', 'advance')
                ->whereBetween('transaction_date', [$periodStart, $periodEnd])
                ->get(),

            'loan_installments' => DB::table('employee_loan_installments')
                ->where('employee_id', $employeeId)
                ->whereBetween('due_date', [$periodStart, $periodEnd])
                ->get(),

            'overtime' => DB::table('attendance_records')
                ->where('employee_id', $employeeId)
                ->where('overtime_minutes', '>', 0)
                ->whereBetween('date', [$periodStart, $periodEnd])
                ->get(),

            'attendance' => DB::table('attendance_records')
                ->where('employee_id', $employeeId)
                ->whereBetween('date', [$periodStart, $periodEnd])
                ->get(),

            'absence' => DB::table('attendance_records')
                ->where('employee_id', $employeeId)
                ->where('status', 'absent')
                ->whereBetween('date', [$periodStart, $periodEnd])
                ->get(),

            default => [],
        };

        return response()->json([
            'success' => true,
            'type' => $type,
            'employee' => $detail->employee,
            'period' => sprintf('%04d-%02d', $run->year, $run->month),
            'data' => $data,
        ]);
    }
}
