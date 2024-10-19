<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'genre_id',
        'created_at',
        'updated_at'
    ];

    public function items() {
        return $this->hasMany(Item::class);
    }

    public function genre() {
        return $this->belongsTo(Genre::class);
    }
}
