<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        // 全カテゴリを取得
        $categories = Category::all();
        return response()->json($categories);
    }
}
