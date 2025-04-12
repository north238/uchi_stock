<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'status',
        'group_id',
        'requester_id',
        'approver_id',
        'approved_at'
    ];

    public function group()
    {
        return $this->belongsTo(Group::class, 'group_id');
    }
    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }
    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }
}
