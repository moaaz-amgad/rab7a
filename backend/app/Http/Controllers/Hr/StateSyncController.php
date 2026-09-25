<?php

declare(strict_types=1);

namespace App\Http\Controllers\Hr;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

final class StateSyncController extends Controller
{
    private string $storagePath = 'hr_shared_state.json';

    public function getState(): JsonResponse
    {
        if (Storage::disk('local')->exists($this->storagePath)) {
            $content = Storage::disk('local')->get($this->storagePath);
            $data = json_decode($content, true);
            if ($data) {
                return response()->json([
                    'success' => true,
                    'data' => $data,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'employees' => [],
                'ledgerStore' => (object)[],
                'payoutsStore' => (object)[],
                'payrollStatusStore' => (object)[],
            ],
        ]);
    }

    public function saveState(Request $request): JsonResponse
    {
        $payload = $request->all();
        Storage::disk('local')->put($this->storagePath, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return response()->json([
            'success' => true,
            'message' => 'تم مزامنة وحفظ البيانات بنجاح على السيرفر المركزي',
        ]);
    }
}
