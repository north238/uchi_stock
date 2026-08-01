<?php

namespace App\Http\Controllers;

use App\Enums\ItemStatus;
use App\Http\Requests\ItemCreateRequest;
use App\Http\Requests\ItemUpdateRequest;
use App\Models\Item;
use App\Services\ItemService;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Throwable;

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
        $groupId = Auth::user()->group_id;
        $sort = request('sort', 'status');
        $items = $this->items->getItemsByGroupId($groupId, $sort);

        $items->each(function ($item) {
            $item->days_since_purchase = $item->last_purchased_at
                ? Carbon::parse($item->last_purchased_at)
                    ->startOfDay()->diffInDays(now('Asia/Tokyo')->startOfDay())
                : null;
        });

        return Inertia::render('Items/Index', [
            'items' => $items,
            'sort' => $sort,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Items/Create');
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
                'status' => $requestData['status'] ?? ItemStatus::InStock->value,
                'quantity' => $requestData['quantity'] ?? null,
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

            // 登録＝購入とみなし、初回の購入履歴を1件作成する（ステータスは上書きしない）
            $this->itemService->createInitialPurchaseHistory($item, $request->user());

            Log::info('【アイテム】作成処理完了', [
                'user_id' => $request->user()->id,
                'item_id' => $item->id,
            ]);

            DB::commit();

            // 成功メッセージを表示
            return redirect()
                ->route('items.index')
                ->with('success', "{$item->name}を登録しました");
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
                ->with('error', 'ストックの保存に失敗しました。');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $item = $this->findOwnedItem($id);

        return Inertia::render('Items/Edit', [
            'item' => $item,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ItemUpdateRequest $request, string $id)
    {
        $item = $this->findOwnedItem($id);

        try {
            DB::beginTransaction();

            $validatedData = $request->validated();
            $validatedData['status'] = $validatedData['status'] ?? ItemStatus::InStock->value;

            // アイテムを更新
            $updatedItem = $this->items->updateItem($id, $validatedData);
            if (!$updatedItem) {
                throw new Exception('アイテムの更新に失敗しました');
            }

            Log::info('【アイテム更新】処理完了', [
                'user_id' => $request->user()->id,
                'item_id' => $item->id,
            ]);

            DB::commit();

            // 成功メッセージを表示
            return redirect()
                ->route('items.index')
                ->with('success', 'ストックが更新されました。');
        } catch (Exception $e) {
            DB::rollBack();

            Log::error('【アイテム更新】処理エラー', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'request' => $request->except(['_token']),
            ]);

            return redirect()
                ->back()
                ->with('error', 'ストックの更新に失敗しました。');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $item = $this->findOwnedItem($id);
        // TODO::ロール確認
        $userId = Auth::id();

        try {
            DB::beginTransaction();

            // アイテム論理削除
            $item->delete();

            DB::commit();
            Log::info('【アイテム削除】処理完了', [
                'user_id' => $userId,
                'items_id' => $id,
            ]);

            return redirect()->back()->with('success', 'ストックを削除しました。');
        } catch (Throwable $e) {
            DB::rollBack();

            Log::error('【アイテム削除】システムエラー', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'items_id' => $id,
            ]);

            return redirect()->back()->with('error', 'ストックの削除に失敗しました。');
        }
    }

    /**
     * ステータスを更新する
     */
    public function updateStatus(Request $request, string $id)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(ItemStatus::class)],
        ]);

        $item = $this->findOwnedItem($id);
        $item->update(['status' => $validated['status']]);

        return redirect()->back();
    }

    /**
     * 「買った」を記録する
     */
    public function storePurchase(Request $request, string $id)
    {
        $item = $this->findOwnedItem($id);
        $this->itemService->recordPurchase($item, $request->user());

        return redirect()->back();
    }

    /**
     * 直近の購入記録を取り消す（Undo）
     */
    public function destroyLatestPurchase(Request $request, string $id)
    {
        $validated = $request->validate([
            'previous_status' => ['required', Rule::enum(ItemStatus::class)],
        ]);

        $item = $this->findOwnedItem($id);
        $this->itemService->undoLatestPurchase($item, ItemStatus::from($validated['previous_status']));

        return redirect()->back();
    }

    /**
     * 自グループに属するアイテムを取得する（他グループは404）
     */
    private function findOwnedItem(string $id): Item
    {
        $item = Item::where('id', $id)
            ->where('group_id', Auth::user()->group_id)
            ->first();
        abort_if(!$item, 404);
        return $item;
    }
}
