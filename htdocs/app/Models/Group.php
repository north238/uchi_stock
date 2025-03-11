<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'created_at',
        'updated_at'
    ];

    public function items() {
        return $this->belongsToMany(Item::class, 'group_item');
    }

    public function users() {
        return $this->belongsToMany(User::class, 'user_group');
    }
}
