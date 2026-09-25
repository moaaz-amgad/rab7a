<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create HR, Payroll, and Employee Ledger tables for Rabha ERP.
     */
    public function up(): void
    {
        // 1. Branches Table (Core Context)
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name_ar', 255);
            $table->string('name_en', 255);
            $table->string('phone', 20)->nullable();
            $table->text('address_ar')->nullable();
            $table->string('city', 100)->default('Cairo');
            $table->boolean('is_main_branch')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Departments
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('code', 20);
            $table->string('name_ar', 255);
            $table->string('name_en', 255);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['branch_id', 'code']);
        });

        // 3. Job Titles
        Schema::create('job_titles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('code', 20);
            $table->string('name_ar', 255);
            $table->string('name_en', 255);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['branch_id', 'code']);
        });

        // 4. Employees Table
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('employee_number', 20);
            $table->string('name_ar', 255);
            $table->string('name_en', 255);
            $table->string('nickname', 100)->nullable();
            $table->string('national_id', 14)->nullable();
            $table->string('phone', 20);
            $table->string('phone_secondary', 20)->nullable();
            $table->string('email', 255)->nullable();
            $table->text('address')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender', 10)->default('male');
            
            $table->foreignId('department_id')->constrained('departments')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('job_title_id')->constrained('job_titles')->cascadeOnUpdate()->restrictOnDelete();
            
            $table->date('hire_date');
            $table->date('termination_date')->nullable();
            $table->bigInteger('base_salary')->default(0); // Stored in piasters (1 EGP = 100 piasters)
            $table->string('contract_type', 30)->default('full_time');
            $table->string('status', 20)->default('active'); // active, on_leave, suspended, terminated, archived
            $table->string('photo_path', 500)->nullable();
            $table->text('notes')->nullable();

            $table->foreignId('created_by')->nullable();
            $table->foreignId('updated_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['branch_id', 'employee_number']);
            $table->index(['branch_id', 'status']);
        });

        // 5. Employee Account Ledger (كشف حساب الموظف) - Running Balance
        Schema::create('employee_account_ledger', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnUpdate()->restrictOnDelete();
            $table->timestamp('transaction_date');
            $table->string('reference_number', 50);
            $table->string('transaction_type', 50); // bonus, reward, allowance, penalty, advance, loan_disbursement, loan_installment, salary_payment, manual_adjustment
            $table->string('description', 500);
            $table->bigInteger('debit')->default(0); // Additions / Money owed to employee (piasters)
            $table->bigInteger('credit')->default(0); // Deductions / Payments / Money taken (piasters)
            $table->bigInteger('running_balance')->default(0); // Accumulated balance in piasters
            $table->foreignId('created_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'transaction_date']);
            $table->index(['branch_id', 'transaction_type']);
        });

        // 6. Employee Financial Transactions (Bonuses, Rewards, Allowances, Penalties, Advances, Adjustments)
        Schema::create('employee_financial_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('type', 30); // bonus, reward, allowance, penalty, advance, manual_addition, manual_deduction
            $table->date('transaction_date');
            $table->bigInteger('amount'); // Piasters
            $table->string('reason', 500);
            $table->string('attachment_path', 500)->nullable();
            $table->boolean('is_applied_to_payroll')->default(false);
            $table->foreignId('payroll_run_id')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'type', 'is_applied_to_payroll']);
        });

        // 7. Employee Loans (القروض)
        Schema::create('employee_loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('loan_number', 30);
            $table->date('issue_date');
            $table->bigInteger('total_amount'); // Piasters
            $table->bigInteger('monthly_installment'); // Piasters
            $table->integer('total_installments');
            $table->integer('paid_installments')->default(0);
            $table->bigInteger('paid_amount')->default(0); // Piasters
            $table->bigInteger('remaining_balance'); // Piasters
            $table->string('status', 20)->default('active'); // active, fully_paid, cancelled
            $table->string('reason', 500)->nullable();
            $table->foreignId('created_by')->nullable();
            $table->timestamps();
        });

        // 8. Employee Loan Installments (أقساط القروض)
        Schema::create('employee_loan_installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_id')->constrained('employee_loans')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->date('due_date');
            $table->bigInteger('amount'); // Piasters
            $table->string('status', 20)->default('pending'); // pending, paid, waived
            $table->date('paid_date')->nullable();
            $table->foreignId('payroll_run_id')->nullable();
            $table->timestamps();
        });

        // 9. Attendance Records (الحضور والانصراف)
        Schema::create('attendance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnUpdate()->restrictOnDelete();
            $table->date('date');
            $table->timestamp('check_in')->nullable();
            $table->timestamp('check_out')->nullable();
            $table->integer('late_minutes')->default(0);
            $table->integer('overtime_minutes')->default(0);
            $table->decimal('working_hours', 5, 2)->default(0.00);
            $table->string('status', 20)->default('present'); // present, absent, late, leave, weekend, holiday
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['employee_id', 'date']);
        });

        // 10. Employee Documents
        Schema::create('employee_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('document_type', 50); // national_id, contract, certificate, other
            $table->string('title', 255);
            $table->string('file_path', 500);
            $table->integer('file_size')->default(0);
            $table->string('mime_type', 100)->default('application/pdf');
            $table->date('expiry_date')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('uploaded_by')->nullable();
            $table->timestamps();
        });

        // 11. Payroll Runs (دورات المرتبات)
        Schema::create('payroll_runs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('reference', 30);
            $table->date('period_start');
            $table->date('period_end');
            $table->integer('month');
            $table->integer('year');
            $table->integer('total_employees')->default(0);
            $table->bigInteger('total_base_salary')->default(0);
            $table->bigInteger('total_additions')->default(0);
            $table->bigInteger('total_deductions')->default(0);
            $table->bigInteger('total_net_salary')->default(0);
            $table->string('status', 20)->default('draft'); // draft, calculated, approved, paid, cancelled
            $table->timestamp('calculated_at')->nullable();
            $table->foreignId('calculated_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('paid_by')->nullable();
            $table->string('payment_method', 30)->default('cash');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['branch_id', 'month', 'year']);
        });

        // 12. Payroll Details (تفاصيل الراتب لكل موظف)
        Schema::create('payroll_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_run_id')->constrained('payroll_runs')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnUpdate()->restrictOnDelete();
            
            // Historical Base Salary Snapshot
            $table->bigInteger('base_salary'); // Piasters
            
            // Attendance Summary Snapshots
            $table->integer('working_days')->default(0);
            $table->integer('present_days')->default(0);
            $table->integer('absent_days')->default(0);
            $table->integer('late_minutes')->default(0);
            $table->bigInteger('late_deduction')->default(0); // Piasters
            $table->decimal('overtime_hours', 6, 2)->default(0.00);
            $table->bigInteger('overtime_amount')->default(0); // Piasters
            $table->bigInteger('absence_deduction')->default(0); // Piasters

            // Additions
            $table->bigInteger('total_bonuses')->default(0);
            $table->bigInteger('total_rewards')->default(0);
            $table->bigInteger('total_allowances')->default(0);
            $table->bigInteger('other_additions')->default(0);
            $table->bigInteger('total_additions')->default(0);

            // Deductions
            $table->bigInteger('total_advances')->default(0);
            $table->bigInteger('total_loan_installments')->default(0);
            $table->bigInteger('total_penalties')->default(0);
            $table->bigInteger('other_deductions')->default(0);
            $table->bigInteger('total_deductions')->default(0);

            // Net
            $table->bigInteger('net_salary'); // Piasters
            $table->string('status', 20)->default('draft');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['payroll_run_id', 'employee_id']);
        });

        // 13. Audit Logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->nullable();
            $table->foreignId('user_id')->nullable();
            $table->string('action', 100);
            $table->string('auditable_type', 150);
            $table->unsignedBigInteger('auditable_id');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('payroll_details');
        Schema::dropIfExists('payroll_runs');
        Schema::dropIfExists('employee_documents');
        Schema::dropIfExists('attendance_records');
        Schema::dropIfExists('employee_loan_installments');
        Schema::dropIfExists('employee_loans');
        Schema::dropIfExists('employee_financial_transactions');
        Schema::dropIfExists('employee_account_ledger');
        Schema::dropIfExists('employees');
        Schema::dropIfExists('job_titles');
        Schema::dropIfExists('departments');
        Schema::dropIfExists('branches');
    }
};
