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
        'image_path',
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
}
