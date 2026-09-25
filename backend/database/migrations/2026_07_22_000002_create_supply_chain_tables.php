<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create Supply Chain tables: Warehouses, Inventory, Purchases, Suppliers & Ledgers.
     */
    public function up(): void
    {
        // 1. Warehouses (المخازن)
        Schema::create('warehouses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('code', 20);
            $table->string('name_ar', 255);
            $table->string('name_en', 255);
            $table->string('type', 30)->default('main'); // main, kitchen, dry, cold, bar
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['branch_id', 'code']);
        });

        // 2. Inventory Categories (تصنيفات المخزون)
        Schema::create('inventory_categories', function (Blueprint $table) {
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

        // 3. Units of Measure (وحدات القياس)
        Schema::create('units_of_measure', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name_ar', 50);
            $table->string('name_en', 50);
            $table->string('symbol', 10);
            $table->decimal('conversion_factor', 10, 4)->default(1.0000); // e.g. 1 kg = 1000 g
            $table->timestamps();
        });

        // 4. Inventory Items (أصناف المخزون والخامات)
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('category_id')->constrained('inventory_categories')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('uom_id')->constrained('units_of_measure')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('sku', 50);
            $table->string('barcode', 50)->nullable();
            $table->string('name_ar', 255);
            $table->string('name_en', 255);
            $table->string('type', 30)->default('raw_material'); // raw_material, prepared, packaging, cleaning
            $table->decimal('current_stock', 12, 3)->default(0.000);
            $table->decimal('reorder_level', 12, 3)->default(0.000);
            $table->bigInteger('wac_unit_cost')->default(0); // Weighted Average Cost in piasters
            $table->bigInteger('last_purchase_price')->default(0); // In piasters
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['branch_id', 'sku']);
        });

        // 5. Stock Movements (حركات المخزون والتدقيق)
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('item_id')->constrained('inventory_items')->cascadeOnUpdate()->restrictOnDelete();
            $table->timestamp('movement_date');
            $table->string('movement_type', 50); // purchase_grn, transfer_in, transfer_out, waste, recipe_depletion, count_adjustment
            $table->string('reference_number', 50);
            $table->decimal('quantity', 12, 3);
            $table->bigInteger('unit_cost'); // Piasters at time of movement
            $table->bigInteger('total_cost'); // Piasters (quantity * unit_cost)
            $table->decimal('stock_after', 12, 3);
            $table->foreignId('created_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['item_id', 'movement_date']);
            $table->index(['branch_id', 'movement_type']);
        });

        // 6. Suppliers (الموردين)
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('code', 20);
            $table->string('name_ar', 255);
            $table->string('name_en', 255);
            $table->string('company_name', 255)->nullable();
            $table->string('tax_number', 50)->nullable();
            $table->string('phone', 20);
            $table->string('email', 255)->nullable();
            $table->text('address')->nullable();
            $table->integer('payment_terms_days')->default(30);
            $table->bigInteger('credit_limit')->default(0); // Piasters
            $table->bigInteger('current_balance')->default(0); // Piasters (Positive = Owed to supplier)
            $table->string('status', 20)->default('active'); // active, suspended, blacklisted
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['branch_id', 'code']);
        });

        // 7. Supplier Account Ledger (كشف حساب المورد) - Running Balance
        Schema::create('supplier_account_ledger', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnUpdate()->restrictOnDelete();
            $table->timestamp('transaction_date');
            $table->string('reference_number', 50);
            $table->string('transaction_type', 50); // purchase_invoice, payment, purchase_return, discount, manual_adjustment
            $table->string('description', 500);
            $table->bigInteger('debit')->default(0); // Payments made to supplier / Returns (-) (piasters)
            $table->bigInteger('credit')->default(0); // Invoices received / Money owed to supplier (+) (piasters)
            $table->bigInteger('running_balance')->default(0); // Accumulated balance in piasters
            $table->foreignId('created_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['supplier_id', 'transaction_date']);
        });

        // 8. Purchase Orders (أوامر الشراء)
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnUpdate()->restrictOnDelete();
            $table->string('po_number', 30);
            $table->date('order_date');
            $table->date('expected_delivery_date')->nullable();
            $table->bigInteger('subtotal')->default(0); // Piasters
            $table->bigInteger('tax_amount')->default(0); // Piasters
            $table->bigInteger('total_amount')->default(0); // Piasters
            $table->string('status', 30)->default('draft'); // draft, approved, partially_received, received, cancelled
            $table->foreignId('created_by')->nullable();
            $table->foreignId('approved_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['branch_id', 'po_number']);
        });

        // 9. Purchase Order Items
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('po_id')->constrained('purchase_orders')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('inventory_items')->cascadeOnUpdate()->restrictOnDelete();
            $table->decimal('ordered_qty', 12, 3);
            $table->decimal('received_qty', 12, 3)->default(0.000);
            $table->bigInteger('unit_price'); // Piasters
            $table->bigInteger('total_price'); // Piasters
            $table->timestamps();
        });

        // 10. Goods Received Notes (إذن استلام البضاعة - GRN)
        Schema::create('goods_received_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('supplier_id')->constrained('suppliers')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('po_id')->nullable()->constrained('purchase_orders')->nullOnDelete();
            $table->string('grn_number', 30);
            $table->date('received_date');
            $table->string('supplier_dn_number', 50)->nullable(); // Delivery note number
            $table->bigInteger('total_amount')->default(0); // Piasters
            $table->string('status', 20)->default('completed'); // completed, voided
            $table->foreignId('received_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['branch_id', 'grn_number']);
        });

        // 11. Goods Received Note Items
        Schema::create('grn_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grn_id')->constrained('goods_received_notes')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('inventory_items')->cascadeOnUpdate()->restrictOnDelete();
            $table->decimal('received_qty', 12, 3);
            $table->bigInteger('unit_cost'); // Piasters
            $table->bigInteger('total_cost'); // Piasters
            $table->bigInteger('old_wac')->default(0); // Piasters
            $table->bigInteger('new_wac')->default(0); // Piasters (Calculated upon GRN)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grn_items');
        Schema::dropIfExists('goods_received_notes');
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
        Schema::dropIfExists('supplier_account_ledger');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('units_of_measure');
        Schema::dropIfExists('inventory_categories');
        Schema::dropIfExists('warehouses');
    }
};
