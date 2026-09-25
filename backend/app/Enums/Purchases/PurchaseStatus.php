<?php

declare(strict_types=1);

namespace App\Enums\Purchases;

enum PurchaseStatus: string
{
    case Draft = 'draft';
    case Approved = 'approved';
    case PartiallyReceived = 'partially_received';
    case Received = 'received';
    case Billed = 'billed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'مسودة',
            self::Approved => 'معتمد',
            self::PartiallyReceived => 'مستلم جزئياً',
            self::Received => 'مستلم بالكامل',
            self::Billed => 'مفوتر بالكامل',
            self::Cancelled => 'ملغى',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Draft => 'gray',
            self::Approved => 'blue',
            self::PartiallyReceived => 'orange',
            self::Received => 'green',
            self::Billed => 'purple',
            self::Cancelled => 'red',
        };
    }
}
