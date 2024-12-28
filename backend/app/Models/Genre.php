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
        'created_at',
        'updated_at'
    ];

    public function items()
    {
        return $this->hasMany(Item::class);
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
     * @return collection $result ジャンルに紐づくカラー
     */
    public function getGenresWithRelations()
    {
        return Genre::select(
            'genres.id as genre_id',
            'genres.name as genre_name',
            'colors.color_name',
            'colors.hex_code'
        )
        ->join('colors', 'genres.color_id', '=', 'colors.id')
        ->get()
        ->toArray();
    }
}
