<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    public function category() {
        return $this->belongsTo(Category::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function genre() {
        return $this->belongsTo(Genre::class);
    }

    public function location() {
        return $this->belongsTo(Location::class);
    }

    public function groups() {
        return $this->belongsToMany(Group::class, 'group_item');
    }

    public function tags() {
        return $this->belongsToMany(Tag::class, 'item_tag');
    }

    /**
     * ユーザーに紐づくアイテムの取得
     *
     * @param string $userId ユーザーID
     * @return collection $result ユーザーに紐づいたアイテム
     */
    public function getUserToItems($userId) {
        $result = Item::query()
            ->where('user_id', $userId)
            ->get();

        return $result;
    }
}
