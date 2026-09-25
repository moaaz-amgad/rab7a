<?php

declare(strict_types=1);

namespace App\Enums\Payroll;

enum PayrollStatus: string
{
    case Draft = 'draft';
    case Calculated = 'calculated';
    case Approved = 'approved';
    case Paid = 'paid';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'مسودة',
            self::Calculated => 'محسوب',
            self::Approved => 'معتمد',
            self::Paid => 'مدفوع',
            self::Cancelled => 'ملغى',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Draft => 'gray',
            self::Calculated => 'blue',
            self::Approved => 'gold',
            self::Paid => 'green',
            self::Cancelled => 'red',
        };
    }
}
