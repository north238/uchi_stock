<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class GenreController extends Controller
{
    /**
     * ジャンル作成画面表示
     */
    public function create()
    {
        return Inertia::render('Genres/Create');
    }
}
