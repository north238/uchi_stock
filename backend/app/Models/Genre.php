<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Genre extends Model
{
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'color_id',
        'icon_id',
        'created_at',
        'updated_at'
    ];

    public function items()
    {
        return $this->hasMany(Item::class);
    }

    public function categories()
    {
        return $this->hasMany(Category::class);
    }

    public function color()
    {
        return $this->belongsTo(Color::class);
    }

    public function icon()
    {
        return $this->belongsTo(Icon::class);
    }

    /**
     * ジャンルに紐づくカテゴリー、カラー、アイコンを取得
     *
     * @return collection $result ジャンルに紐づくカテゴリー、カラー、アイコン
     */
    public function getGenresWithRelations()
    {
        return Genre::with(['categories', 'color', 'icon'])->get();
    }
}
