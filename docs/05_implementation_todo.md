# UchiStock 実装 TODO / 進捗管理

最終更新: 2026-07-22
現在地: **Phase 3 完了。Phase 4 着手前**
作業ブランチ: `feat/mvp_phase2`（Phase 0/1 は `feat/mvp_phase1` としてPR #80経由で`development`へマージ済み）
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
| 4 | 共通部品トークン化 | 04 §6.3,§6.5,§6.6 | ⬜ 未着手 |
| 5 | レイアウト2種 | 04 §6.4 | ⬜ 未着手 |
| 6 | Items 一覧カード | 03 ステップ3 / 04 §5,§10 | ⬜ 未着手 |
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

- [ ] `Components/Button.tsx`: variant 再定義（primary/neutral/danger/ghost）・トークン化 [04 §6.3]
- [ ] `Buttons/SaveButton`→primary / `CancelButton`→neutral / `AddButton`→ghost（緑・赤の誤用是正）[04 §6.2,§6.3]
- [ ] `PrimaryButton`/`SecondaryButton`/`DangerButton` トークン化 or `Button` へ集約 [04 §6.3]
- [ ] 入力部品トークン化＋focus accent（`TextInput`/`TextArea`/`SelectInput`/`Checkbox`/`InputLabel`/`InputError`/`Divider`）[04 §6.5]
- [ ] `Modal.tsx` トークン化（面/オーバーレイ/ボタン）[04 §6.6]
- [ ] `Dropdown.tsx` トークン化（面/項目hover）[04 §6.6]
- [ ] `utils/toast.ts`: テーマ調整 + `showBuyUndoToast` 追加 [04 §6.6,§10.7]

## Phase 5: レイアウト2種 [04 §6.4]

- [ ] `Layouts/AuthenticatedLayout.tsx`: 背景/ナビ/ヘッダー/アクティブaccent をトークン化 [04 §6.4]
- [ ] `Layouts/GuestLayout.tsx`: paper/surface/角丸/影 をトークン化 [04 §6.4]

## Phase 6: Items 一覧カード [03 ステップ3 / 04 §5,§10]

- [ ] `resources/js/constants/itemStatus.ts`（値↔ラベル↔色クラス）[04 §10.1]
- [ ] `Components/StatusSegment.tsx`（1タップ変更・aria）[04 §5.2,§10.5]
- [ ] `Components/BuyButton.tsx`（コーラル／in_stockはghost）[04 §5.3,§10.5]
- [ ] `Pages/Items/Partials/ItemCard.tsx`（品名/メタ/前回購入/操作段）[04 §5.1,§10.3]
- [ ] `Items/Index.tsx` カード型へ全面刷新（旧テーブル廃止・1カラム max-w-xl・空状態・ソートUI）[04 §5,§10.8]
- [ ] Item型・通信（patch/post/delete＋Undo連携・preserveScroll）[04 §10.2,§10.6]
- [ ] 目視: 状態順ソート / 前回購入表示 / 個数「残り{n}」・null非表示 [04 §10.3]

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

- 2026-07-22: Phase 3（API: status/購入/Undo）完了。`routes/web.php` に3ルート追加（`items.status.update`/`items.purchase.store`/`items.purchase.destroy`）。`ItemController` に `findOwnedItem`（他グループは404）、`updateStatus`/`storePurchase`/`destroyLatestPurchase` を追加し、既存 `edit`/`update`/`destroy` も `findOwnedItem` に置換。`index` で `sort`（status/purchased）受け取りと `days_since_purchase` 付与に対応。`ItemService` に `recordPurchase`/`undoLatestPurchase` を実装（DBトランザクション）。`ItemCreateRequest`/`ItemUpdateRequest` の `quantity` を `nullable|min:0` に緩和、`status` を enum バリデーションに追加、未指定時は `in_stock` をデフォルト適用。`ItemFactory`/`PurchaseHistoryFactory` を新規作成。Feature テスト `ItemStatusTest`（自グループ更新・他グループ404・不正値422）・`ItemPurchaseTest`（購入記録・他グループ404・Undo復元）を追加し全6件パス。`php artisan test` 全体は新規6件含め24件パス、既存の7件失敗（Auth系・環境起因）は変更前と同一で回帰なしを確認。
- 2026-07-22: Phase 2（DB・モデル基盤）完了。`app/Enums/ItemStatus.php` 新規作成（label/sortWeight/values）。マイグレーション2本追加（`add_status_to_items`＝status列 default in_stock、`create_purchase_histories_table`）。`app/Models/PurchaseHistory.php` 新規作成。`Item` モデルに `status` の fillable/casts、`purchaseHistories()` リレーション追加、`getItemsByGroupId` を `withMax` + `orderByRaw`（status順/purchased順）へ差し替え。`migrate:fresh --seed` を実行（既存のローカル手動テストデータ7件は消える前提でユーザー承認済み）。DBスキーマ（quantity nullable / status default in_stock）・Enumキャスト・並び順ロジックをtinkerで実地検証。既存Featureテストは変更前と同じ7件失敗（Auth系・環境起因、Phase 2の変更とは無関係と確認済み）で回帰なし。作業ブランチは `feat/mvp_phase1`→PR #80で`development`へマージ済み、現在は新規ブランチ `feat/mvp_phase2` で作業中（ユーザーが別途ブランチ運用を実施）。
- 2026-07-22: Phase 0（事前準備）・Phase 1（デザイン基盤トークン）完了。作業ブランチは既存の `feat/mvp_phase1` を継続使用。`items.quantity` の nullable 化は `doctrine/dbal` 不使用で `create_items_table` マイグレーションを直接編集する方式に変更（`docs/03` 更新済み）。`app.css` にカラートークン（paper/surface/ink/status/accent/danger）を light/dark 両方で定義、`tailwind.config.js` に同トークン・丸ゴシックフォント・`shadow.card` を登録し、`tailwindcss` CLI 単体ビルドでユーティリティ生成を確認。
- 2026-07-21: ドキュメント（01〜04）整備完了、本TODO作成。実装未着手。
