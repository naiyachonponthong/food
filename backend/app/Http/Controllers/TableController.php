<?php

namespace App\Http\Controllers;

use App\Models\Table;
use App\Services\QrCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TableController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tables = Table::where('restaurant_id', $request->user()->restaurant_id)
            ->with('activeSession')
            ->orderBy('number')
            ->get();
        return response()->json(['tables' => $tables]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'number' => ['required', 'integer'],
            'name' => ['required', 'string', 'max:100'],
            'capacity' => ['nullable', 'integer'],
            'zone' => ['nullable', 'string', 'max:100'],
            'qr_type' => ['nullable', 'in:static,dynamic'],
        ]);
        $data['restaurant_id'] = $request->user()->restaurant_id;
        return response()->json(['table' => Table::create($data)], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $table = Table::where('restaurant_id', $request->user()->restaurant_id)->findOrFail($id);
        $table->update($request->only(['name', 'capacity', 'zone', 'qr_type', 'is_active']));
        return response()->json(['table' => $table]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $table = Table::where('restaurant_id', $request->user()->restaurant_id)->findOrFail($id);
        $table->delete();
        return response()->json(['ok' => true]);
    }

    public function qr(Request $request, string $id, QrCodeService $qr): JsonResponse
    {
        $table = Table::where('restaurant_id', $request->user()->restaurant_id)->findOrFail($id);
        if ($table->qr_type !== 'static') {
            return response()->json([
                'message' => 'Table uses dynamic QR — open a session to print one.',
            ], 400);
        }
        $url = $qr->customerSessionUrl('table-' . $table->id);
        return response()->json([
            'table' => $table,
            'url' => $url,
            'qr' => $qr->dataUri($url),
        ]);
    }
}
