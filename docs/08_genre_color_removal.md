# UchiStock ジャンルの Color 切り離しと登録 API 整理 指示書（Phase 13）

作成日: 2026-08-01
対象読者: 実装担当（Claude Code）およびレビュアー（開発者本人）
上位文書: `docs/02_requirements.md`（変更禁止事項）／ `docs/05_implementation_todo.md`（バックログ「Color関連」）
関連: `docs/09_ui_consistency_fixes.md`（Phase 12。**Phase 12 §6-2 は本書の完了に依存する**）

---

## 0. 位置づけと実施順序

本書は 2 つの変更を **1 つのフェーズにまとめる**。どちらも `Api/GenreController::store()` と `Genre` モデルという同じ箇所に触るため、分けて実施すると同じコードを二度書き換えることになる。

1. **ジャンルから Color を切り離す** — `docs/05` バックログ「Color関連」の選択肢 (b) を採用する（2026-08-01 決定）
2. **ジャンル登録 API が作成したレコードを返すようにする** — Phase 12 §6-2「追加直後の自動選択」の前提

**実施順序: Phase 13 → Phase 12。** Phase 12 のコミット8（自動選択）は本書の完了を待つこと。Phase 12 のそれ以外のコミットは本書と独立しているため、先行して進めてもよい。

### 変更禁止事項の解除について

`CLAUDE.md` §8 および `docs/02` §5 は「ジャンル・保管場所の管理機能」を変更禁止としている。`docs/05` のバックログにも「着手前に必ずユーザーの明示的な合意を取ること」と記されている。

**2026-08-01 に開発者本人の合意を取得済み。** ただし Phase 11（音声入力削除）と同様に、**ドキュメント先行**の順序を厳守すること（§1）。ドキュメント更新前にコードへ手を入れてはならない。

なお本書で解除するのは **ジャンル（`Genre` / `Api/GenreController` / `colors`）に限る**。保管場所（`Place` / `Api/PlaceController`）は引き続き変更禁止で、§4 のレスポンス形状合わせのみ例外的に触れる（§4-3 参照）。

---

## 1. ドキュメント先行更新（コード変更前に必須）

以下をすべて完了させてから、コードに着手すること。

- `CLAUDE.md` §8 の「変更禁止: 認証、グループ機能、Docker 構成、ジャンル・保管場所管理」から**ジャンルを除外**し、Phase 13 の対象である旨を注記する。保管場所は変更禁止のまま残す。
- `docs/02_requirements.md` §5 の変更禁止事項に同様の注記を追加する。
- `docs/05_implementation_todo.md` のバックログ「Color関連（未使用の色分け機能）」について、**選択肢 (b) を採用して決着した**旨を追記し、Phase 13 のチェックリストへ移す。バックログ項目自体は経緯として残してよい（Phase 11 で `docs/` の音声入力記述を historical に残したのと同じ扱い）。
- `docs/05_implementation_todo.md` に `## Phase 13` の節を新設し、本書のチェックリストを転記する。

---

## 2. 現状の把握

### 2-1. Color の利用実態

`docs/05` バックログの調査結果のとおり、**画面上でジャンルの色が表示・選択される箇所はゼロ**。バックエンドは `with('color')` で毎回 eager load し、API レスポンスにも含めているが、フロントの `BackendOption` 型が `{ id: number; name: string }` のため受け取った時点で破棄している。

`docs/04` のカラー設計（緑＝ステータス／コーラル＝アクション／danger＝破壊的操作）にも、ジャンルごとの任意色分けは登場しない。

### 2-2. 関連コードの所在

| ファイル                                                        | 該当箇所                                                                                         |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `app/Models/Genre.php`                                          | `$fillable` の `color_id`、`color()` リレーション、`getGenresListByGroupId()` の `with('color')` |
| `app/Models/Color.php`                                          | モデル全体                                                                                       |
| `app/Http/Controllers/Api/GenreController.php`                  | `store()` の `'color_id' => 1, // デフォルトカラーID`                                            |
| `database/migrations/2025_04_11_000000_create_genres_table.php` | `foreignId('color_id')->nullable()->constrained('colors')->nullOnDelete()`                       |
| `database/migrations/*_create_colors_table.php`                 | テーブル定義（ファイル名は実装時に確認）                                                         |
| `database/seeders/ColorsTableSeeder.php`                        | 143 行のカラーパレット                                                                           |
| `database/seeders/DatabaseSeeder.php`                           | `ColorsTableSeeder` の呼び出し                                                                   |

**着手前に `grep -rn "color" htdocs/app htdocs/database htdocs/resources htdocs/tests` を実行し、上表以外の参照がないことを確認すること。** `GenreFactory` が存在する場合は `color_id` を持っている可能性が高いので必ず確認する。

保管場所（`places`）に `color_id` は**存在しない**（確認済み）。

---

## 3. DB からの Color 除去

### 3-1. 方針

**既存マイグレーションは編集せず、新規マイグレーションで削除する。** 本番（Raspberry Pi）へ既にデプロイ済みであるため、既存ファイルの書き換えでは本番の DB に反映されない。

削除の順序を守ること。`genres.color_id` は `colors` への外部キー制約を持つため、**先に外部キーと列を落としてから `colors` テーブルを落とす**。

### 3-2. マイグレーション

`database/migrations/` に 1 本追加する（例: `2026_08_01_000000_drop_colors_and_genre_color_id.php`）。

```php
public function up(): void
{
    Schema::table('genres', function (Blueprint $table) {
        $table->dropForeign(['color_id']);
        $table->dropColumn('color_id');
    });

    Schema::dropIfExists('colors');
}

public function down(): void
{
    // colors を先に復元してから FK を張り直す
    Schema::create('colors', function (Blueprint $table) {
        // 既存の create_colors_table マイグレーションと同一の定義にすること
    });

    Schema::table('genres', function (Blueprint $table) {
        $table->foreignId('color_id')->nullable()->constrained('colors')->nullOnDelete()->comment('色ID');
    });
}
```

- `down()` の `colors` 定義は、既存の `create_colors_table` マイグレーションからそのまま写すこと。推測で書かない。
- `dropForeign(['color_id'])` は配列形式で指定する（Laravel が制約名を規約から解決する）。制約名が規約外だった場合は `SHOW CREATE TABLE genres;` で実名を確認して指定する。
- `doctrine/dbal` は不要（`change()` を使わないため）。

### 3-3. 既存マイグレーションファイルの扱い

`create_colors_table` および `create_genres_table` の**ファイル自体は削除しない**。`migrate:fresh` では「作って落とす」動きになるが、本番と開発でマイグレーション履歴を一致させるほうが優先。

---

## 4. アプリケーションコードの整理

### 4-1. モデル・シーダー

- `app/Models/Genre.php`
  - `$fillable` から `'color_id'` を削除
  - `color()` リレーションを削除
  - `getGenresListByGroupId()` から `->with('color')` を削除（**eager load が 1 本減る副次効果あり**）
- `app/Models/Color.php` を削除
- `database/seeders/ColorsTableSeeder.php` を削除し、`DatabaseSeeder.php` から呼び出しを削除
- `GenreFactory` が `color_id` を定義している場合は削除

### 4-2. `Api/GenreController::store()` の改修

Color 除去とレコード返却を同時に行う。既存のレスポンスエンベロープ（`status` / `message`）は維持し、`data` を追加する（2026-08-01 決定。`index()` のように配列直返しへ変えると、フロントのエラー処理を広く見直す必要が出るため）。

```php
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
            'status'  => 'error',
            'message' => 'ジャンルの登録に失敗しました',
            'data'    => null,
        ], 500);
    }

    return response()->json([
        'status'  => 'success',
        'message' => 'ジャンルを登録しました',
        'data'    => ['id' => $genre->id, 'name' => $genre->name],
    ], 201);
}
```

変更点:

- `'color_id' => 1` を削除
- 成功時に `data` として作成したレコードの `id` / `name` を返す
- 成功時のステータスコードを `200` → `201`（フロントは `res.data` しか見ておらずステータスコードに依存していないため影響なし）
- エラー時も `data: null` を含めて形状を揃える
- 既存メッセージの「ジャンルを登録に失敗しました」は日本語として不自然なため「ジャンルの登録に失敗しました」に直す（文言のみ）

**`name` のバリデーション（必須・最大長・重複禁止）は本書のスコープ外。** 現状どおり素通しとし、`docs/05` のバックログに「ジャンル登録 API にバリデーションがない」として記録すること。ID を返す方式にしたことで、同名重複があっても自動選択は正しく動作する。

### 4-3. `Api/PlaceController::store()`

保管場所は変更禁止領域だが、Phase 12 §6-2 でジャンルと同じ扱いをするため、**レスポンス形状を合わせる変更のみ**を許可する。

- `store()` に `data` を追加し、ジャンルと同一の形状にする
- **これ以外の変更（バリデーション追加・リファクタ・整形）は一切禁止**
- `places` に `color_id` は無いため、Color 関連の変更は発生しない

### 4-4. フロント

`resources/js/api/optionsApi.ts` の `addGenre` / `addPlace` に戻り値の型を付ける（実装の詳細は `docs/09` §6-2 を参照）。

```ts
export type AddOptionResponse = {
  status: string;
  message: string;
  data: { id: number; name: string } | null;
};
```

`BackendOption`（`{ id, name }`）はそのまま。`index()` から `color` が消えてもフロントは元々破棄していたため、**表示上の変化はない**。

---

## 5. テスト

`tests/Feature/` に `GenreApiTest.php` を新規作成する。

- `POST /api/genres` が 201 を返し、`data.id` / `data.name` が含まれること
- 作成されたレコードが操作ユーザーの `group_id` に紐づくこと
- `GET /api/genres` が自グループのジャンルのみを返すこと（既存挙動の回帰防止）
- 保管場所側も同等のケースを 1 件ずつ追加する

`migrate` 後に `genres` テーブルへ `color_id` 列が存在しないことも確認すること（`Schema::hasColumn('genres', 'color_id')` が `false`）。

---

## 6. 変更対象ファイル一覧

| ファイル                                                              | 変更内容                                        | 該当節 |
| --------------------------------------------------------------------- | ----------------------------------------------- | ------ |
| `CLAUDE.md`                                                           | §8 の変更禁止からジャンルを除外                 | §1     |
| `docs/02_requirements.md`                                             | §5 に同旨を注記                                 | §1     |
| `docs/05_implementation_todo.md`                                      | バックログ決着・Phase 13 追加・実施記録         | §1     |
| `database/migrations/2026_08_01_*_drop_colors_and_genre_color_id.php` | 新規                                            | §3     |
| `app/Models/Genre.php`                                                | `color_id` / `color()` / `with('color')` を削除 | §4-1   |
| `app/Models/Color.php`                                                | 削除                                            | §4-1   |
| `database/seeders/ColorsTableSeeder.php`                              | 削除                                            | §4-1   |
| `database/seeders/DatabaseSeeder.php`                                 | `ColorsTableSeeder` の呼び出しを削除            | §4-1   |
| `database/factories/GenreFactory.php`                                 | `color_id` を持っていれば削除（存在確認のうえ） | §4-1   |
| `app/Http/Controllers/Api/GenreController.php`                        | `color_id` 削除・`data` 返却・201・文言修正     | §4-2   |
| `app/Http/Controllers/Api/PlaceController.php`                        | `data` 返却のみ（他は触らない）                 | §4-3   |
| `resources/js/api/optionsApi.ts`                                      | 戻り値の型を付与                                | §4-4   |
| `tests/Feature/GenreApiTest.php`                                      | 新規                                            | §5     |

---

## 7. コミット分割

1. `更新：ジャンルのColor切り離し方針をドキュメントに反映`（§1。**コード変更を含めない**）
2. `削除：genres.color_id と colors テーブルを削除するマイグレーションを追加`（§3）
3. `削除：Colorモデル・シーダー・Genreのリレーションを除去`（§4-1）
4. `改修：ジャンル登録APIが作成したレコードを返すようにする`（§4-2, §4-3, §4-4）
5. `追加：ジャンル・保管場所APIのFeatureテスト`（§5）

---

## 8. 完了の定義

- §1 のドキュメント更新が、コード変更より前のコミットとして存在する。
- `php artisan migrate` が成功し、`genres.color_id` と `colors` テーブルが存在しない。
- `php artisan migrate:fresh --seed` が成功し、シードが通る（`ColorsTableSeeder` 削除の影響がない）。
- `php artisan test` がグリーン（新規テストを含む。既知の Auth 系・環境起因の失敗のみ許容）。
- `grep -rn "color" htdocs/app htdocs/database htdocs/resources` で、`docs/` 以外にジャンル由来の Color 参照が残っていない（`docs/04` のカラートークンは無関係なので対象外）。
- ブラウザでアイテム登録画面を開き、ジャンル・保管場所のセレクトが従来どおり表示・選択・追加できる（表示上の変化がないこと）。
- `git diff` に、認証・グループ機能・Docker 構成の差分が含まれていない。保管場所は §4-3 の `data` 追加のみ。
