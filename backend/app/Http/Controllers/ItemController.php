<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ItemController extends Controller
{

    /**
     * @var Item $item
     */
    protected $item;

    public function __construct(Item $item)
    {
        $this->item = $item;
    }
    /**
     * 初期表示画面
     */
    public function index()
    {
        $userId = Auth::user()->id;
        $items = $this->item->getUserToItems($userId);

        if (empty($items)) {
            return response()->json(['error' => 'アイテムが見つからないか、アクセス権限がありません。'], 403);
        }

        return response()->json($items, 200);
    }

    /**
     * データベースへの登録
     */
    public function store(Request $request)
    {
        $userId = Auth::user()->id;
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'string|max:255',
            'quantity' => 'required|integer',
            'genre_id' => 'required|exists:genres,id',
            'category_id' => 'required|exists:categories,id',
            'location_id' => 'required|exists:locations,id',
        ]);

        $validated['user_id'] = $userId;

        $item = Item::create($validated);
        return response()->json([
            'message' => 'アイテムの登録に成功しました。',
            'data' => $item
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Item $item)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Item $item)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Item $item)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $userId = Auth::user()->id;
        $item = $this->item->getUserToItem($userId, $id);

        if (!$item) {
            return response()->json(['message' => 'アイテムが見つからないか、削除権限がありません。'], 404);
        }

        try {
            $item->delete();
            return response()->json(['message' => 'アイテムの削除に成功しました。']);
        } catch (\Exception $e) {
            Log::error(["message" => $e->getMessage()]);
            return response()->json(['message' => 'アイテムの削除に失敗しました。'], 500);
        }

    }
}
