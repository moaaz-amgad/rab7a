<?php

use App\Http\Controllers\Hr\EmployeeController;
use App\Http\Controllers\Hr\EmployeeStatementController;
use App\Http\Controllers\Hr\StateSyncController;
use App\Http\Controllers\Inventory\InventoryController;
use App\Http\Controllers\Payroll\PayrollController;
use App\Http\Controllers\Purchases\PurchaseController;
use App\Http\Controllers\Suppliers\SupplierController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rabha ERP API Routes — V1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // HR & Employee Account Module
    Route::prefix('hr')->group(function () {
        Route::get('sync-state', [StateSyncController::class, 'getState']);
        Route::post('sync-state', [StateSyncController::class, 'saveState']);
        Route::get('employees', [EmployeeController::class, 'index']);
        Route::post('employees', [EmployeeController::class, 'store']);
        Route::get('employees/{id}', [EmployeeController::class, 'show']);
        Route::put('employees/{id}', [EmployeeController::class, 'update']);
        Route::delete('employees/{id}', [EmployeeController::class, 'archive']);
        Route::get('employees/{id}/statement', [EmployeeStatementController::class, 'statement']);
    });

    // Payroll Module
    Route::prefix('payroll')->group(function () {
        Route::get('runs', [PayrollController::class, 'index']);
        Route::post('generate', [PayrollController::class, 'generate']);
        Route::patch('runs/{id}/approve', [PayrollController::class, 'approve']);
        Route::patch('runs/{id}/pay', [PayrollController::class, 'pay']);
        Route::get('details/{id}/drilldown/{type}', [PayrollController::class, 'drilldown']);
    });

    // Supply Chain: Inventory Module
    Route::prefix('inventory')->group(function () {
        Route::get('items', [InventoryController::class, 'index']);
        Route::post('items', [InventoryController::class, 'store']);
        Route::post('waste', [InventoryController::class, 'recordWaste']);
        Route::get('movements', [InventoryController::class, 'movements']);
    });

    // Supply Chain: Suppliers Module
    Route::prefix('suppliers')->group(function () {
        Route::get('/', [SupplierController::class, 'index']);
        Route::post('/', [SupplierController::class, 'store']);
        Route::get('{id}/statement', [SupplierController::class, 'statement']);
    });

    // Supply Chain: Purchases & GRN Module
    Route::prefix('purchases')->group(function () {
        Route::get('orders', [PurchaseController::class, 'index']);
        Route::post('grn/receive', [PurchaseController::class, 'receiveGrn']);
    });
});
