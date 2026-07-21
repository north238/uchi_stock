# UchiStock 実装計画書（MVP / フェーズ0）

最終更新: 2026-07-21
対象読者: 実装担当（AIエージェント）およびレビュアー（開発者本人）
上位文書: `docs/02_requirements.md`（要件を正とする）／ `docs/01_concept.md`（目的）

本書は要件書 §8「実装順序の推奨」を、現状コードに突き合わせて具体的なタスク・変更ファイル・受け入れ確認まで落とし込んだもの。
実装は本書のステップ順に、独立してレビュー可能な粒度でコミットを分ける。

---

## 0. 現状の把握（As-Is）

| 対象                | 現状                                                                                                                          |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------- | ------ |
| `items` テーブル    | `quantity` は `integer default 1`。`status` カラムは**無い**。`softDeletes` あり                                              |
| `Item` モデル       | `createItem` / `getItem` / `getItemsByGroupId`（`genre`,`place` を eager load）/ `updateItem`。ビジネスロジックはモデルに集約 |
| `ItemService`       | **空クラス**（未使用）                                                                                                        |
| `ItemController`    | index/create/store/edit/update/destroy。モデルメソッドを直接呼ぶ                                                              |
| ルート（`web.php`） | `items.` prefix、`['auth','check.group']` ミドルウェア。status/purchase 用ルートは無い                                        |
| バリデーション      | `ItemCreateRequest` / `ItemUpdateRequest` ともに `quantity => required                                                        | integer | min:1` |
| 一覧 `Index.tsx`    | PC=テーブル / モバイル=カードの2表示。quantity 表示。status・購入履歴の概念なし                                               |
| フォーム `Form.tsx` | `name`（必須）/ `quantity`（必須, default 1）/ `genre_id` / `place_id` / `memo`。音声入力あり                                 |
| 購入履歴            | テーブル・モデル・リレーションいずれも無い                                                                                    |
| テスト              | `tests/Feature` に Auth/Profile のみ。Item 系テスト・`ItemFactory` は無い                                                     |

## 1. 設計方針（実装前に確定すべき事項）

### 1.1 status の表現

- DB: `items.status`（`string`）。値は `in_stock` / `low` / `out` の3値、default `in_stock`。
- アプリ内: `App\Enums\ItemStatus`（PHP 8.1 の backed enum, `string`）を新規作成し、`Item` の `$casts` でキャスト。
  - 表示ラベル・並び順の重み（`out=0, low=1, in_stock=2`）を enum のメソッドとして持たせ、DB とフロントで解釈を一致させる。
- **設計原則の厳守**: status が常に正。`quantity` は参考表示のみで、並び順・判定・自動更新の**いかなるロジックにも使わない**（要件 §3.1）。

### 1.2 前回購入日の算出（N+1 回避）

- `getItemsByGroupId` に `->withMax('purchaseHistories as last_purchased_at', 'purchased_at')` を追加し、集約カラムとして1クエリで取得する（要件 §7）。
- 「前回購入から○日」はフロントで `last_purchased_at` から算出（`null` の場合は「購入記録なし」）。

### 1.3 並び順

- デフォルト: **ステータス順（out → low → in_stock）**、同ステータス内は `last_purchased_at` 昇順（`null` = 購入記録なしを先頭）。
- 切替: 「前回購入が古い順」。永続化は不要（要件 F-3）。
- DB 側で `orderByRaw` により解決（体感速度優先・要件 §7）。並び順キーはクエリパラメータ `sort`（`status` | `purchased`）で受ける。

### 1.4 API 設計（一覧上ワンタップ操作）

画面遷移なしの部分更新のため、既存 `update`（フォーム全体更新）とは別に軽量エンドポイントを追加する。

| 操作               | メソッド・パス                       | ルート名                 | 処理                                                       |
| ------------------ | ------------------------------------ | ------------------------ | ---------------------------------------------------------- |
| F-1 ステータス変更 | `PATCH /items/{id}/status`           | `items.status.update`    | `status` のみ更新                                          |
| F-2 買った記録     | `POST /items/{id}/purchase`          | `items.purchase.store`   | 履歴1件追加 + `status=in_stock` に更新（トランザクション） |
| F-2 取消(Undo)     | `DELETE /items/{id}/purchase/latest` | `items.purchase.destroy` | 直近履歴を削除 + status を元に戻す（※採用時のみ）          |

- いずれも Inertia の `router.patch/post`（`preserveScroll: true`）で呼ぶ。
- **認可**: 対象アイテムが操作ユーザーの `group_id` に属することを検証してから更新する（既存 edit/update は未チェックだが、新規分は group スコープを担保する）。

### 1.5 誤タップ対策（F-2）

- 推奨: 「買った」直後に**トースト内 Undo ボタン**（数秒）で `DELETE .../purchase/latest` を呼ぶ方式。ワンタップ UX を保てる。
- 代替: 記録前の確認ダイアログ（1エンドポイントで済む）。操作は最大2タップまで（要件 F-2）。
- どちらを採るかは実装着手時に決定（下記「未確定事項」）。

### 1.6 ビジネスロジックの置き場所

- 「買った」の履歴作成 + status 更新の**トランザクション処理は `ItemService` に実装**（空クラスを活用、Controller/Model と責務分離）。
- 単純な DB 取得・更新は既存パターン踏襲でモデルに置く。

## 2. 実装ステップとコミット分割

### ステップ1: DB・モデル基盤

**目的**: status と購入履歴のデータ基盤を用意する。

- [x] `items.quantity` を nullable 化 済み（`create_items_table` マイグレーションを直接編集。doctrine/dbal不要。理由: 2026-07時点でPhase 0は本番未反映のため、既存マイグレーション編集による影響なし）
- [ ] マイグレーション追加（既存は編集しない。上記quantityの変更を除く）
  - `items` に `status`（string, default `in_stock`, `name` の後ろ想定）を追加。既存レコードは `in_stock` で埋まる（default）。
  - `purchase_histories` 新規作成（要件 §3.2）: `id` / `item_id`(FK cascade) / `user_id`(FK nullOnDelete) / `purchased_at`(datetime) / `timestamps`。
- [ ] `App\Enums\ItemStatus` 作成（値・ラベル・並び順重み）。
- [ ] `App\Models\PurchaseHistory` 作成（`item()` / `user()` リレーション）。
- [ ] `Item` モデル更新: `status` を `$fillable` と `$casts`（`ItemStatus`）に追加。`purchaseHistories()`（hasMany）リレーション追加。
- コミット例: `追加：status・purchase_histories のマイグレーションとモデル`

### ステップ2: F-1 / F-2 API（テスト込み）

**目的**: ワンタップ操作のサーバー側を先に固める。

- [ ] ルート追加（`web.php` の `items` グループ内、`['auth','check.group']` 配下）。
- [ ] `ItemController@updateStatus`: `status` を3値でバリデーションし更新。group 認可。
- [ ] `ItemService@recordPurchase($item, $user)`: トランザクションで履歴作成 + `status=in_stock`。`ItemController@storePurchase` から呼ぶ。
- [ ] （Undo 採用時）`ItemController@destroyLatestPurchase`。
- [ ] テスト用ファクトリ: `ItemFactory` / `PurchaseHistoryFactory` を作成。
- [ ] Feature テスト（要件 §7 必須）:
  - `F-1`: status を変更 → DB 反映・レスポンス確認。他グループのアイテムは変更不可。
  - `F-2`: 買った → `purchase_histories` に1件（`purchased_at`, `user_id`）・当該 `status=in_stock`。
- コミット例: `追加：ステータス変更と購入記録のAPI（Featureテスト含む）`

### ステップ3: F-3 一覧のカード型リデザイン

**目的**: 判断特化 UI に置き換える。

- [ ] `ItemController@index`: `getItemsByGroupId` に `withMax(last_purchased_at)` と並び順（`sort` パラメータ）を反映。`status`・`last_purchased_at` を props に含める。
- [ ] `Index.tsx` をカード型に統一（既存の PC テーブルは廃止し、全幅でカード）。
  - 各カード: **品名 / ステータス / 前回購入から○日**（記録なしは「購入記録なし」）。
  - ステータス = 3分割セグメント（ある/少ない/ない）をタップで直接切替（1タップ、`router.patch` + `preserveScroll`）。
  - 「買った」ボタン（`router.post` + Undo トーストor確認）。
  - ジャンル・保管場所・メモ・quantity は補助表示（小さく or 詳細で）。
  - 並び替え UI（デフォルト=ステータス順 / 前回購入が古い順）。
  - 既存の検索・絞り込みがあれば維持（現状 Index には無いため新規実装は不要）。
- コミット例: `改修：一覧をカード型・ステータス主役にリデザイン`

### ステップ4: F-4 登録・編集フォーム調整

- [ ] `ItemCreateRequest` / `ItemUpdateRequest`: `quantity` を `nullable|integer|min:0` に変更。status を `nullable|in:in_stock,low,out`（未指定は `in_stock`）で受ける。
- [ ] `ItemController@store` / `@update`: `status` を保存対象に追加（未指定は `in_stock`）。
- [ ] `Form.tsx`: status 選択（3値, default `in_stock`）を追加。`quantity` を任意入力化（未入力可、default 強制をやめる）。`FormItemFields` / `FieldName` 型に `status` 追加。
- [ ] 音声入力フローは現状維持（`name`/`quantity` セットのまま。デグレなし）。
- コミット例: `改修：登録・編集フォームにステータス追加、数量を任意化`

### ステップ5: 音声入力デグレ確認・総仕上げ

- [ ] 音声入力での登録が従来どおり動作すること（`VoiceInput.tsx` / whisper 別リポジトリ / `api.voice.transcribe` は変更しない）。
- [ ] `php artisan test` グリーン。既存テスト維持。
- [ ] 一覧をスマホ幅で開き「買ってよいか」が3秒で判断できる密度・速度を目視確認（要件 §9）。

## 3. 変更予定ファイル一覧

| 種別       | ファイル                                                            | 変更                                             |
| ---------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| migration  | `database/migrations/2025_04_12_000500_create_items_table.php`      | 変更（quantityをnullable化・直接編集済み）       |
| migration  | `database/migrations/xxxx_add_status_to_items.php`                  | 新規                                             |
| migration  | `database/migrations/xxxx_create_purchase_histories_table.php`      | 新規                                             |
| enum       | `app/Enums/ItemStatus.php`                                          | 新規                                             |
| model      | `app/Models/PurchaseHistory.php`                                    | 新規                                             |
| model      | `app/Models/Item.php`                                               | 変更（fillable/casts/relation/withMax）          |
| service    | `app/Services/ItemService.php`                                      | 変更（recordPurchase）                           |
| controller | `app/Http/Controllers/ItemController.php`                           | 変更（index並び順, updateStatus, storePurchase） |
| request    | `app/Http/Requests/ItemCreateRequest.php` / `ItemUpdateRequest.php` | 変更（quantity/status）                          |
| route      | `routes/web.php`                                                    | 変更（status/purchase ルート追加）               |
| factory    | `database/factories/ItemFactory.php` / `PurchaseHistoryFactory.php` | 新規                                             |
| front      | `resources/js/Pages/Items/Index.tsx`                                | 変更（カード型・操作）                           |
| front      | `resources/js/Pages/Items/Partials/Form.tsx`                        | 変更（status追加・quantity任意）                 |
| test       | `tests/Feature/ItemStatusTest.php` / `ItemPurchaseTest.php`         | 新規                                             |

## 4. 変更しないもの（要件 §5 / §6 再掲）

認証（Breeze/Socialite）、音声入力（`VoiceInput.tsx`・whisper・`api.voice.transcribe`）、グループ機能、Docker 構成、ジャンル・保管場所管理。
スコープ外: 賞味期限・厳密な数量増減・通知・PWA化・購入周期推定・確認回数カウント。

## 5. 完了の定義（要件 §9）

- F-1〜F-4 の受け入れ条件を全て満たす。
- 変更禁止事項に差分がない。
- `php artisan test` がグリーン（F-1/F-2 の Feature テスト追加済み）。
- 開発者本人のスマホで、一覧を開いて「買ってよいか」が判断できる。

## 6. 確定した設計判断（旧・未確定事項）

1. **誤タップ対策 = Undo トースト**（DELETE エンドポイントを追加）。前ステータスは**フロントが保持**し、Undo 時に送って復元する（サーバに前状態を保存しない）。
2. **`quantity` nullable 化は既存マイグレーション（`create_items_table`）を直接編集して対応**。`doctrine/dbal` は導入しない（`change()` を使わないため不要）。2026-07時点でPhase 0は本番未反映のため、既存マイグレーション編集による影響はない。
3. **グループ認可は新規API＋既存 edit/update/destroy にも追加**。他グループの ID を直接叩いた場合は 404 とする（§7.6）。

## 7. 実装詳細仕様（バックエンド）

「ドキュメントだけで迷わず実装する」ための具体仕様。コードは方針を示すサンプルであり、既存規約（Controller/Service/Model の責務分離）に合わせて実装する。

### 7.1 事前準備

`items.quantity` の nullable 化は `create_items_table` マイグレーションを直接編集する方式に変更したため、
`doctrine/dbal` の追加は不要（事前準備コマンドなし）。

### 7.2 `App\Enums\ItemStatus`（新規）

```php
namespace App\Enums;

enum ItemStatus: string
{
    case InStock = 'in_stock'; // ある
    case Low     = 'low';      // 少ない
    case Out     = 'out';      // ない

    public function label(): string
    {
        return match ($this) {
            self::InStock => 'ある',
            self::Low     => '少ない',
            self::Out     => 'ない',
        };
    }

    /** 並び順の重み（小さいほど上＝買い時） */
    public function sortWeight(): int
    {
        return match ($this) {
            self::Out => 0, self::Low => 1, self::InStock => 2,
        };
    }

    /** ['in_stock','low','out'] */
    public static function values(): array
    {
        return array_map(fn ($c) => $c->value, self::cases());
    }
}
```

### 7.3 マイグレーション（`items.quantity` の nullable 化は既存マイグレーション直接編集で対応済み・下記の対象外）

`items.quantity` の nullable 化は `create_items_table` マイグレーション自体を直接編集済み
（`$table->integer('quantity')->nullable()->default(null)->comment('数量(任意)')`）。
以下は新規追加するマイグレーション。

```php
// 1) add_status_to_items
Schema::table('items', function (Blueprint $t) {
    $t->string('status', 20)->default('in_stock')->after('name')
      ->comment('在庫ステータス in_stock/low/out');
});
// 既存レコードは default により in_stock で埋まる。down は dropColumn('status')。

// 2) create_purchase_histories_table
Schema::create('purchase_histories', function (Blueprint $t) {
    $t->id();
    $t->foreignId('item_id')->constrained('items')->cascadeOnDelete();       // アイテム削除で履歴も削除
    $t->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // ユーザー削除で NULL
    $t->dateTime('purchased_at');
    $t->timestamps();
    $t->index(['item_id', 'purchased_at']); // 前回購入の集約用
});
```

### 7.4 モデル

`App\Models\PurchaseHistory`（新規）:

```php
class PurchaseHistory extends Model
{
    use HasFactory;
    protected $fillable = ['item_id', 'user_id', 'purchased_at'];
    protected $casts = ['purchased_at' => 'datetime'];

    public function item() { return $this->belongsTo(Item::class); }
    public function user() { return $this->belongsTo(User::class); }
}
```

`App\Models\Item`（変更）:

- `$fillable` に `'status'` を追加。
- `$casts` に `'status' => \App\Enums\ItemStatus::class` を追加。
- リレーション追加: `public function purchaseHistories() { return $this->hasMany(PurchaseHistory::class); }`
- `getItemsByGroupId` を差し替え（前回購入を1クエリで集約＋並び順）:

```php
public function getItemsByGroupId(?int $groupId, string $sort = 'status')
{
    if (is_null($groupId)) {
        return collect();
    }
    $query = $this->with(['genre', 'place'])
        ->withMax('purchaseHistories as last_purchased_at', 'purchased_at')
        ->where('group_id', $groupId);

    if ($sort === 'purchased') {
        // 前回購入が古い順（記録なし=NULL を先頭）
        $query->orderByRaw('last_purchased_at IS NOT NULL, last_purchased_at ASC');
    } else {
        // 状態順（out→low→in_stock）、同状態は前回購入が古い順（NULL 先頭）
        $query->orderByRaw("FIELD(status, 'out', 'low', 'in_stock')")
              ->orderByRaw('last_purchased_at IS NOT NULL, last_purchased_at ASC');
    }
    return $query->get();
}
```

> `last_purchased_at IS NOT NULL` を先頭に ASC 併記すると、NULL（=0）が先頭に来る（＝購入記録なしを上に）。

### 7.5 ルート（`routes/web.php` の `items` グループ内・`['auth','check.group']` 配下）

```php
Route::patch('/{id}/status',          [ItemController::class, 'updateStatus'])->name('status.update');
Route::post('/{id}/purchase',         [ItemController::class, 'storePurchase'])->name('purchase.store');
Route::delete('/{id}/purchase/latest',[ItemController::class, 'destroyLatestPurchase'])->name('purchase.destroy');
```

ルート名: `items.status.update` / `items.purchase.store` / `items.purchase.destroy`。

### 7.6 グループ認可（新規3本＋既存 edit/update/destroy）

コントローラ共通の取得メソッドを用意し、他グループの ID は 404 にする:

```php
private function findOwnedItem(string $id): Item
{
    $item = Item::where('id', $id)
        ->where('group_id', Auth::user()->group_id)
        ->first();
    abort_if(!$item, 404);
    return $item;
}
```

既存 `edit` / `update` / `destroy` の `$this->items->getItem($id)` 呼び出しも `findOwnedItem($id)` に置換する。

### 7.7 コントローラ（`ItemController`）

- **index**: `$sort = request('sort', 'status');` → `getItemsByGroupId($groupId, $sort)`。前回購入からの日数を付与して props へ:

```php
$items->each(function ($i) {
    $i->days_since_purchase = $i->last_purchased_at
        ? \Carbon\Carbon::parse($i->last_purchased_at)
            ->startOfDay()->diffInDays(now('Asia/Tokyo')->startOfDay())
        : null;
});
return Inertia::render('Items/Index', ['items' => $items, 'sort' => $sort]);
```

- **updateStatus(Request, id)**: `status` を `required|in:ItemStatus::values()` で検証 → `findOwnedItem` → `$item->update(['status' => $status])` → `redirect()->back()`。
- **storePurchase(id)**: `findOwnedItem` → `ItemService::recordPurchase($item, $request->user())` → `redirect()->back()`。**flash success は付けない**（完了フィードバックはフロントの Undo トースト（`docs/04` §10.7）に一本化し、レイアウトの自動トーストとの二重表示を避ける）。
- **destroyLatestPurchase(Request, id)**: `previous_status` を `required|in:values()` で検証 → `findOwnedItem` → `ItemService::undoLatestPurchase($item, ItemStatus::from($previousStatus))` → `redirect()->back()`。

**レスポンス契約**: 3本とも **Inertia の redirect back**（フロントは `preserveScroll:true` で位置維持し、一覧 props が最新化される）。JSON は返さない（既存流儀に合わせる）。

### 7.8 サービス（`ItemService`）

```php
public function recordPurchase(Item $item, User $user): void
{
    DB::transaction(function () use ($item, $user) {
        $item->purchaseHistories()->create([
            'user_id'      => $user->id,
            'purchased_at' => now(),
        ]);
        $item->update(['status' => ItemStatus::InStock]);
    });
}

public function undoLatestPurchase(Item $item, ItemStatus $previous): void
{
    DB::transaction(function () use ($item, $previous) {
        $latest = $item->purchaseHistories()->latest('purchased_at')->first();
        $latest?->delete();
        $item->update(['status' => $previous]);
    });
}
```

### 7.9 バリデーション（Request 変更）

`ItemCreateRequest` / `ItemUpdateRequest`:

- `quantity` → `['nullable', 'integer', 'min:0']`（現状の `required|min:1` を廃止）
- `status` → `['nullable', \Illuminate\Validation\Rule::enum(\App\Enums\ItemStatus::class)]`

`store` / `update` の保存配列に `status` を追加（未指定は `ItemStatus::InStock->value`）。

### 7.10 ファクトリ（テスト用・新規）

```php
// ItemFactory
'name'       => fake()->word(),
'status'     => fake()->randomElement(ItemStatus::values()),
'quantity'   => fake()->optional()->numberBetween(0, 10), // null あり
'group_id'   => null,  // テストで上書き
'created_by' => null,

// PurchaseHistoryFactory
'item_id'      => Item::factory(),
'user_id'      => User::factory(),
'purchased_at' => fake()->dateTimeBetween('-60 days', 'now'),
```

### 7.11 Feature テスト（最低限のケース）

`tests/Feature/ItemStatusTest.php`:

- 自グループのアイテムの status を patch → DB 反映・302 back。
- 他グループのアイテムを patch → **404**・DB 不変。
- 不正な status 値 → **422**。

`tests/Feature/ItemPurchaseTest.php`:

- 買った post → `purchase_histories` +1（`user_id`/`purchased_at`）・item.status = `in_stock`。
- 他グループ → **404**。
- Undo delete（`previous_status=low`）→ 最新履歴が削除され status = `low` に復元。

共通: `actingAs($user)`、グループ・アイテムは factory で用意。

### 7.12 フロント連携用に props へ渡す形（§04 と対応）

各アイテムに以下を含める（`Items/Index`）:

| キー                  | 型                         | 内容                                |
| --------------------- | -------------------------- | ----------------------------------- |
| `status`              | `'in_stock'\|'low'\|'out'` | 現在ステータス                      |
| `last_purchased_at`   | ISO文字列 \| null          | 最新購入日時（Asia/Tokyo）          |
| `days_since_purchase` | number \| null             | 前回購入からの日数（null=記録なし） |
| `quantity`            | number \| null             | 数量（参考・null あり）             |

ページ props に `sort`（`'status'\|'purchased'`）も渡す。
