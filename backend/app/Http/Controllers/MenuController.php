<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = Menu::where('restaurant_id', $request->user()->restaurant_id)
            ->with(['category', 'options.choices'])
            ->orderBy('sort_order');
        if ($request->filled('category_id')) {
            $q->where('category_id', $request->category_id);
        }
        if ($request->filled('q')) {
            $q->where('name', 'like', '%' . $request->q . '%');
        }
        return response()->json(['menus' => $q->get()]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $menu = Menu::where('restaurant_id', $request->user()->restaurant_id)
            ->with('options.choices')
            ->findOrFail($id);
        return response()->json(['menu' => $menu]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'category_id' => ['required', 'uuid', 'exists:menu_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'name_en' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'calories' => ['nullable', 'integer'],
            'is_available' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'is_package_item' => ['nullable', 'boolean'],
            'is_addon' => ['nullable', 'boolean'],
            'tags' => ['nullable', 'array'],
        ]);
        $data['restaurant_id'] = $request->user()->restaurant_id;
        return response()->json(['menu' => Menu::create($data)], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $menu = Menu::where('restaurant_id', $request->user()->restaurant_id)->findOrFail($id);
        $data = $request->validate([
            'category_id' => ['sometimes', 'uuid', 'exists:menu_categories,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'name_en' => ['sometimes', 'nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'image' => ['sometimes', 'nullable', 'string'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'cost' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'is_available' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            'tags' => ['sometimes', 'array'],
        ]);
        $menu->update($data);
        return response()->json(['menu' => $menu]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $menu = Menu::where('restaurant_id', $request->user()->restaurant_id)->findOrFail($id);
        $menu->delete();
        return response()->json(['ok' => true]);
    }

    public function toggleAvailability(Request $request, string $id): JsonResponse
    {
        $menu = Menu::where('restaurant_id', $request->user()->restaurant_id)->findOrFail($id);
        $menu->update(['is_available' => !$menu->is_available]);
        return response()->json(['menu' => $menu]);
    }
}
