# CLAUDE.md — uchi_stock 開発ガイド

このファイルは、リポジトリで作業するエージェント（Claude Code）向けのプロジェクト知識をまとめたものです。
旧 `.github/copilot-instructions.md`（Copilot向け・情報が古い）を現状に合わせて置き換えたものです。

上位のプロダクト文書は `docs/` を正とします。

- `docs/01_concept.md` — 目的・設計原則・検証計画
- `docs/02_requirements.md` — MVP（フェーズ0）改修要件
- `docs/03_implementation_plan.md` — 実装計画・バックエンド詳細仕様
- `docs/04_frontend_design_guide.md` — フロント全画面のデザイン指示書
- `docs/05_implementation_todo.md` — **実装の進捗管理（TODOチェックリスト）**

---

## 1. プロジェクトの大局（構成）

- **モノリシック Laravel アプリ**。ソースはすべて `htdocs/` 配下にある（`frontend/` ディレクトリは存在しない）。
- UI は **Inertia.js + React (TypeScript)**。フロントは `htdocs/resources/js` に実装。
- 音声認識（Whisper）は **別リポジトリ**（voice-analyzer-api）で管理。このリポジトリ内に whisper サービスは含まれない。
  - <https://github.com/north238/voice-analyzer-api>
- ローカル開発は **Docker Compose**。主要サービスは以下（`docker-compose.yml`）:

  | サービス | 役割                 | ポート（ホスト） |
  | -------- | -------------------- | ---------------- |
  | `web`    | Nginx                | 8080 → 80        |
  | `app`    | PHP / Laravel + Vite | 5173             |
  | `db`     | MySQL                | 3307 → 3306      |
  | `redis`  | Redis 6.2            | 6579 → 6379      |

## 2. 技術スタック

- バックエンド: **Laravel 10.x** / **PHP 8.1+**（README表記は 8.2+）/ MySQL 8.0 / Redis
- フロント: TypeScript + React + Inertia.js + TailwindCSS + Vite
- 認証: **Laravel Breeze**（セッション認証）+ **Laravel Socialite（LINE ログイン）**
- LINE 連携: `linecorp/line-bot-sdk`（Messaging API / Webhook）

## 3. 主要な責務の分離と慣習

- **Controller**: リクエスト受付・バリデーション・レスポンス。`htdocs/app/Http/Controllers/*`
  - 内部API用は `Api/*`（例: `Api/GenreController`, `Api/PlaceController`）
- **Service**: ビジネスロジック。`htdocs/app/Services/*`
  - 現状: `ItemService`, `GroupService`, `GroupRequestService`, `LineMessengerService`
- **Model**: Eloquent。`htdocs/app/Models/*`
  - 現状: `Item`, `Genre`, `Place`, `Color`, `Group`, `GroupUser`, `GroupRequest`, `Role`, `User`, `Notification`
- **フロント**: Inertia の `useForm` を標準で使用。親を single source of truth とし、更新は `setData('field', value)`（部分更新で未定義の上書きを避ける）。子コンポーネントでローカル state を持つと同期バグの原因になる。

## 4. ルーティングと認証の扱い

- 画面遷移系（Inertia）は `routes/web.php`。セッション認証（Breeze）。
- 内部APIは `routes/api.php` で **`auth:sanctum` ミドルウェア**を使用（例: `/api/genres`, `/api/places`）。
- 音声解析: `POST /api/voice/transcribe`（`api.voice.transcribe`）→ 別リポジトリの Whisper API と連携。**削除予定**（§8参照）。
- LINE Webhook: `POST /api/line/webhook`。
- CSRF / Cookie: 同一アプリ内フロント→バックでは基本的に session/CSRF で完結。CORS や認証方式を変更する際は `config/cors.php` と `.env`（`SANCTUM_STATEFUL_DOMAINS` / `SESSION_DOMAIN`）を確認する。

## 5. よく参照するファイル

- フォームオプション取得: `resources/js/hooks/useFormOptions.ts`（`/api/genres`, `/api/places`）
- フォーム制御: `resources/js/Pages/Items/`（Inertia `useForm` を親に置く）
- 音声入力: `resources/js/Components/VoiceInput.tsx`（解析中フラグを親へ通知。解析中は保存ボタン無効化）。**削除予定**（§8参照）
- APIコントローラ例: `app/Http/Controllers/Api/GenreController.php`（返却は常に配列。空なら空配列 + message）
- Pages 構成: `resources/js/Pages/{Auth, Dashboard, Group, Items, Profile}`

## 6. コードスタイル

- PHP: **PSR-12** 準拠。Controller / Service / Model の責務を分ける。
- TS/React: TypeScript を厳密に。Inertia `useForm` の `data` 型をコンポーネント間で一致させる。
- `setData` は `setData('name', value)` または `setData({ name: value, quantity: 1 })`。オブジェクト渡しでは `undefined` を含めない。
- UIオプション型: `SelectInput` の options は `{ value: string|number, label: string }[]`。`SelectableWithAdd` の `onAdd` は `async (newName: string) => Promise<void>`。
- サーバ側バリデーションエラーは Inertia の `errors` に入りフィールド下に表示。クライアント側も touched/submitted で UX 補助。

## 7. 環境・起動コマンド

Docker コンテナ内で実行するものは `docker-compose exec app ...` を付ける。

```bash
docker-compose up -d                                   # 起動
docker-compose exec app composer install               # PHP依存
docker-compose exec app npm install                    # JS依存
docker-compose exec app php artisan migrate --seed      # マイグレーション+シード
docker-compose exec app npm run dev                    # Vite（開発）
docker-compose exec app php artisan test               # テスト
docker-compose exec app npm run lint                   # Lint
docker-compose exec app npm run format                 # Format
```

アクセス: <http://localhost:8080>

## 8. 進行中の改修（MVP / フェーズ0）※未実装

`docs/02_requirements.md` の要件は **まだコードに反映されていない**（2026-07 時点）。現状は数量（`quantity`）ベースの在庫台帳。今後、以下へ移行する計画:

- `items.status`（`in_stock` / `low` / `out`）を追加し、**status を主役**に。`quantity` は任意の参考情報へ降格。
- `purchase_histories` テーブルを新規作成し、「買った」ワンタップで購入履歴を記録。
- 一覧をテーブル型からカード型（品名・ステータス・前回購入○日前）へリデザイン。

実装時の注意（詳細は要件書 §5, §6 を参照）:

- **変更禁止**: 認証（Breeze/Socialite）、グループ機能、Docker 構成、ジャンル・保管場所管理。
- **削除予定**: 音声入力（`VoiceInput.tsx` / Whisper 別リポジトリ / `api.voice.transcribe`）。対応する Whisper API が用意されておらず実質使用不可のため、変更禁止対象から除外し、今後の別タスクで機能ごと削除する方針に変更した（2026-07-24）。削除の実施はドキュメント整備完了後に着手する。詳細は `docs/02` §5・`docs/05` Phase 11 を参照。
- **スコープ外**: 賞味期限管理、厳密な数量増減、通知、PWA化、購入周期推定 など。
- 既存マイグレーションは編集せず、新規マイグレーションを追加する。
- 前回購入日の算出で N+1 を出さない。F-1 / F-2 は Feature テストを追加する。

## 9. デバッグ・確認ポイント

- Laravel ログ: `htdocs/storage/logs/laravel.log`
- ネットワーク: POST ペイロードで `name` 等が正しく送られているか
- 認証/Cookie: セッション Cookie が DevTools でセットされているか

## 10. Git 運用

- ブランチ: `main`（本番）/ `development`（開発）/ `feat|fix/*`（作業）。PR は原則 `development` 向け。
- コミットメッセージは日本語。プレフィックス例: 追加 / 修正 / 削除 / 改修 / リファクタ。

## 11. 実装タスクの進捗管理

- MVP フェーズ0 の実装タスクは `docs/05_implementation_todo.md` で一元管理する。
- **タスクが完了したら、必ず `docs/05_implementation_todo.md` の該当チェックボックスを `[ ]` → `[x]` に更新する。** フェーズ完了時は「進捗サマリ」の状態（⬜🟡✅）と末尾「進捗メモ」も更新する。
- 実装の着手・再開前に、まず同ファイルで現在地（未完了タスク）を確認する。
- 仕様に変更が生じた場合は、先に `docs/02`〜`04` を修正してから TODO を更新する（ドキュメントが正）。
