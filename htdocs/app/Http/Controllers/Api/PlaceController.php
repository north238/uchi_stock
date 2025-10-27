<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Throwable;

class PlaceController extends Controller
{
    /**
     * @var Place $places
     */
    protected $places;

    public function __construct(Place $places)
    {
        $this->places = $places;
    }

    /**
     * 保存場所一覧の取得API
     */
    public function index()
    {
        try {
            $groupId = Auth::user()->group_id;
            $places = $this->places->getPlacesListByGroupId($groupId);

            // データが存在しない場合
            if ($places->isEmpty()) {
                return response()->json([
                    'places' => [],
                    'status' => 'success',
                    'message' => '保管場所が登録されていません',
                ], 200);
            }

            return response()->json([
                'places' => $places,
                'status' => 'success',
                'message' => '保管場所一覧を取得しました',
            ], 200);
        } catch (Throwable $e) {
            Log::error('保管場所一覧取得エラー:', [
                'message' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'genres' => [],
                'status' => 'error',
                'message' => '保管場所一覧の取得に失敗しました',
            ], 500);
        }
    }
}
