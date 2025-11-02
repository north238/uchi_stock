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

            return response()->json($places->values(), 200);
        } catch (Throwable $e) {
            Log::error('保管場所一覧取得エラー:', [
                'message' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([], 500);
        }
    }

    /**
     * 保管場所登録API
     */
    public function store(Request $request)
    {
        $groupId = Auth::user()->group_id;
        $placeName = $request->input('name');
        // 返却値を初期化
        $status = 'success';
        $message = '保管場所を登録しました';
        $statusCode = 200;

        // 登録データ作成
        $data = [
            'name' => $placeName,
            'group_id' => $groupId,
        ];

        try {
            $this->places->createPlace($data);
        } catch (Throwable $e) {
            Log::error('保管場所登録エラー:', [
                'message' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            $status = 'error';
            $message = '保管場所を登録に失敗しました';
            $statusCode = 500;
        }

        return response()->json([
            'status' => $status,
            'message' => $message,
        ], $statusCode);
    }
}
