<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Item extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'quantity',
        'memo',
        'genre_id',
        'place_id',
        'group_id',
        'created_by',
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
