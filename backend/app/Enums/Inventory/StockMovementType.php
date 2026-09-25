<?php

declare(strict_types=1);

namespace App\Enums\Inventory;

enum StockMovementType: string
{
    case PurchaseGrn = 'purchase_grn';
    case TransferIn = 'transfer_in';
    case TransferOut = 'transfer_out';
    case Waste = 'waste';
    case RecipeDepletion = 'recipe_depletion';
    case CountAdjustment = 'count_adjustment';

    public function label(): string
    {
        return match ($this) {
            self::PurchaseGrn => 'شراء وإذن استلام (GRN)',
            self::TransferIn => 'تحويل وارد (مخزن إلى مخزن)',
            self::TransferOut => 'تحويل صادر (مخزن إلى مخزن)',
            self::Waste => 'تخريد وهالك مطبخ',
            self::RecipeDepletion => 'خصم تلقائي للمكونات (Recipe)',
            self::CountAdjustment => 'تسوية جرد دوري',
        };
    }

    public function isAddition(): bool
    {
        return match ($this) {
            self::PurchaseGrn, self::TransferIn => true,
            default => false,
        };
    }
}
