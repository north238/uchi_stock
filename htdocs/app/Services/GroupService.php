<?php

namespace App\Services;

use App\Models\Group;
use App\Models\User;

class GroupService
{
  /**
   * @var Group $group
   */
  protected $group;
  /**
   * @var User $user
   */
  protected $user;

  public function __construct(Group $group, User $user)
  {
    $this->group = $group;
    $this->user = $user;
  }
  /**
   * グループの初期設定を行う
   *
   * @param User $user
   * @return \Illuminate\Http\RedirectResponse
   */
  public function initializeGroup($user)
  {
    $saveData = [
      'name' => $user->name . 'さんのグループ',
      'description' => '自動生成された個人グループ',
      'status' => 0,
      'is_temporary' => 1,
      'created_by' => $user->id,
    ];
    // グループ設定を保存
    $group = $this->group->saveGroupData($saveData);
    if (!$group) {
      return redirect()->back()->with(['error' => 'グループ設定の保存に失敗しました。']);
    }

    // ユーザーのグループIDを更新
    $this->user->updateGroupId($user->id, $group->id);

    return redirect()->route('dashboard')->with('success', 'グループの初期設定が保存されました。いつでもグループ設定を変更できます。');
  }
}
