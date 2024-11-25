<?php

namespace App\Http\Controllers;

use App\Models\Genre;
use Illuminate\Http\Request;

class GenreController extends Controller
{
    public function index()
    {
        // 全ジャンルを取得
        $genres = Genre::all();
        return response()->json($genres);
    }
}
