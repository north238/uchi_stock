<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

use function Laravel\Prompts\error;

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
            'description' => 'nullable|string|max:255',
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
    public function show($id)
    {
        $userId = Auth::user()->id;
        $item = $this->item->getUserToItem($userId, $id);

        return response()->json([
            'message' => 'アイテムの取得に成功しました。',
            'data' => $item
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Item $item)
    {
        $userId = Auth::user()->id;
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:255',
            'quantity' => 'required|integer|min:1',
            'genre_id' => 'required|exists:genres,id',
            'category_id' => 'required|exists:categories,id',
            'location_id' => 'required|exists:locations,id',
        ]);

        try {
            $item->update([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'quantity' => $validated['quantity'],
                'genre_id' => $validated['genre_id'],
                'category_id' => $validated['category_id'],
                'location_id' => $validated['location_id'],
                'user_id' => $userId,
            ]);
            return response()->json([
                'message' => 'アイテムの更新に成功しました。',
                'data' => $item
            ], 200);

        } catch (\Exception $e) {
            Log::error(["message" => $e->getMessage()]);
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
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
