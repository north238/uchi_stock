<?php

namespace App\Services;

use App\Enums\ItemStatus;
use App\Models\Item;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ItemService
{

    public function __construct()
    {
        //
    }

    /**
     * 購入履歴を記録し、ステータスを「ある」に更新する
     */
    public function recordPurchase(Item $item, User $user): void
    {
        DB::transaction(function () use ($item, $user) {
            $item->purchaseHistories()->create([
                'user_id' => $user->id,
                'purchased_at' => now(),
            ]);
            $item->update(['status' => ItemStatus::InStock]);
        });
    }

    /**
     * 直近の購入履歴を取り消し、ステータスを直前の状態に戻す
     */
    public function undoLatestPurchase(Item $item, ItemStatus $previous): void
    {
        DB::transaction(function () use ($item, $previous) {
            $latest = $item->purchaseHistories()->latest('purchased_at')->first();
            $latest?->delete();
            $item->update(['status' => $previous]);
        });
    }
}
