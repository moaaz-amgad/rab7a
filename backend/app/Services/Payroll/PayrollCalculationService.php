<?php

declare(strict_types=1);

namespace App\Services\Payroll;

use App\Enums\Hr\EmployeeStatus;
use App\Enums\Hr\TransactionType;
use App\Models\Hr\Employee;
use App\Models\Hr\EmployeeFinancialTransaction;
use App\Models\Hr\EmployeeLoanInstallment;
use App\Models\Payroll\PayrollDetail;
use App\Models\Payroll\PayrollRun;
use App\Services\Hr\EmployeeLedgerService;
use Illuminate\Support\Facades\DB;

final class PayrollCalculationService
{
    public function __construct(
        private readonly EmployeeLedgerService $ledgerService
    ) {}

    /**
     * Generate or recalculate payroll run for a branch and month/year automatically.
     */
    public function generatePayroll(int $branchId, int $month, int $year, ?int $userId = null): PayrollRun
    {
        return DB::transaction(function () use ($branchId, $month, $year, $userId) {
            $periodStart = sprintf('%04d-%02d-01', $year, $month);
            $periodEnd = date('Y-m-t', strtotime($periodStart));
            $daysInMonth = (int) date('t', strtotime($periodStart));

            // Find or create draft payroll run
            $payrollRun = PayrollRun::firstOrCreate(
                [
                    'branch_id' => $branchId,
                    'month' => $month,
                    'year' => $year,
                ],
                [
                    'reference' => sprintf('PAY-%04d-%02d', $year, $month),
                    'period_start' => $periodStart,
                    'period_end' => $periodEnd,
                    'status' => 'draft',
                    'created_by' => $userId,
                ]
            );

            // Fetch active employees in this branch
            $employees = Employee::where('branch_id', $branchId)
                ->whereIn('status', [EmployeeStatus::Active->value, EmployeeStatus::OnLeave->value])
                ->get();

            $runTotalBase = 0;
            $runTotalAdditions = 0;
            $runTotalDeductions = 0;
            $runTotalNet = 0;

            foreach ($employees as $employee) {
                // 1. Base Salary
                $baseSalary = $employee->base_salary; // Piasters
                $dailyRate = (int) round($baseSalary / max($daysInMonth, 1));
                $hourlyRate = (int) round($dailyRate / 8); // Assuming 8-hour workday standard

                // 2. Attendance Summary
                $attendanceRecords = DB::table('attendance_records')
                    ->where('employee_id', $employee->id)
                    ->whereBetween('date', [$periodStart, $periodEnd])
                    ->get();

                $presentDays = $attendanceRecords->where('status', 'present')->count();
                $absentDays = $attendanceRecords->where('status', 'absent')->count();
                $lateMinutes = (int) $attendanceRecords->sum('late_minutes');
                $overtimeMinutes = (int) $attendanceRecords->sum('overtime_minutes');

                // 3. Attendance Deductions & Earnings
                $absenceDeduction = $absentDays * $dailyRate;
                
                // Late Deduction: 1 late minute = 1 minute salary rate (customizable per branch rule)
                $minuteRate = (int) round($hourlyRate / 60);
                $lateDeduction = $lateMinutes * $minuteRate;

                // Overtime Earnings: 1.5x hourly rate per Egyptian Labor Law standard
                $overtimeHours = round($overtimeMinutes / 60, 2);
                $overtimeAmount = (int) round($overtimeHours * ($hourlyRate * 1.5));

                // 4. Financial Transactions (Unapplied)
                $financials = EmployeeFinancialTransaction::where('employee_id', $employee->id)
                    ->whereBetween('transaction_date', [$periodStart, $periodEnd])
                    ->get();

                $totalBonuses = (int) $financials->where('type', 'bonus')->sum('amount');
                $totalRewards = (int) $financials->where('type', 'reward')->sum('amount');
                $totalAllowances = (int) $financials->where('type', 'allowance')->sum('amount');
                $otherAdditions = (int) $financials->where('type', 'manual_addition')->sum('amount');

                $totalAdvances = (int) $financials->where('type', 'advance')->sum('amount');
                $totalPenalties = (int) $financials->where('type', 'penalty')->sum('amount');
                $otherDeductions = (int) $financials->where('type', 'manual_deduction')->sum('amount');

                // 5. Loan Installments
                $loanInstallments = EmployeeLoanInstallment::where('employee_id', $employee->id)
                    ->where('status', 'pending')
                    ->whereBetween('due_date', [$periodStart, $periodEnd])
                    ->get();

                $totalLoanInstallments = (int) $loanInstallments->sum('amount');

                // Aggregate Totals
                $totalAdditions = $overtimeAmount + $totalBonuses + $totalRewards + $totalAllowances + $otherAdditions;
                $totalDeductions = $absenceDeduction + $lateDeduction + $totalAdvances + $totalPenalties + $otherDeductions + $totalLoanInstallments;
                
                $netSalary = max(0, $baseSalary + $totalAdditions - $totalDeductions);

                // Save or update detail snapshot
                PayrollDetail::updateOrCreate(
                    [
                        'payroll_run_id' => $payrollRun->id,
                        'employee_id' => $employee->id,
                    ],
                    [
                        'base_salary' => $baseSalary,
                        'working_days' => $daysInMonth,
                        'present_days' => $presentDays,
                        'absent_days' => $absentDays,
                        'late_minutes' => $lateMinutes,
                        'late_deduction' => $lateDeduction,
                        'overtime_hours' => $overtimeHours,
                        'overtime_amount' => $overtimeAmount,
                        'absence_deduction' => $absenceDeduction,
                        'total_bonuses' => $totalBonuses,
                        'total_rewards' => $totalRewards,
                        'total_allowances' => $totalAllowances,
                        'other_additions' => $otherAdditions,
                        'total_additions' => $totalAdditions,
                        'total_advances' => $totalAdvances,
                        'total_loan_installments' => $totalLoanInstallments,
                        'total_penalties' => $totalPenalties,
                        'other_deductions' => $otherDeductions,
                        'total_deductions' => $totalDeductions,
                        'net_salary' => $netSalary,
                        'status' => 'calculated',
                    ]
                );

                $runTotalBase += $baseSalary;
                $runTotalAdditions += $totalAdditions;
                $runTotalDeductions += $totalDeductions;
                $runTotalNet += $netSalary;
            }

            $payrollRun->update([
                'total_employees' => $employees->count(),
                'total_base_salary' => $runTotalBase,
                'total_additions' => $runTotalAdditions,
                'total_deductions' => $runTotalDeductions,
                'total_net_salary' => $runTotalNet,
                'status' => 'calculated',
                'calculated_at' => now(),
                'calculated_by' => $userId,
            ]);

            return $payrollRun->fresh(['details.employee']);
        });
    }

    /**
     * Approve payroll run.
     */
    public function approvePayroll(PayrollRun $payrollRun, int $userId): bool
    {
        return DB::transaction(function () use ($payrollRun, $userId) {
            if ($payrollRun->status === 'approved' || $payrollRun->status === 'paid') {
                return true;
            }

            $payrollRun->update([
                'status' => 'approved',
                'approved_at' => now(),
                'approved_by' => $userId,
            ]);

            return true;
        });
    }

    /**
     * Mark payroll as paid and record ledger entries for every employee account statement.
     */
    public function payPayroll(PayrollRun $payrollRun, string $paymentMethod = 'cash', ?int $userId = null): bool
    {
        return DB::transaction(function () use ($payrollRun, $paymentMethod, $userId) {
            if ($payrollRun->status === 'paid') {
                return true;
            }

            foreach ($payrollRun->details as $detail) {
                // Post Net Salary payment to Employee Account Ledger ("كشف حساب الموظف")
                $this->ledgerService->recordTransaction(
                    $payrollRun->branch_id,
                    $detail->employee_id,
                    TransactionType::SalaryPayment,
                    $detail->net_salary,
                    $payrollRun->reference,
                    sprintf('صرف مرتب شهر %02d/%04d', $payrollRun->month, $payrollRun->year),
                    $userId,
                    'صرف مؤكد من دورة المرتبات'
                );

                // Mark loan installments as paid
                EmployeeLoanInstallment::where('employee_id', $detail->employee_id)
                    ->where('status', 'pending')
                    ->whereBetween('due_date', [$payrollRun->period_start, $payrollRun->period_end])
                    ->update([
                        'status' => 'paid',
                        'paid_date' => now(),
                        'payroll_run_id' => $payrollRun->id,
                    ]);
            }

            $payrollRun->update([
                'status' => 'paid',
                'paid_at' => now(),
                'paid_by' => $userId,
                'payment_method' => $paymentMethod,
            ]);

            return true;
        });
    }
}
