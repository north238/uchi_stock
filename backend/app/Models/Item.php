<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class Item extends Model
{
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'quantity',
        'description',
        'is_favorite',
        'user_id',
        'genre_id',
        'category_id',
        'location_id',
        'created_at',
        'updated_at'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function genre()
    {
        return $this->belongsTo(Genre::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function groups()
    {
        return $this->belongsToMany(Group::class, 'group_item');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'item_tag');
    }

    /**
     * ユーザーに紐づくアイテムの取得
     *
     * @param integer $userId ユーザーID
     *
     * @return collection $result ユーザーに紐づいたアイテム
     */
    public function getUserToItems($userId)
    {
        // $result = Item::query()
        //     ->with(['genre.color'])
        //     ->where('user_id', $userId)
        //     ->orderBy('created_at', 'DESC')
        //     ->orderBy('genre_id', 'DESC')
        //     ->get();

        // return $result;
        $subQuery = Item::query()
            ->selectRaw('MAX(created_at) as latest_created_at')
            ->whereColumn('genre_id', 'genres.id')
            ->toSql();

        $result = Genre::query()
            ->with(['color', 'items' => function ($query) use ($userId) {
                $query->where('user_id', $userId);
            }])
            ->selectRaw("genres.*, ($subQuery) as latest_created_at")
            ->get();

        return $result;
    }

    /**
     * ユーザーに紐づいたアイテムを取得
     *
     * @param integer $userId ユーザーID
     * @param integer $id アイテムID
     *
     * @return \App\Models\Item|null 取得したアイテムオブジェクト、該当なしの場合はnull
     */
    public function getUserToItem($userId, $id)
    {
        $result = Item::query()
            ->with(['genre.color'])
            ->where('user_id', $userId)
            ->where('id', $id)
            ->first();

        return $result;
    }

    /**
     * お気に入りされたアイテムリストを取得
     *
     * @param integer $userId ユーザーID
     *
     * @return \App\Models\Item|null 取得したアイテムオブジェクト、該当なしの場合はnull
     */
    public function fetchFavoriteItemData($userId)
    {
        $result = Item::query()
            ->with(['genre.color'])
            ->where('user_id', $userId)
            ->where('is_favorite', 1)
            ->orderBy('created_at', 'DESC')
            ->get();

        return $result;
    }

    /**
     * お気に入りの更新
     *
     * @param string $id アイテムID
     * @param integer $userId ユーザーID
     * @param integer $isFavorite お気に入り状態
     *
     * @return object $item 更新されたアイテム
     */
    public function updateFavorite($id, $userId, $isFavorite)
    {
        $item = $this->getUserToItem($userId, $id);

        $item->is_favorite = $isFavorite;
        $item->save();

        return $item;
    }
}
