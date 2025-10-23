<?php

namespace App\Http\Controllers;

use App\Http\Requests\ItemCreateRequest;
use App\Models\Item;
use App\Services\ItemService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ItemController extends Controller
{
    /**
     * @var Item $items
     */
    protected $items;

    /**
     * @var ItemService $itemService
     */
    protected $itemService;

    public function __construct(Item $items, ItemService $itemService)
    {
        $this->items = $items;
        $this->itemService = $itemService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $apiUrl = route('api.voice.transcribe');
        return Inertia::render('Items/Create', [
            'apiUrl' => $apiUrl,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ItemCreateRequest $request)
    {
        try {
            // バリデーション
            $requestData = $request->validated();

            $saveData = [
                'name' => $requestData['name'],
                'quantity' => $requestData['quantity'],
                'is_favorite' => $requestData['is_favorite'] ?? 0,
                'memo' => $requestData['memo'] ?? null,
                'genre_id' => $requestData['genre_id'] ?? null,
                'place_id' => $requestData['place_id'] ?? null,
                'group_id' => $request->user()->group_id,
                'created_by' => $request->user()->id,
            ];

            DB::beginTransaction();

            // アイテムを保存
            $item = $this->items->createItem($saveData);
            if (!$item) {
                throw new Exception('アイテムの保存に失敗しました。');
            }

            Log::info('【アイテム】作成処理完了', [
                'user_id' => $request->user()->id,
                'item_id' => $item->id,
            ]);

            DB::commit();

            // 成功メッセージを表示
            return redirect()
                ->route('items.create')
                ->with('success', 'アイテムが追加されました。');
        } catch (Exception $e) {
            DB::rollBack();

            Log::error('【アイテム】作成処理エラー', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'request' => $request->except(['_token']),
            ]);

            return redirect()
                ->back()
                ->with('error', 'アイテムの保存に失敗しました。');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
