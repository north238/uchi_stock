# UchiStock 実装 TODO / 進捗管理

最終更新: 2026-07-23
現在地: **Phase 6 完了。Phase 7 着手前**
作業ブランチ: `feat/mvp_phase5`（Phase 0/1 は `feat/mvp_phase1`〔PR #80〕、Phase 2 は `feat/mvp_phase2`〔PR #81〕、Phase 3 は `feat/mvp_phase3`〔PR #82〕、Phase 4 は `feat/mvp_phase4`〔PR #83〕として順次`development`へマージ済み）
対象: MVP フェーズ0（`docs/02` 要件 / `docs/03` 実装計画 / `docs/04` フロント指示書）

このファイルは**実装の進捗を一元管理する唯一の場所**。セッションをまたいでも「どこまで完了したか」がここだけで分かるようにする。

## 使い方（更新ルール）

- タスク完了時に `- [ ]` を `- [x]` にする。
- 各フェーズ完了時に、下の「進捗サマリ」の状態と、末尾「進捗メモ」に日付・コミット要旨を追記する。
- 仕様に変更が出たら、先に `docs/03` or `docs/04` を直してから本表を更新する（ドキュメントが正）。
- 参照記法: `[03 §7.2]` = `docs/03_implementation_plan.md` の §7.2、`[04 §6.3]` = `docs/04_frontend_design_guide.md` の §6.3。

## 進捗サマリ

| フェーズ | 内容 | 主参照 | 状態 |
| -------- | ---- | ------ | ---- |
| 0 | 事前準備 | 03 §7.1 | ✅ 完了 |
| 1 | デザイン基盤（トークン） | 04 §2,§3,§4,§6.1 | ✅ 完了 |
| 2 | DB・モデル基盤 | 03 §7.2–7.4 | ✅ 完了 |
| 3 | API（status/購入/Undo） | 03 §7.5–7.11 | ✅ 完了 |
| 4 | 共通部品トークン化 | 04 §6.3,§6.5,§6.6 | ✅ 完了 |
| 5 | レイアウト2種 | 04 §6.4 | ✅ 完了 |
| 6 | Items 一覧カード | 03 ステップ3 / 04 §5,§10 | ✅ 完了 |
| 7 | Items フォーム | 03 ステップ4 / 04 §10.9 | ⬜ 未着手 |
| 8 | 他画面トンマナ | 04 §6.7 | ⬜ 未着手 |
| 9 | 総仕上げ・受け入れ | 03 §5, ステップ5 | ⬜ 未着手 |

状態の凡例: ⬜ 未着手 / 🟡 着手中 / ✅ 完了

**依存関係**: 1 はフロント（4–8）の前提 ／ 2 → 3 ／ 6 は 1・3 に依存 ／ 7 は 6 に依存。バックエンド（2,3）とフロント基盤（1,4,5）は並行可能。

---

## Phase 0: 事前準備

- [x] 作業ブランチ作成（`feat/*`。`development` へPR）→ 既存の `feat/mvp_phase1` をそのまま使用

## Phase 1: デザイン基盤（トークン）[04 §2,§3,§4,§6.1]

- [x] `resources/css/app.css`: CSS変数トークン定義（light）＋ `@media (prefers-color-scheme: dark)` 上書き [04 §2.1]
- [x] `app.css`: danger トークン追加（light/dark）[04 §6.1]
- [x] `tailwind.config.js`: `colors` にトークン登録（paper/surface/ink/…/status/accent）[04 §2.2]
- [x] `tailwind.config.js`: `colors` に danger/danger-ink/danger-soft 追加 [04 §6.1]
- [x] `tailwind.config.js`: `fontFamily.sans` を丸ゴシック優先へ差し替え [04 §3]
- [x] `tailwind.config.js`: `boxShadow.card` 登録 [04 §4]
- [x] 確認: `bg-surface`/`text-ink`/`bg-status-*` がライト・ダーク双方で効く（`tailwindcss` CLI で単体ビルドし、`bg-status-in`/`shadow-card`/`bg-danger` 等のユーティリティが生成されることを確認済み）

## Phase 2: DB・モデル基盤（バックエンド）[03 §7.2–7.4 / ステップ1]

- [x] `app/Enums/ItemStatus.php`（値・label・sortWeight・values）[03 §7.2]
- [x] migration: `add_status_to_items`（string, default in_stock, after name）[03 §7.3]
- [x] `items.quantity` を nullable化（`create_items_table` マイグレーションを直接編集。doctrine/dbal不要）[03 §7.1, §7.3]
- [x] migration: `create_purchase_histories_table`（item_id cascade / user_id nullOnDelete / purchased_at / index）[03 §7.3]
- [x] `app/Models/PurchaseHistory.php`（fillable/casts/item/user）[03 §7.4]
- [x] `Item` モデル更新: `status` を fillable/casts、`purchaseHistories()` 追加 [03 §7.4]
- [x] `Item::getItemsByGroupId` 差し替え（withMax + orderByRaw + sort引数）[03 §7.4]
- [x] `php artisan migrate:fresh --seed` 実行（既存7件のローカルテストデータは削除して再構築。ユーザー承認済み）。`quantity` nullable / `status` default `in_stock` をDBスキーマで確認済み

## Phase 3: API（status / 購入 / Undo）[03 §7.5–7.11 / ステップ2]

- [x] `routes/web.php`: 3ルート追加（status.update / purchase.store / purchase.destroy）[03 §7.5]
- [x] `ItemController::findOwnedItem`（グループ認可）追加 [03 §7.6]
- [x] 既存 `edit`/`update`/`destroy` を `findOwnedItem` に置換（他グループ→404）[03 §7.6]
- [x] `ItemController::updateStatus`（validate + 更新 + back）[03 §7.7]
- [x] `ItemService::recordPurchase` + `ItemController::storePurchase`（**flash successなし**）[03 §7.7,§7.8]
- [x] `ItemService::undoLatestPurchase` + `ItemController::destroyLatestPurchase`（previous_status で復元）[03 §7.7,§7.8]
- [x] `ItemCreateRequest`/`ItemUpdateRequest`: quantity nullable / status ルール [03 §7.9]
- [x] `store`/`update` の保存配列に status 追加（未指定 in_stock）[03 §7.9]
- [x] `index`: `sort` 受け取り + `days_since_purchase` 付与 + props(items, sort) [03 §7.7,§7.12]
- [x] `database/factories/ItemFactory.php` / `PurchaseHistoryFactory.php` [03 §7.10]
- [x] Feature: `ItemStatusTest`（自グループ更新 / 他グループ404 / 不正値422）[03 §7.11]
- [x] Feature: `ItemPurchaseTest`（買った記録＋status / 他グループ404 / Undo復元）[03 §7.11]
- [x] `php artisan test` グリーン（新規6件パス。既存の7件失敗はAuth系・環境起因の既知の失敗で変更前と同一、回帰なし）

## Phase 4: 共通部品トークン化 [04 §6.3,§6.5,§6.6]

- [x] `Components/Button.tsx`: variant 再定義（primary/neutral/danger/ghost）・トークン化 [04 §6.3]
- [x] `Buttons/SaveButton`→primary / `CancelButton`→neutral / `AddButton`→ghost（緑・赤の誤用是正）[04 §6.2,§6.3]
- [x] `PrimaryButton`/`SecondaryButton`/`DangerButton` トークン化 or `Button` へ集約（今回はトークン化のみ。`Button`への一本化は見送り）[04 §6.3]
- [x] 入力部品トークン化＋focus accent（`TextInput`/`TextArea`/`SelectInput`/`Checkbox`/`InputLabel`/`InputError`/`Divider`）[04 §6.5]
- [x] `Modal.tsx` トークン化（面/オーバーレイ/ボタン）[04 §6.6]
- [x] `Dropdown.tsx` トークン化（面/項目hover）[04 §6.6]
- [x] `utils/toast.ts`→`.tsx`にリネームしテーマ調整 + `showBuyUndoToast` 追加（`toastClassName`は`ToastContainer`側のpropだったため`app.tsx`に設定）[04 §6.6,§10.7]

## Phase 5: レイアウト2種 [04 §6.4]

- [x] `Layouts/AuthenticatedLayout.tsx`: 背景/ナビ/ヘッダー/アクティブaccent をトークン化 [04 §6.4]
- [x] `Layouts/GuestLayout.tsx`: paper/surface/角丸/影 をトークン化 [04 §6.4]
- [x] `Components/NavLink.tsx`/`ResponsiveNavLink.tsx`: アクティブ色を indigo/blue → accent へ置換（§6.4 に付随）
- [x] グループ未所属強制モーダルのボタン（`primary-link-btn`/`secondary-link-btn`）を `app.css` でトークン化（主=accent／スキップ=neutral、§6.2 準拠）

## Phase 6: Items 一覧カード [03 ステップ3 / 04 §5,§10]

- [x] `resources/js/constants/itemStatus.ts`（値↔ラベル↔色クラス）[04 §10.1]
- [x] `Components/StatusSegment.tsx`（1タップ変更・aria）[04 §5.2,§10.5]
- [x] `Components/BuyButton.tsx`（コーラル／in_stockはghost）[04 §5.3,§10.5]
- [x] `Pages/Items/Partials/ItemCard.tsx`（品名/メタ/前回購入/操作段）[04 §5.1,§10.3]
- [x] `Items/Index.tsx` カード型へ全面刷新（旧テーブル廃止・1カラム max-w-xl・空状態・ソートUI・FAB）[04 §5,§10.8]
- [x] Item型・通信（patch/post/delete＋Undo連携・preserveScroll）[04 §10.2,§10.6]
- [ ] 目視: 状態順ソート / 前回購入表示 / 個数「残り{n}」・null非表示 [04 §10.3]（ブラウザ確認ツール制約により未実施。要目視確認）

## Phase 7: Items フォーム [03 ステップ4 / 04 §10.9]

- [ ] `Form.tsx`: status 選択（`StatusSegment` 流用）追加、`FieldName` に status [04 §10.9]
- [ ] quantity 任意化（`?? ""`・未入力null）・ラベル「個数（任意）」[04 §10.9]
- [ ] ＋追加ボタン中立化 / 保存ボタンを accent へ [04 §5.7,§6.2]
- [ ] 音声入力デグレなし確認（onResult 現状維持）[04 §10.9]

## Phase 8: 他画面トンマナ [04 §6.7]

- [ ] Auth 6画面（Login/Register/Forgot/Reset/Confirm/VerifyEmail）: リンク/ボタン色統一、LINE01維持 [04 §6.7]
- [ ] Group（Create/Edit ＋ partials）: 主=primary / 削除=danger / 退会=danger or neutral [04 §6.7]
- [ ] Profile（Edit ＋ partials）: セクション化・保存=primary・削除=danger [04 §6.7]
- [ ] `Welcome.tsx`: トークン化（簡潔に）[04 §6.7]
- [ ] `Dashboard.tsx`: 要否判断（残すならトークン化 / 未使用なら対応不要）[04 §6.7]

## Phase 9: 総仕上げ・受け入れ [03 §5, ステップ5]

- [ ] 全画面をライト/ダークで目視確認
- [ ] デグレ確認: 音声入力（`api.voice.transcribe`）/ グループ機能 [03 ステップ5]
- [ ] `php artisan test` 最終グリーン
- [ ] スマホ実機で「開いて3秒で判断」を確認（要件 §9）
- [ ] 受け入れ条件 F-1〜F-4 を全て満たすことを確認 [02 §4]
- [ ] 変更禁止事項に差分がないことを確認 [02 §5]

---

## 進捗メモ（新しいものを上に）

- 2026-07-23: 【環境修正】テスト実行が開発DBを破壊していた問題を修正。原因は、`docker-compose.yml` の `app` サービスの `env_file: .env`（リポジトリルートの `.env`。`DB_CONNECTION`/`DB_HOST`/`DB_DATABASE`等を含む）がコンテナの実OS環境変数として注入され、Laravelの環境変数解決順序（`$_SERVER`優先）により `phpunit.xml` 側のテスト用DB指定が上書きされず、Feature テストの `RefreshDatabase` が開発DB（`uchistock-db`）に対して `migrate:fresh` 相当を実行し、データが消えていたこと。対応: (1) `docker-compose.yml` の `app` サービスから `env_file: .env` を削除（`db`サービスは対象外）、要 `docker-compose up -d --force-recreate app`。(2) `uchistock-db-testing` DBを新設し `db-user` に権限付与。(3) `htdocs/.env.testing` を新規作成（`DB_DATABASE=uchistock-db-testing`・`APP_ENV=testing`・array/syncドライバ等）し `.gitignore` に追加。(4) `phpunit.xml` は `APP_ENV=testing` のみ残し他は `.env.testing` に一本化。検証: `php artisan test` を複数回実行しても開発DB（users/items件数）が保持され、テストは `uchistock-db-testing` に対して実行されることを確認（migrate:fresh後は空、テスト後も開発DBは無傷）。**なお `Item::getItemsByGroupId` は MySQL固有の `FIELD()` 関数を使用しているため、SQLite化は見送りMySQLのテストDBを採用（ユーザー指摘により方針転換）**。
- 2026-07-23: 【環境整備】開発時に毎回ユーザー登録する手間を省くため、`database/seeders/UserSeeder.php`（開発用グループ＋`test@example.com`/`password`のログイン可能ユーザー）と `database/seeders/ItemSeeder.php`（ジャンル4種・保管場所4種・在庫状態/購入履歴のバリエーションを持つアイテム8件）を新規作成し `DatabaseSeeder` に登録。`migrate:fresh --seed` で開発DBに投入済み。
- 2026-07-23: Phase 6（Items 一覧カード）完了。`resources/js/constants/itemStatus.ts` 新規（`ItemStatusValue`/`ITEM_STATUS`/`STATUS_ACTIVE_CLASS`、単一の真実）。`Components/StatusSegment.tsx` 新規（3値segmented control・1タップ変更・`role="group"`/`aria-pressed`・`motion-safe:active:scale-95`）。`Components/BuyButton.tsx` 新規（`in_stock`時はghost表示、`react-icons/md`のカートアイコン）。`Pages/Items/Partials/ItemCard.tsx` 新規（品名+個数チップ/ジャンル・保管場所メタ/前回購入表示+そろそろ買い足し/StatusSegment+BuyButtonの操作段。ステータス変更・買った・Undoの通信ロジック（`router.patch`/`post`/`delete`）を内包）。`Items/Index.tsx` を全面刷新（旧テーブル廃止→1カラム`max-w-xl`のカード一覧、ソート切替は既存`Dropdown`コンポーネントを再利用してInertia `preserveScroll`/`preserveState`付きLinkで実装、空状態カード、右下固定FAB追加）。`Item`型は`Items/Index.tsx`からexportし`ItemCard.tsx`で`import type`により参照（循環参照はTypeScriptの型消去により実害なし）。検証: `npm run tsc`/`npm run lint`で新規エラーなし（既存の`ssr.tsx`起因のエラーのみ、StatusSegment.tsxに既存コードと同種の未使用引数warning1件のみ発生も許容範囲と判断）、`vite build`成功、`php artisan test`で新規追加分含め回帰なし（Item関連6件パス、既存の7件失敗はAuth系・環境起因で変更前と同一）。**ブラウザでの実見た目確認（状態順ソート/前回購入表示/個数チップのnull非表示）は本セッションのツール制約により未実施**、次回実機/ブラウザでの目視確認を推奨。
- 2026-07-23: Phase 5（レイアウト2種）完了。`Layouts/AuthenticatedLayout.tsx`: 背景`bg-gray-100`→`bg-paper`、ナビ/ヘッダー`bg-white`→`bg-surface`＋`border-line`、ドロップダウン起点ボタン・ハンバーガー・モバイルメニューをトークン化（`text-muted`/`text-ink`/`bg-surface-2`）。グループ未所属の強制モーダルは見出し`text-ink`・本文`text-muted`・警告アイコン`text-danger`に統一。`Layouts/GuestLayout.tsx`: 背景`bg-paper`、カード`bg-surface rounded-[20px] shadow-card border border-line`（`max-w-sm`は維持）。付随して `Components/NavLink.tsx`/`ResponsiveNavLink.tsx` のアクティブ色（indigo/blue）を`accent`/`accent-soft`へ、非アクティブを`muted`/`line-strong`へ置換。強制モーダルのボタンに使われている`primary-link-btn`/`secondary-link-btn`（`app.css`）もblue直値からトークン（主=accent／スキップ=neutral、§6.2準拠）へ置換。検証: `npm run tsc`/`npm run lint`で新規エラーなし（既存の`ssr.tsx`起因のエラーのみ、無関係と確認）、`vite build`成功。**ブラウザでの実見た目確認は本セッションのツール制約により未実施**。
- 2026-07-22: Phase 4（共通部品トークン化）完了。`Button.tsx` の variant を `primary`/`neutral`/`danger`/`ghost` に再定義（`warning`/`success` 廃止）し全色をトークン参照へ。`SaveButton`→`primary`、`AddButton`→`ghost`、`CancelButton`→`neutral` に是正（従来 保存/追加=緑・キャンセル=赤の誤用を解消）。`PrimaryButton`/`SecondaryButton`/`DangerButton` は構造を維持したままトークン化（`Button`への統合は見送り、指示書§6.3の「段階的でよい」に従う）。`TextInput`/`TextArea`/`SelectInput`/`Checkbox`/`InputLabel`/`InputError`/`Divider` をトークン化しfocusをaccentリングに統一、フィールド角丸を`rounded-lg`に統一。`Modal.tsx`（オーバーレイ`bg-ink/40`・パネル`bg-surface rounded-[20px] shadow-card`）・`Dropdown.tsx`（面`bg-surface`・`rounded-xl shadow-card`・項目hover`bg-surface-2`）をトークン化。`utils/toast.ts`を`toast.tsx`にリネームし`showBuyUndoToast`を追加、トースト全体の配色は`toastClassName`が`ToastContainer`側のpropだったため`app.tsx`側に移して設定。検証: `npm run tsc`/`npm run lint`で新規エラーなし（既存の`ssr.tsx`起因のエラー・警告は変更前から存在し無関係と確認）、`vite build`成功、コンパイル後のCSS/JSに新トークンクラスが反映されていることを確認。ローカルDocker環境で`public/hot`が古いまま残っておりVite dev serverが実際には起動していない不整合を発見・削除（本番ビルド出力にフォールバックさせ動作確認に使用。git管理外のファイルのため影響なし）。**ブラウザでの実見た目確認は本セッションのツール制約により未実施**、次回実機/ブラウザでのライト・ダーク目視確認を推奨。
- 2026-07-22: Phase 3（API: status/購入/Undo）完了。`routes/web.php` に3ルート追加（`items.status.update`/`items.purchase.store`/`items.purchase.destroy`）。`ItemController` に `findOwnedItem`（他グループは404）、`updateStatus`/`storePurchase`/`destroyLatestPurchase` を追加し、既存 `edit`/`update`/`destroy` も `findOwnedItem` に置換。`index` で `sort`（status/purchased）受け取りと `days_since_purchase` 付与に対応。`ItemService` に `recordPurchase`/`undoLatestPurchase` を実装（DBトランザクション）。`ItemCreateRequest`/`ItemUpdateRequest` の `quantity` を `nullable|min:0` に緩和、`status` を enum バリデーションに追加、未指定時は `in_stock` をデフォルト適用。`ItemFactory`/`PurchaseHistoryFactory` を新規作成。Feature テスト `ItemStatusTest`（自グループ更新・他グループ404・不正値422）・`ItemPurchaseTest`（購入記録・他グループ404・Undo復元）を追加し全6件パス。`php artisan test` 全体は新規6件含め24件パス、既存の7件失敗（Auth系・環境起因）は変更前と同一で回帰なしを確認。
- 2026-07-22: Phase 2（DB・モデル基盤）完了。`app/Enums/ItemStatus.php` 新規作成（label/sortWeight/values）。マイグレーション2本追加（`add_status_to_items`＝status列 default in_stock、`create_purchase_histories_table`）。`app/Models/PurchaseHistory.php` 新規作成。`Item` モデルに `status` の fillable/casts、`purchaseHistories()` リレーション追加、`getItemsByGroupId` を `withMax` + `orderByRaw`（status順/purchased順）へ差し替え。`migrate:fresh --seed` を実行（既存のローカル手動テストデータ7件は消える前提でユーザー承認済み）。DBスキーマ（quantity nullable / status default in_stock）・Enumキャスト・並び順ロジックをtinkerで実地検証。既存Featureテストは変更前と同じ7件失敗（Auth系・環境起因、Phase 2の変更とは無関係と確認済み）で回帰なし。作業ブランチは `feat/mvp_phase1`→PR #80で`development`へマージ済み、現在は新規ブランチ `feat/mvp_phase2` で作業中（ユーザーが別途ブランチ運用を実施）。
- 2026-07-22: Phase 0（事前準備）・Phase 1（デザイン基盤トークン）完了。作業ブランチは既存の `feat/mvp_phase1` を継続使用。`items.quantity` の nullable 化は `doctrine/dbal` 不使用で `create_items_table` マイグレーションを直接編集する方式に変更（`docs/03` 更新済み）。`app.css` にカラートークン（paper/surface/ink/status/accent/danger）を light/dark 両方で定義、`tailwind.config.js` に同トークン・丸ゴシックフォント・`shadow.card` を登録し、`tailwindcss` CLI 単体ビルドでユーティリティ生成を確認。
- 2026-07-21: ドキュメント（01〜04）整備完了、本TODO作成。実装未着手。
