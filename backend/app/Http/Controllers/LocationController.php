<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function index()
    {
        // 全ジャンルを取得
        $locations = Location::all();
        return response()->json($locations);
    }
}
