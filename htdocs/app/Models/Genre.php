<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Genre extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'color_id',
        'group_id',
    ];

    public function color()
    {
        return $this->belongsTo(Color::class, 'color_id');
    }
    public function group()
    {
        return $this->belongsTo(Group::class, 'group_id');
    }
}
