<?php

declare(strict_types=1);

namespace App\Enums\Hr;

enum EmployeeStatus: string
{
    case Active = 'active';
    case OnLeave = 'on_leave';
    case Suspended = 'suspended';
    case Terminated = 'terminated';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'نشط',
            self::OnLeave => 'في إجازة',
            self::Suspended => 'موقوف',
            self::Terminated => 'منتهي الخدمة',
            self::Archived => 'مؤرشف',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Active => 'green',
            self::OnLeave => 'gold',
            self::Suspended => 'orange',
            self::Terminated => 'red',
            self::Archived => 'gray',
        };
    }
}
