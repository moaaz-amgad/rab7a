<?php

declare(strict_types=1);

namespace App\Enums\Hr;

enum TransactionType: string
{
    case SalaryPayment = 'salary_payment';
    case SalaryAdjustment = 'salary_adjustment';
    case Bonus = 'bonus';
    case Reward = 'reward';
    case Incentive = 'incentive';
    case Allowance = 'allowance';
    case Advance = 'advance';
    case Loan = 'loan';
    case LoanInstallment = 'loan_installment';
    case Penalty = 'penalty';
    case Deduction = 'deduction';
    case OvertimePayment = 'overtime_payment';
    case AttendanceDeduction = 'attendance_deduction';
    case LateDeduction = 'late_deduction';
    case ManualAdjustment = 'manual_adjustment';
    case Refund = 'refund';
    case Settlement = 'settlement';
    case OpeningBalance = 'opening_balance';
    case ClosingAdjustment = 'closing_adjustment';

    public function label(): string
    {
        return match ($this) {
            self::SalaryPayment => 'صرف الراتب الشهرى',
            self::SalaryAdjustment => 'تسوية راتب',
            self::Bonus => 'مكافأة تميز',
            self::Reward => 'حافز / مكافأة تشجيعية',
            self::Incentive => 'حافز إنتاج',
            self::Allowance => 'بدل مالى (بدل طبيعة عمل / وجبة)',
            self::Advance => 'سلفة مؤقتة',
            self::Loan => 'صرف قرض شخصي',
            self::LoanInstallment => 'سداد قسط قرض',
            self::Penalty => 'جزاء مالي',
            self::Deduction => 'خصم إداري',
            self::OvertimePayment => 'مستحق ساعات إضافي',
            self::AttendanceDeduction => 'خصم أيام غياب',
            self::LateDeduction => 'خصم دقائق تأخير',
            self::ManualAdjustment => 'تسوية يدوية',
            self::Refund => 'إعادة مبالغ / استرداد',
            self::Settlement => 'تسوية تصفية حساب',
            self::OpeningBalance => 'رصيد افتتاحي',
            self::ClosingAdjustment => 'قفل تسوية دورية',
        };
    }

    public function isCredit(): bool
    {
        // Credit = Decreases balance owed to employee / money paid to employee
        return match ($this) {
            self::SalaryPayment, self::Advance, self::Loan, self::Penalty, self::Deduction, self::AttendanceDeduction, self::LateDeduction, self::LoanInstallment => true,
            default => false,
        };
    }

    public function isDebit(): bool
    {
        // Debit = Increases balance owed to employee / earnings added
        return match ($this) {
            self::Bonus, self::Reward, self::Incentive, self::Allowance, self::OvertimePayment, self::SalaryAdjustment, self::Refund, self::OpeningBalance => true,
            default => false,
        };
    }
}
