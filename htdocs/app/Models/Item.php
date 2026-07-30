<?php

namespace App\Models;

use App\Enums\ItemStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Item extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'status',
        'quantity',
        'is_favorite',
        'memo',
        'genre_id',
        'place_id',
        'group_id',
        'created_by',
    ];

    protected $casts = [
        'status' => ItemStatus::class,
    ];

    protected $dates = [
        'deleted_at'
    ];

    public function genre()
    {
        return $this->belongsTo(Genre::class, 'genre_id');
    }
    public function place()
    {
        return $this->belongsTo(Place::class, 'place_id');
    }
    public function group()
    {
        return $this->belongsTo(Group::class, 'group_id');
    }
    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    public function purchaseHistories()
    {
        return $this->hasMany(PurchaseHistory::class);
    }

    /**
     * アイテムデータの作成
     *
     * @param array $data 登録データの配列
     * @return \App\Models\Item 登録したアイテムデータ
     */
    public function createItem(array $data): Item
    {
        return $this->create($data);
    }

    /**
     * アイテムデータの取得
     *
     * @param int $itemId アイテムID
     * @return \App\Models\Item|null アイテムデータ
     */
    public function getItem(int $itemId): ?Item
    {
        return $this->find($itemId);
    }

    /**
     * グループIDに基づくアイテムデータの取得
     *
     * @param int|null $groupId グループID
     * @param string $sort 並び順（'status'=状態順（既定） / 'purchased'=前回購入が古い順）
     */
    public function getItemsByGroupId(?int $groupId, string $sort = 'status')
    {
        if (is_null($groupId)) {
            return collect();
        }

        $query = $this->with(['genre', 'place'])
            ->withMax('purchaseHistories as last_purchased_at', 'purchased_at')
            ->where('group_id', $groupId);

        if ($sort === 'purchased') {
            // 前回購入が古い順（記録なし=NULL を先頭）
            $query->orderByRaw('last_purchased_at IS NOT NULL, last_purchased_at ASC');
        } else {
            // 状態順（out→low→in_stock）、同状態は前回購入が古い順（NULL 先頭）
            $query->orderByRaw("FIELD(status, 'out', 'low', 'in_stock')")
                ->orderByRaw('last_purchased_at IS NOT NULL, last_purchased_at ASC');
        }

        return $query->get();
    }

    /**
     * アイテムデータの更新
     *
     * @param int $itemId アイテムID
     * @param array $data 更新データの配列
     * @return \App\Models\Item|null 更新したアイテムデータ
     */
    public function updateItem(int $itemId, array $data): ?Item
    {
        $item = $this->find($itemId);
        if ($item) {
            $item->update($data);
            return $item;
        }
        return null;
    }
}
