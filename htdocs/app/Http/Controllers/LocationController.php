<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LocationController extends Controller
{
    public function index()
    {
        $userId = Auth::user()->id;

        $locations = Location::query()
            ->where('user_id', $userId)
            ->get();

        return response()->json($locations);
    }
}
