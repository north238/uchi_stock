<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Color extends Model
{
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'color_name',
        'hex_code',
        'created_at',
        'updated_at'
    ];

    public function genres() {
        return $this->hasMany(Genre::class);
    }
}
