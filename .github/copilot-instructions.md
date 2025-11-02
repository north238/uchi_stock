# Copilot 使用ガイド — uchi_stock（自動化エージェント向け）

このリポジトリで即戦力になるための最小限の知識をまとめます。変更やPR作成時は以下を参照してください。

1) プロジェクトの大局（構成）
- モノリシック Laravel アプリ（htdocs/）と別フロントエンド（frontend/）が混在する。メインのUIは Inertia + React (resources/js) で実装。
- 音声認識は whisper サービス（whisper/ ディレクトリ。FastAPI / uvicorn コンテナで起動）として分離されている。
- Docker Compose を使ったローカル開発が想定。主要コンテナ: app (PHP/Laravel), mysql, nginx, whisper。

2) 主要な責務の分離と慣習
- Controller: リクエスト受付、バリデーション、レスポンス。ファイル: htdocs/app/Http/Controllers/*
- Service: ビジネスロジック（複雑処理）。ファイル例: htdocs/app/Services/*. 可能な限り副作用をまとめる。
- Model: DBアクセス（Eloquent）と簡易的なラッパー（createItem 等）。ファイル: htdocs/app/Models/*
- フロントは Inertia の useForm を標準で使用。更新は setData('field', value) を推奨（部分更新で未定義の上書きを避ける）。

3) 環境・起動コマンド（よく使う）
- Docker 起動: `docker-compose up -d`
- コンテナ内で依存をインストール: `docker-compose exec app composer install` / `npm install`
- マイグレーションとシーダー: `docker-compose exec app php artisan migrate --seed`
- 開発フロント: `npm run dev`（htdocs では Vite 経由で Inertia をビルド）
- テスト: `php artisan test`

4) 認証 / API の取り扱い（重要）
- 内部 API（同一アプリのフロント→バック）では session/web 認証を使う方が簡単。外部公開やSPA別ドメインでは Sanctum を利用。
- CSRF／Cookie: フロントで axios を使う場合は `axios.defaults.withCredentials = true;` と `/sanctum/csrf-cookie` の取得を確認する（ただし同一アプリ内では不要なこともある）。config/cors.php と .env(SANCTUM_STATEFUL_DOMAINS/SESSION_DOMAIN) をチェック。

5) よく見るファイルとパターン（参照例）
- フォームオプション取得: `resources/js/hooks/useFormOptions.ts`（/api/genres, /api/places 呼び出し）
- フォーム制御: `resources/js/Pages/Items/Partials/Form.tsx`（Inertia useForm を親に置き、子コンポーネントは setData('field', value) を呼ぶ。）
- 音声入力: `resources/js/Components/VoiceInput.tsx` と `whisper/main.py` / `docker/whisper/Dockerfile` の連携。VoiceInput は解析中フラグを親に通知する設計を推奨。
- APIコントローラ例: `app/Http/Controllers/Api/GenreController.php`（返却は常に配列で、空なら空配列 + message を返す）

6) コードスタイルと型の扱い
- PHP: PSR-12 準拠。Model/Service/Controller の責務を分ける。
- TS/React: TypeScript を厳密に使う。特に Inertia の useForm の型（data の形）をコンポーネント間で一致させる。
- setData の利用例: `setData('name', value)` または `setData({ name: value, quantity: 1 })`。オブジェクトで渡す場合は undefined を含めない。

7) API エラー・UI の扱い
- フロント: サーバ側バリデーションは Inertia の `errors` に入り、フィールド下に表示する。
- クライアント側でのバリデーションは UX 向上のために実装する（touched/submitted フラグ）。音声解析の非同期性に注意して解析中は保存ボタンを無効化。

8) 開発時のデバッグ・確認ポイント
- ネットワーク: POST ペイロードを確認して `name` 等が正しく送信されているか。
- Laravelログ: `storage/logs/laravel.log` を確認。
- CSRF/Cookie 問題: `/sanctum/csrf-cookie` が 204 を返す場合でも Cookie がセットされているか DevTools で確認。

9) 小さな実装ルール（プロジェクト特有）
- Model に DB 作成ラッパー（createItem）を置くパターンが多い。Service はビジネスルールで利用。
- SelectInput の options は `{ value: string|number, label: string }[]` を期待。
- SelectableWithAdd の `onAdd` は `async (newName: string) => Promise<void>` で実装される想定。

10) 変更を加えるときの注意
- フロント側のフォームは親が single source of truth。子でローカル state を持つと同期バグが起きる。
- API の認証を変更すると CORS / env の調整が必要。

不足点・フィードバック
- この指示書を基に補足してほしい箇所（例: whisper のローカル起動手順、具体的な axios 初期化コード、主要ファイルの一覧）を教えてください。修正して反映します。
