<?php

namespace App\Http\Controllers;

use App\Models\MenuCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuCategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cats = MenuCategory::where('restaurant_id', $request->user()->restaurant_id)
            ->orderBy('sort_order')
            ->withCount('menus')
            ->get();
        return response()->json(['categories' => $cats]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'name_en' => ['nullable', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:50'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        $data['restaurant_id'] = $request->user()->restaurant_id;
        return response()->json(['category' => MenuCategory::create($data)], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $cat = MenuCategory::where('restaurant_id', $request->user()->restaurant_id)->findOrFail($id);
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'name_en' => ['sometimes', 'nullable', 'string', 'max:255'],
            'icon' => ['sometimes', 'nullable', 'string', 'max:50'],
            'sort_order' => ['sometimes', 'integer'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
        $cat->update($data);
        return response()->json(['category' => $cat]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $cat = MenuCategory::where('restaurant_id', $request->user()->restaurant_id)->findOrFail($id);
        $cat->delete();
        return response()->json(['ok' => true]);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate(['ids' => ['required', 'array']]);
        foreach ($request->ids as $i => $id) {
            MenuCategory::where('restaurant_id', $request->user()->restaurant_id)
                ->where('id', $id)
                ->update(['sort_order' => $i]);
        }
        return response()->json(['ok' => true]);
    }
}
