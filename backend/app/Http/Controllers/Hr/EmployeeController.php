<?php

declare(strict_types=1);

namespace App\Http\Controllers\Hr;

use App\Http\Controllers\Controller;
use App\Models\Hr\Employee;
use App\Models\Hr\EmployeeFinancialTransaction;
use App\Models\Hr\EmployeeLoan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class EmployeeController extends Controller
{
    /**
     * List all employees with filtering, searching, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $branchId = $request->query('branch_id', 1);

        $query = Employee::with(['department', 'jobTitle', 'branch'])
            ->where('branch_id', $branchId);

        // Global Search
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name_ar', 'LIKE', "%{$search}%")
                    ->orWhere('name_en', 'LIKE', "%{$search}%")
                    ->orWhere('nickname', 'LIKE', "%{$search}%")
                    ->orWhere('employee_number', 'LIKE', "%{$search}%")
                    ->orWhere('phone', 'LIKE', "%{$search}%")
                    ->orWhere('national_id', 'LIKE', "%{$search}%");
            });
        }

        // Filters
        if ($departmentId = $request->query('department_id')) {
            $query->where('department_id', $departmentId);
        }

        if ($jobTitleId = $request->query('job_title_id')) {
            $query->where('job_title_id', $jobTitleId);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        // Sorting
        $sortBy = $request->query('sort_by', 'created_at');
        $sortDir = $request->query('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $perPage = (int) $request->query('per_page', 25);
        $employees = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $employees->items(),
            'meta' => [
                'current_page' => $employees->currentPage(),
                'per_page' => $employees->perPage(),
                'total' => $employees->total(),
                'last_page' => $employees->lastPage(),
            ],
        ]);
    }

    /**
     * Store new employee.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => 'required|integer',
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'nickname' => 'nullable|string|max:100',
            'national_id' => 'nullable|string|size:14',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'department_id' => 'required|integer',
            'job_title_id' => 'required|integer',
            'hire_date' => 'required|date',
            'base_salary' => 'required|integer|min:0', // In piasters
            'contract_type' => 'required|string',
            'photo_path' => 'nullable|string',
        ]);

        $branchId = $validated['branch_id'];
        $lastEmployee = Employee::where('branch_id', $branchId)->latest('id')->first();
        $nextSeq = $lastEmployee ? ((int) substr($lastEmployee->employee_number, 4)) + 1 : 1;
        $validated['employee_number'] = sprintf('EMP-%04d', $nextSeq);
        $validated['status'] = 'active';

        $employee = Employee::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الموظف بنجاح',
            'data' => $employee->load(['department', 'jobTitle', 'branch']),
        ], 201);
    }

    /**
     * Get complete employee profile with summary KPI metrics and tabs.
     */
    public function show(int $id): JsonResponse
    {
        $employee = Employee::with([
            'department',
            'jobTitle',
            'branch',
            'documents',
            'loans',
        ])->findOrFail($id);

        $currentMonthStart = date('Y-m-01');
        $currentMonthEnd = date('Y-m-t');

        // Current Month Attendance Stats
        $attendance = DB::table('attendance_records')
            ->where('employee_id', $id)
            ->whereBetween('date', [$currentMonthStart, $currentMonthEnd])
            ->get();

        $absentDays = $attendance->where('status', 'absent')->count();
        $lateMinutes = (int) $attendance->sum('late_minutes');
        $overtimeMinutes = (int) $attendance->sum('overtime_minutes');

        // Current Advances & Loans Balance
        $currentAdvancesBalance = (int) EmployeeFinancialTransaction::where('employee_id', $id)
            ->where('type', 'advance')
            ->where('is_applied_to_payroll', false)
            ->sum('amount');

        $currentLoanBalance = (int) EmployeeLoan::where('employee_id', $id)
            ->where('status', 'active')
            ->sum('remaining_balance');

        // Latest Net Salary
        $latestPayrollDetail = DB::table('payroll_details')
            ->where('employee_id', $id)
            ->latest('id')
            ->first();

        $latestNetSalary = $latestPayrollDetail ? $latestPayrollDetail->net_salary : $employee->base_salary;

        return response()->json([
            'success' => true,
            'data' => [
                'employee' => $employee,
                'summary' => [
                    'base_salary' => $employee->base_salary, // piasters
                    'base_salary_egp' => $employee->base_salary_egp,
                    'latest_net_salary' => $latestNetSalary,
                    'latest_net_salary_egp' => $latestNetSalary / 100,
                    'absent_days_this_month' => $absentDays,
                    'late_hours_this_month' => round($lateMinutes / 60, 1),
                    'overtime_hours_this_month' => round($overtimeMinutes / 60, 1),
                    'current_advances_balance' => $currentAdvancesBalance,
                    'current_advances_balance_egp' => $currentAdvancesBalance / 100,
                    'current_loan_balance' => $currentLoanBalance,
                    'current_loan_balance_egp' => $currentLoanBalance / 100,
                ],
            ],
        ]);
    }

    /**
     * Update employee profile.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $employee = Employee::findOrFail($id);

        $validated = $request->validate([
            'name_ar' => 'sometimes|required|string|max:255',
            'name_en' => 'sometimes|required|string|max:255',
            'nickname' => 'nullable|string|max:100',
            'phone' => 'sometimes|required|string|max:20',
            'department_id' => 'sometimes|required|integer',
            'job_title_id' => 'sometimes|required|integer',
            'base_salary' => 'sometimes|required|integer|min:0',
            'status' => 'sometimes|required|string',
        ]);

        $employee->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث بيانات الموظف بنجاح',
            'data' => $employee->load(['department', 'jobTitle', 'branch']),
        ]);
    }

    /**
     * Archive employee (soft delete / status change).
     */
    public function archive(int $id): JsonResponse
    {
        $employee = Employee::findOrFail($id);
        $employee->update(['status' => 'archived']);
        $employee->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم أرشفة الموظف بنجاح',
        ]);
    }
}
