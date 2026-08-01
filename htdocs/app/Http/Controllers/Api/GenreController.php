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

            return response()->json($genres->values(), 200);
        } catch (Throwable $e) {
            Log::error('ジャンル一覧取得エラー:', [
                'message' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([], 500);
        }
    }

    /**
     * ジャンル登録API
     */
    public function store(Request $request)
    {
        $groupId = Auth::user()->group_id;
        $genreName = $request->input('name');

        try {
            $genre = $this->genres->createGenre([
                'name' => $genreName,
                'group_id' => $groupId,
            ]);
        } catch (Throwable $e) {
            Log::error('ジャンル登録エラー:', [
                'message' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'ジャンルの登録に失敗しました',
                'data' => null,
            ], 500);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'ジャンルを登録しました',
            'data' => ['id' => $genre->id, 'name' => $genre->name],
        ], 201);
    }
}
