<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Genre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

class GenreController extends Controller
{
    /**
     * @var Genre $genres
     */
    protected $genres;

    public function __construct(Genre $genres)
    {
        $this->genres = $genres;
    }
    /**
     * ジャンル一覧取得API
     */
    public function index()
    {
        try {
            $groupId = Auth::user()->group_id;
            $genres = $this->genres->getGenresListByGroupId($groupId);

            // データが存在しない場合
            if ($genres->isEmpty()) {
                return response()->json([
                    'genres' => [],
                    'status' => 'success',
                    'message' => 'ジャンルが登録されていません',
                ], 200);
            }

            return response()->json([
                'genres' => $genres,
                'status' => 'success',
                'message' => 'ジャンル一覧を取得しました',
            ], 200);
        } catch (Throwable $e) {
            Log::error('ジャンル一覧取得エラー:', [
                'message' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'genres' => [],
                'status' => 'error',
                'message' => 'ジャンル一覧の取得に失敗しました',
            ], 500);
        }
    }

    /**
     * ジャンル登録API
     */
    public function store(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'message' => 'ジャンル一覧を取得しました',
        ], 200);
    }
}
