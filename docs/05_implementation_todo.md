# UchiStock 実装 TODO / 進捗管理

最終更新: 2026-08-02
現在地: **Phase 13・Phase 12 完了**（Auth画面パディング・パネル角丸の統一、アイテム編集の遷移先修正、「アイテム」→「ストック」表記統一、ボタン表記とアクションの整合性修正も完了）。ブラウザでの実機/実見た目確認はツール制約により未実施
作業ブランチ: `worktree-mvp_phase11`（Phase 0/1 は `feat/mvp_phase1`〔PR #80〕、Phase 2 は `feat/mvp_phase2`〔PR #81〕、Phase 3 は `feat/mvp_phase3`〔PR #82〕、Phase 4 は `feat/mvp_phase4`〔PR #83〕、Phase 5 は `feat/mvp_phase5`〔PR #84〕、Phase 6 は `feat/mvp_phase6`〔PR #85〕、Phase 7 は `feat/mvp_phase7`〔PR #86〕、Phase 8 は `feat/mvp_phase8`〔PR #87, #88〕、Phase 9 は `feat/mvp_phase9`〔PR #89, #90〕として順次`development`へマージ済み）
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
| 7 | Items フォーム | 03 ステップ4 / 04 §10.9 | ✅ 完了 |
| 8 | 他画面トンマナ | 04 §6.7 | ✅ 完了 |
| 9 | 総仕上げ・受け入れ | 03 §5, ステップ5 | ✅ 完了 |
| 10 | 登録UX改善（遷移・購入履歴自動記録・トースト） | 03 §7.13,§7.14 / 04 §5.6,§5.8,§10.7 | ✅ 完了 |
| 11 | 音声入力の削除 | 02 §5 / 03 §4,ステップ6 / 04 §8,§5.7,§10.9 / CLAUDE.md §8 | ✅ 完了 |
| 13 | ジャンルのColor切り離し・登録API改修 | 08 | ✅ 完了 |
| 12 | UI一貫性・不具合修正 | 09 / 04（事後反映） | ✅ 完了 |

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

- [x] `Form.tsx`: status 選択（`StatusSegment` 流用）追加、`FieldName` に status [04 §10.9]
- [x] quantity 任意化（`?? ""`・未入力null）・ラベル「個数（任意）」[04 §10.9]
- [x] ＋追加ボタン中立化 / 保存ボタンを accent へ（Phase4で対応済みを確認。合わせてForm.tsxのパネル/エラー表示の残存旧配色もトークン化）[04 §5.7,§6.2]
- [x] 音声入力デグレなし確認（onResult 現状維持、name/quantityのみセット・status不変）[04 §10.9]

## Phase 8: 他画面トンマナ [04 §6.7]

- [x] Auth 6画面（Login/Register/Forgot/Reset/Confirm/VerifyEmail）: リンク/ボタン色統一、LINE01維持 [04 §6.7]
- [x] Group（Create/Edit ＋ partials）: 主=primary / 削除=danger / 退会=danger or neutral [04 §6.7]
- [x] Profile（Edit ＋ partials）: セクション化・保存=primary・削除=danger [04 §6.7]
- [x] `Welcome.tsx`: トークン化（簡潔に）[04 §6.7]
- [x] `Dashboard.tsx`: 要否判断は保留し、現状維持前提でトークン化のみ実施（削除は本フェーズの決定事項外）[04 §6.7]

## Phase 9: 総仕上げ・受け入れ [03 §5, ステップ5]

- [x] 全画面をライト/ダークで目視確認（ユーザーが実機/ブラウザで確認済み。確認過程でFAB配色・編集導線欠落の不具合2件を発見し修正済み）
- [x] デグレ確認: 音声入力（`api.voice.transcribe`）/ グループ機能 [03 ステップ5]（コードレベルで確認: `VoiceInput.tsx`・`api.voice.transcribe`ルートは現存、`origin/development`との差分で認証/グループ/Docker/ジャンル・保管場所関連ファイルに変更なしを確認。実機での動作確認は未実施）
- [x] `php artisan test` 最終グリーン（24 passed / 既存7件失敗はAuth系・環境起因の既知の失敗で全フェーズ通じて同一、回帰なし）
- [x] スマホ実機で「開いて3秒で判断」を確認（要件 §9）（ユーザーが実機で確認済み）
- [x] 受け入れ条件 F-1〜F-4 を全て満たすことを確認 [02 §4]（コードレビューで確認。F-1: `updateStatus`で1タップ即時保存。F-2: `recordPurchase`で購入履歴作成+status更新、Undo実装済み。F-3: `getItemsByGroupId`のソートがstatus順(out→low→in_stock)/purchased順いずれもNULL先頭で仕様通り。F-4: status選択・quantity任意化は実装済み。2026-07-24追記分（登録後`items.index`遷移・戻る導線・購入履歴自動作成）はPhase 9時点では未着手だったが、Phase 10（2026-07-25）で対応済み）
- [x] 変更禁止事項に差分がないことを確認 [02 §5]（`git diff origin/development...HEAD`で認証/グループ/Docker/ジャンル・保管場所関連ファイルに差分なしを確認。現ブランチ`feat/mvp_phase9`は`origin/development`と同一コミットから開始）

### Phase 9 内で発見・修正した不具合

- [x] `htdocs/.env.testing` の `APP_KEY` が空になっており（Phase 8のコミット`87e71b8`で発生。LINE認証情報と同様に機密情報と誤認し手動で削除されたと推測）、全Featureテストが`MissingAppKeyException`で失敗する状態だった。`php artisan key:generate --show`でテスト専用の新規キーを生成し復旧（`base64:6/rLfwl1pO4BioLzoSIYriZjO2ltf18e52H6N9rKrTM=`）。復旧後は既知のベースライン（24 passed / 7 failed）に一致することを確認。
- [x] `Pages/Items/Index.tsx` のFAB（＋登録ボタン）が `bg-ink text-surface`（黒系）になっており、`04 §6.2` の「主アクション＝accent」ルールに反していた（ユーザー指摘）。`bg-accent text-accent-ink` に修正 [04 §6.2]
- [x] 一覧カードから編集画面への導線が一切なく（Phase 6のカード型リデザインで旧テーブル表示にあった編集リンクが引き継がれずに欠落）、ジャンル・保管場所・メモ・quantityの確認/修正手段が失われていた（ユーザー指摘、「個数を再修正できない」報告の真因）。`Pages/Items/Partials/ItemCard.tsx` の品名を `Link`（`route('items.edit', item.id)`）化し復旧。`docs/04` §5.1・§10.6に導線を明記 [04 §5.1,§10.6]
- [x] 上記の編集導線に対するFeatureテストを追加（`tests/Feature/ItemEditTest.php` を新規作成。自グループのアイテムは `GET items/{id}` が200＋`Items/Edit`をInertiaレンダーすることを検証、他グループのアイテムは404になることを検証。2件ともパス、全体で26 passed / 既存7件失敗〔Auth系・環境起因〕は変わらず回帰なし）

## Phase 10: 登録UX改善（遷移・購入履歴自動記録・トースト）[03 §7.13,§7.14 / 04 §5.6,§5.8,§10.7]

2026-07-24 にユーザーとの検討で方針決定し、2026-07-25 に実装完了。

- [x] `ItemController@store`: リダイレクト先を `items.create` → `items.index` に変更し、`with('success', "{$item->name}を登録しました")` を付与 [03 §7.13]
- [x] `Items/Create.tsx`: ヘッダー左上に「戻る」導線を追加（遷移先は `items.index` 固定、`MdArrowBack`）[03 §7.13 / 04 §5.8,§10.4]
- [x] `ItemController@store`: アイテム作成と同一トランザクションで購入履歴を1件自動作成（`purchased_at`=登録日時、status上書きなし）[03 §7.14]
- [x] `ItemService`: `createInitialPurchaseHistory(Item, User)` を追加し `recordPurchase` とロジックを分離 [03 §7.14]
- [x] 「購入記録なし」分岐（`days_since_purchase === null`）はコードとして維持（削除しない）[04 §10.3]
- [x] `utils/toast.tsx`: `showBuyUndoToast` を `autoClose: 3500` ・コンパクトな `className` に調整 [04 §5.6,§10.7]
- [x] Feature テスト: `store` のリダイレクト先変更・購入履歴自動作成を検証するテストを追加/更新（`tests/Feature/ItemStoreTest.php` 新規作成）

## Phase 11: 音声入力の削除 [02 §5 / 03 §4,ステップ6 / 04 §8,§5.7,§10.9 / CLAUDE.md §8]

2026-07-24 にユーザーとの検討で削除方針が決定。**ドキュメント先行**の順序を厳守する。

- [x] ドキュメント更新: `CLAUDE.md` §8 の「変更禁止」から音声入力を除外し「削除予定」を明記 [CLAUDE.md §8]
- [x] ドキュメント更新: `docs/02` §5 の変更禁止事項から音声入力を除外し削除予定の注記を追加 [02 §5]
- [x] ドキュメント更新: `docs/03` §4「変更しないもの」・ステップ5 から音声入力を除外し、ステップ6（削除タスク概要）を追加 [03 §4, ステップ6]
- [x] ドキュメント更新: `docs/04` §8 デグレ禁止・§5.7・§10.9 の音声入力記述に削除予定の注記を追加 [04 §8,§5.7,§10.9]
- [x] フロント: `VoiceInput.tsx` を削除し、`Form.tsx` 等の呼び出し元から参照を除去
- [x] バックエンド: `api.voice.transcribe` ルート・対応コントローラ（`VoiceController.php`）を削除
- [x] バックエンド: Whisper 関連設定値（`config/services.php` の `whisper` / `.env.example`・`.env.testing` の `WHISPER_URL`）を削除
- [x] 不要になったパッケージ・設定（`useVoiceRecorder.ts`・`utils/audioUtils.ts` を削除、`ItemController::create`/`edit` の `apiUrl` 受け渡しと `Create.tsx`/`Edit.tsx`/`Form.tsx` 側の `apiUrl` props を除去）を整理
- [x] 削除後、リポジトリ全体で音声入力関連の参照が残っていないことを確認（`grep -rniE "voice|whisper"` でコード側の残存なしを確認。`docs/`・`CLAUDE.md` は削除の経緯を記録する historical な記述として意図的に残置）
- [x] `php artisan test` グリーンを再確認（7 failed / 28 passed。既知のAuth系・環境起因の失敗のみで全フェーズ通じて同一、回帰なし）

---

## 保留中の検討事項（バックログ）

本フェーズの計画には含まれていないが、実装中に見つかり将来判断が必要な事項をここに記録する。着手前に必ずこの節を確認し、対応した項目は削除するかチェック済みとして残す。

### Color関連（未使用の色分け機能）— 2026-07-26発見

- **発見の経緯**: `RegisteredUserController`/`SocialiteLoginController`の`role_id`ハードコード修正（テスト回収作業）の過程で、`Api/GenreController::store()`に全く同じ「マジックID直書き」パターン（`'color_id' => 1, // デフォルトカラーID`）があることに気づき、ユーザーから「ColorsTable関連はどこかで使われているか」と質問され調査した。
- **現状の実装**:
  - `Genre`モデルが`belongsTo(Color::class, 'color_id')`を持ち、`getGenresListByGroupId()`で`with('color')`により毎回eager loadしている。
  - `Api/GenreController::store()`が新規ジャンル作成時に`color_id => 1`を固定値で設定している。
  - `colors`テーブルは`ColorsTableSeeder`（143行、色名+16進カラーコードのパレット）で投入され、`DatabaseSeeder`から呼ばれている。
- **利用実態**: バックエンドは`color`情報を取得しAPIレスポンスに含めているが、フロントエンド（`resources/js/api/optionsApi.ts`の`BackendOption`型は`{ id, name }`のみ）が受け取った時点で`color`を破棄しており、**画面上でジャンルの色が表示・選択される箇所は現状ゼロ**（grep・目視で確認済み）。`docs/04_frontend_design_guide.md`が定義する色設計（緑＝ステータス／コーラル＝アクション／danger＝破壊的操作の固定トークンパレット）にも、ジャンルごとの任意色分けは登場しない。
- **今後の選択肢**:
  - (a) ジャンルごとの色分け表示ニーズが顕在化した場合、`Color`/`colors`をそのまま活用してUIを実装する。
  - (b) 恒久的に不要と判断した場合、`Color`モデル・`colors`テーブル・`ColorsTableSeeder`・`Genre.color_id`カラム・リレーションを削除する（新規migrationでdrop、既存migrationは編集しない）。
- **注意**: `Genre`関連ファイルは CLAUDE.md §8「変更禁止: ジャンル・保管場所の管理機能」の対象に含まれる。(b)を実施する場合も含め、着手前に必ずユーザーの明示的な合意を取ること。
- **決着（2026-08-01）**: 選択肢 (b) を採用。開発者本人の明示的な合意を取得済み。詳細は `docs/08_genre_color_removal.md`（Phase 13）を参照。CLAUDE.md §8・`docs/02` §5 の変更禁止事項からジャンルを除外済み（保管場所は引き続き変更禁止）。Phase 13で実装完了（2026-08-01）。

### ジャンル登録APIにバリデーションがない — 2026-08-01発見（Phase 13スコープ外）

- `Api/GenreController::store()` は `name` の必須・最大長・重複禁止のバリデーションを行っていない（`docs/08` §4-2でスコープ外と明記済み）。ID返却方式のため同名重複があっても自動選択自体は正しく動作するが、空文字列や極端に長い名前の登録を防げない。将来対応する場合は `Api/PlaceController::store()` も同様の状態のため合わせて検討する。

### `genre_id`/`place_id` の型不整合 — 2026-08-01発見（Phase 12スコープ外）

- `Items/Partials/Form.tsx` の `FormItemFields.genre_id`/`place_id` は型上 `number | null` だが、実際には `handleGenreChange`/`handlePlaceChange`（`e.target.value`）や自動選択実装（`String(res.data.id)`）で文字列がセットされている。既存の挙動（`SelectInput`の`value`が`String(id)`前提）に合わせるため意図的に文字列としているが、型定義と実体が乖離している。将来的に型を`string | null`へ修正するか、送信直前に数値変換する対応を検討する。

---

## Phase 13: ジャンルのColor切り離し・登録API整理 [08]

`docs/08_genre_color_removal.md` の指示書に基づく。ドキュメント先行更新（本節含む）はコード変更前の単独コミットとして完了済み。

- [x] ドキュメント更新: `CLAUDE.md` §8 の変更禁止からジャンルを除外 [08 §1]
- [x] ドキュメント更新: `docs/02` §5 に同旨を注記 [08 §1]
- [x] ドキュメント更新: 本ファイルのバックログ「Color関連」に決着を追記、本節を新設 [08 §1]
- [x] マイグレーション追加: `genres.color_id` と `colors` テーブルを削除（新規migration、既存は編集しない）[08 §3]
- [x] `app/Models/Genre.php`: `color_id`（fillable）・`color()`リレーション・`with('color')`を削除 [08 §4-1]
- [x] `app/Models/Color.php` を削除 [08 §4-1]
- [x] `database/seeders/ColorsTableSeeder.php` を削除し `DatabaseSeeder.php` から呼び出しを削除 [08 §4-1]
- [x] `Api/GenreController::store()`: `color_id`削除・`data`返却・201化・文言修正 [08 §4-2]
- [x] `Api/PlaceController::store()`: `data`返却のみ追加（他は変更しない）[08 §4-3]
- [x] `resources/js/api/optionsApi.ts`: `addGenre`/`addPlace`に戻り値の型付与 [08 §4-4]
- [x] `tests/Feature/GenreApiTest.php` 新規作成（ジャンル・保管場所双方のFeatureテスト）[08 §5]
- [x] `php artisan migrate` / `migrate:fresh --seed` 成功、`genres.color_id`/`colors`不在を確認 [08 §8]
- [x] `grep -rn "color" htdocs/app htdocs/database htdocs/resources` で残存参照なしを確認 [08 §8]
- [ ] ブラウザでジャンル・保管場所セレクトが従来通り動作することを確認 [08 §8]（本セッションのツール制約により未実施。ユーザーによる確認を推奨）

## Phase 12: UI一貫性・不具合修正 [09]

`docs/09_ui_consistency_fixes.md` の指示書に基づく。§6-2（追加直後の自動選択）は Phase 13 完了後に着手する。

> **注記（2026-08-01）**: 指示書は `Dashboard.tsx`・`Welcome.tsx` の存在を前提に変更対象としているが、この2ファイルは既に削除済みで現存しない（`resources/js/Pages/`配下は`Auth`/`Group`/`Items`/`Profile`のみ）。該当箇所の作業は対象外として扱う。

- [x] `AuthenticatedLayout.tsx`: `min-h-screen`化・`overflow-y-auto`削除・`<nav>`を`sticky top-0 z-30`に [09 §1]
- [x] `tailwind.config.js`: `maxWidth.page`（36rem）新設、ナビ内側幅を統一 [09 §3-0]
- [x] `Components/PageContainer.tsx` / `PageHeading.tsx` 新規作成 [09 §3-1,§3-2]
- [x] `header` prop廃止、Items/Group/Profile各画面を`PageContainer`+`PageHeading`へ統一（Dashboard/Welcomeは対象外）[09 §2,§3-3]
- [x] `Items/Partials/Form.tsx`: 外側`py-6`削除、パネルの競合クラス整理 [09 §3-4]
- [x] `Group/Create.tsx`: パネル内`<h2>`見出し重複解消、`lg:py:8`タイポ修正 [09 §2,§3-4]
- [x] `Items/Index.tsx`: `PageContainer`に`pb-24`を追加しFABとの重なりを解消 [09 §4]
- [x] モバイルメニューにグループ編集/作成の導線を追加 [09 §5]
- [x] `SelectableWithAdd.tsx`: `＋追加`をラベル行へ移動し`w-20`固定幅を撤廃 [09 §6-1]
- [x] `Items/Partials/Form.tsx`: 追加直後に該当オプションを自動選択（Phase 13完了後）[09 §6-2]
- [x] `docs/04_frontend_design_guide.md` へ事後反映（§2.2, §6.4, 新規§6.10, z-index対応表, §5.7, §5.5, §7）[09 §7]
- [x] `npm run tsc` / `npm run lint` / `npm run build` 成功、`php artisan test`回帰なし [09 §10]
- [ ] 全画面でライト/ダーク・PC/スマホ実機を目視確認 [09 §10]（本セッションはブラウザ操作ツールが利用できず未実施。ユーザーによる確認を推奨）

---

## 進捗メモ（新しいものを上に）

- 2026-08-02: ボタン表記とアクションの整合性をユーザー指摘により調査・修正。**発見事項**: 全画面の見出し・ボタンラベルを一覧化した結果、「登録」「作成」系の見出しなのに保存ボタンが「保存」のままになっている箇所が2件（`Items/Create.tsx`→共有`Form.tsx`、`Group/Create.tsx`）、加えて`SelectableWithAdd.tsx`の「新規追加」モーダルも`SaveButton`のデフォルト値「保存」のままで同種の不整合があった。他の編集(Update)・削除(Delete)系画面（`UpdateGroupForm`・`Profile`配下・`DeleteGroupForm`・`LeaveGroupForm`）はすべて「動詞+する」で見出しとボタンが一致していることを確認。**対応**: `Items/Partials/Form.tsx`の`ItemFormProps`に`submitLabel`propを追加しボタン文言のハードコードを廃止、`Items/Create.tsx`は「登録する」、`Items/Edit.tsx`は他の編集系画面と揃えて「更新する」を渡すよう変更（ユーザー確認済み）。`Group/Create.tsx`は「保存」→「作成する」に変更。`SelectableWithAdd.tsx`の`SaveButton`に`label="追加する"`を明示指定。ボタンの色・トークンは変更せず文言のみの修正。**検証**: `grep`でボタン文言をアサートするテストが存在しないことを確認済み。`php artisan test`全49件パス（回帰なし）、`npm run tsc`/`lint`（既存9件のみ）/`build`成功。ブラウザでの目視確認は本セッションのツール制約により未実施。

- 2026-08-02: アイテム編集画面の不具合修正と「アイテム」→「ストック」表記統一を実施。**不具合**: `ItemController::update()`が成功時に`items.index`（在庫一覧）ではなく`items.edit`（自分自身の編集画面）へリダイレクトしていた（ユーザー報告により発覚）。`store()`はPhase 10で`items.index`へ変更済みだったが、`update()`は対象から漏れていた。`items.index`へのリダイレクトに修正し、`tests/Feature/ItemUpdateTest.php`の`assertRedirect`も合わせて更新。**表記統一**: UI上の呼称を「アイテム」から「ストック」に統一（一部画面は既に変更済みだったため残りを洗い出し）。フロント: `Items/Index.tsx`のHead title・空状態文言・登録CTA（3箇所）、`Group/Partials/LeaveGroupForm.tsx`の脱退説明文（1箇所）。バックエンド: `ItemController.php`のフラッシュメッセージ（保存/更新/削除の成功・失敗、計5箇所）。**スコープ外として維持**: `Log::info`/`Log::error`のログメッセージ、PHPDocコメント、ルート名（`items.*`）・モデル名（`Item`）・コントローラ名・ディレクトリ名などのコード識別子、`docs/*.md`（いずれも「画面」表示ではないため）。**検証**: `php artisan test`全49件パス（回帰なし）、`npm run tsc`/`lint`（既存9件のみ）/`build`成功。ブラウザでの目視確認は本セッションのツール制約により未実施。

- 2026-08-02: Phase 12のフォローアップとして、Auth画面（GuestLayout）のパディングとパネル角丸の不統一をユーザー指摘により調査・修正。**発見事項**: (1) `GuestLayout.tsx`のカードパディングが`sm:p-6`で、他パネル（Items Form/Group/Profile）の`sm:p-8`と不統一だった。(2) パネルの角丸`rounded-[20px]`が`sm:`プレフィックス付き（モバイルは直角）のものと常時適用のものに分かれており、`PageContainer`が全ブレークポイントで`px-4`以上の余白を確保している（＝どのパネルもフルブリードにならない）ことを踏まえると意図的な設計ではなく踏襲ミスと判断。(3) 副次的に`SelectableWithAdd.tsx`のモーダル内`TextInput`に`className="border rounded w-full"`という重複・競合クラスを発見。ビルド済みCSSで`.rounded`より`.rounded-lg`が後に定義されていることを確認し、カスケードでは実害なし（表示上のバグではない）と判断した上でクリーンアップ。**対応**: `Group/Create.tsx`・`Group/Edit.tsx`（3箇所）・`Profile/Edit.tsx`（4箇所）・`Items/Partials/Form.tsx`の`sm:rounded-[20px]`を`rounded-[20px]`に統一、`GuestLayout.tsx`を`p-4 sm:p-8`に変更、`SelectableWithAdd.tsx`の重複クラスを`w-full`のみに整理。`GuestLayout`の`border border-line`（枚線）はユーザー確認の上、Modal同様の意図的な差別化として現状維持。`docs/04`§6.4・§6.10に規定を追記。**検証**: `npm run tsc`/`npm run lint`（既存9件のみ、新規なし）/`npm run build`成功。ブラウザでの目視確認は本セッションのツール制約により未実施。

- 2026-08-01: Phase 13（ジャンルのColor切り離し・登録API整理）・Phase 12（UI一貫性・不具合修正）を完了。指示順序どおりPhase 13→Phase 12の順で実装。

  **調査で発見した2件のドキュメント上の食い違い**: (1) `docs/08` 180行目が「`docs/07` §6-2を参照」としていたが`docs/07_logo_redesign.md`に§6-2は存在せず、正しくは`docs/09` §6-2への参照ミスだったため修正。(2) `docs/09`が`Dashboard.tsx`/`Welcome.tsx`の存在を前提にしていたが、両ファイルは既に削除済みで現存しないため、該当箇所の作業は対象外として扱った。

  **Phase 13（バックエンド）**: 新規マイグレーション`2026_08_01_000000_drop_colors_and_genre_color_id.php`で`genres.color_id`と`colors`テーブルを削除（既存マイグレーションは無変更）。`Genre`モデルから`color_id`・`color()`リレーション・`with('color')`を削除、`Color`モデルと`ColorsTableSeeder`を削除、`DatabaseSeeder`から呼び出しを除去。`GenreController::store()`は`color_id`のハードコードを削除し、成功時に作成したレコード（`id`/`name`）を`data`として返却（201化、エラー文言修正）。`PlaceController::store()`は`data`返却のみ追加し他は無変更。`resources/js/api/optionsApi.ts`に`AddOptionResponse`型を追加。`tests/Feature/GenreApiTest.php`を新規作成（6ケース、`color_id`列不在の検証含む）。

  **Phase 12（フロント）**: `AuthenticatedLayout.tsx`のスクロール構造を`h-screen`+`main`内部スクロールから`min-h-screen`のドキュメントスクロールに戻し（PCで保存ボタンに到達できない不具合の修正）、`<nav>`を`sticky top-0 z-30`に。`tailwind.config.js`に`maxWidth.page`（36rem）を新設しナビ幅を統一。`Components/PageContainer.tsx`・`PageHeading.tsx`を新規作成し、`header` prop方式を廃止して`AuthenticatedLayout`・`Items/Index,Create,Edit`・`Group/Create,Edit`・`Profile/Edit`を統一（`Form.tsx`の外側`py-6`重複解消・パネルの競合クラス整理、`Group/Create.tsx`の見出し重複と`lg:py:8`タイポも修正）。`Items/Index.tsx`に`pb-24`を追加しFABとの重なりを解消。モバイルメニューにグループ編集/作成の導線を追加（デスクトップ用Dropdownと同じ分岐）。`SelectableWithAdd.tsx`の「＋追加」を`w-20`固定幅からラベル行のテキストボタンへ変更しスマホでの折り返しを解消。Phase 13完了を受けて`Form.tsx`の`handleAddGenre`/`handleAddPlace`に追加直後の自動選択を実装。`docs/04_frontend_design_guide.md`に`max-w-page`トークン・ページ骨格（§6.10新設）・スクロール構造の禁止事項・z-index対応表・FAB余白・＋追加配置と自動選択の方針を事後反映。

  **検証**: `php artisan test`は全49件パス（回帰なし。作業中に一時`config:clear`が必要な環境要因のstaleキャッシュで28件失敗する事象があったが、これは今回の変更が原因ではなくキャッシュクリアで解消することを確認）。`php artisan migrate`/`migrate:fresh --seed`成功。`grep -rn "color" htdocs/app htdocs/database htdocs/resources`で残存参照なし（マイグレーションファイル自体を除く）。`npm run tsc`はエラーなし、`npm run lint`は既存の9件（`ssr.tsx`等）のみで新規の指摘なし、`npm run build`成功。**ブラウザでの実機・実見た目確認は本セッションでブラウザ操作ツールが利用できなかったため未実施**。ユーザーによる目視確認（Phase 12 §1の保存ボタン到達・全画面のライト/ダーク表示・スマホ実機でのスクロール/FAB重なり/モバイルメニュー、Phase 13のジャンル・保管場所セレクトの動作）を推奨。

- 2026-07-26: Phase 11（音声入力の削除）実装完了。**削除したファイル**: `htdocs/app/Http/Controllers/VoiceController.php`、`htdocs/resources/js/Components/VoiceInput.tsx`、`htdocs/resources/js/hooks/useVoiceRecorder.ts`、`htdocs/resources/js/utils/audioUtils.ts`。**バックエンド**: `routes/api.php` から `POST /voice/transcribe`（`api.voice.transcribe`）ルートと `VoiceController` の import を削除、`routes/web.php` の未使用 import も削除。`config/services.php` から `whisper` 設定ブロックを削除。`ItemController::create`/`edit` で行っていた `route('api.voice.transcribe')` の生成・`apiUrl` プロパティの Inertia への受け渡しを削除。`.env.example`/`.env.testing` から `WHISPER_URL` を削除。**フロント**: `Pages/Items/Partials/Form.tsx` から `VoiceInput` の呼び出し・`voiceProcessing` state・`apiUrl` prop を除去（各入力の `disabled` 条件も `processing` のみに簡素化）。`Pages/Items/Create.tsx`/`Edit.tsx` から `apiUrl` の受け取り・`Form` への受け渡しを削除。`README.md` の「主要機能」「技術スタック」からも音声入力・Whisper API の記載を削除。**検証**: `grep -rniE "voice|whisper"` でコード側（`docs/`・`CLAUDE.md` 以外）に参照が残っていないことを確認。このworktreeは `composer install`/`npm install`/`vite build` 未実施の状態だったため一式実行した上で `php artisan test` を実行し、7 failed / 28 passed（既知のAuth系・環境起因の失敗のみ、Phase 10までと同一で回帰なし）を確認。`npm run tsc` は既知の `ssr.tsx` エラーのみ、`npm run lint` は削除により警告数が減少（VoiceInput.tsx分の警告が消滅）し新規の指摘なしを確認。Phase 11 完了により MVP フェーズ0 の実装 TODO は全フェーズ完了。
- 2026-07-26: Phase 10の実機検証を実施（前回セッションではDockerコンテナ名衝突により未実施だった分）。本体`uchistock-*`スタックを停止し、このworktreeで`docker-compose up -d`（コンテナ名はデフォルトの`uchistock-*`のまま、ポートも本体と同一。同時起動しない運用に変更したため名前・ポートは変更不要）→ `migrate --seed`実行→検証。**結果**: (1) `php artisan test`: 28 passed / 7 failed（既知のAuth系・環境起因の失敗で全フェーズ通じて同一、回帰なし。Phase9時点の26 passedからPhase10で追加した`ItemStoreTest`2件が加わり28 passedへ）。(2) `npm run tsc`: エラーは`ssr.tsx`のみ（`b9ab2d4`時点からの既存エラーでPhase10とは無関係）。(3) `npm run lint`: 1 error/11 warningsだが全て`UpdateProfileInformationForm.tsx`（Phase8由来）・`VoiceInput.tsx`・`ssr.tsx`等の既存箇所でPhase10の変更ファイルには新規の指摘なし。(4) `curl`でnginx→php-fpm→mysqlの疎通確認（`/login`が200）。**ブラウザ確認（ユーザー実施、2026-07-26）**: 登録後の`items.index`遷移・トースト表示・購入履歴自動作成を含め目視確認完了。Phase 10の実機検証がすべて完了。
- 2026-07-25: Phase 10（登録UX改善）完了。**バックエンド**: `ItemController@store` の成功時リダイレクト先を `items.create` → `items.index` に変更し、`with('success', "{$item->name}を登録しました")` に差し替え（フラッシュメッセージは既存の `AuthenticatedLayout` の `flash.success` → `showSuccessToast` の仕組みをそのまま利用、新規実装なし）。同メソッド内でアイテム保存と同一トランザクション内に `ItemService::createInitialPurchaseHistory(Item, User)`（新設）を呼び出し、購入履歴を1件自動作成（`recordPurchase` とはロジックを分離し、ステータスは上書きしない設計を踏襲）。**フロント**: `Pages/Items/Create.tsx` のヘッダー上部に `items.index` 固定で戻る `Link`（`MdArrowBack` アイコン）を追加。`utils/toast.tsx` の `showBuyUndoToast` を `autoClose: 6000→3500`、`className: "!min-h-0 !py-2 !px-3"` でコンパクト化（`showSuccessToast`/`showErrorToast` には影響させず、Undoトーストのみに適用）。`ItemCard.tsx` 側の「購入記録なし」分岐（`days_since_purchase === null`）はコードとして変更せず維持（将来の履歴削除経路への防御）。**テスト**: `tests/Feature/ItemStoreTest.php` を新規作成し、(1) `store` 後に `items.index` へリダイレクトしフラッシュメッセージが含まれること、(2) 購入履歴が1件自動作成されフォームで選択した `status`（`low` 等）が上書きされないこと、の2ケースを追加。**検証について**: 本セッションでは Docker コンテナ名が固定（`uchistock-app` 等）でありメインチェックアウト側の起動中コンテナと衝突したため、ユーザーとの相談の結果 `php artisan test`/`npm run tsc`/`npm run lint`/ブラウザでの目視確認は本セッションでは実施せず、コードレビューでの整合性確認のみで完了とした。次回セッションでの実機検証を推奨。
- 2026-07-25: Phase 9 完了。本セッションでは、別セッション（メインリポジトリ側）で先行して行われていたPhase 9作業（コミット `c802907`, PR #89でdevelopmentへマージ済み）にこのworktreeを`git merge --ff-only origin/development`で追随させた上で、残タスクを実施。(1) ユーザーが実機/ブラウザで「全画面ライト/ダーク目視確認」「スマホ実機での3秒判断確認」を完了したことを確認し、該当2チェックボックスを`[x]`に変更。(2) 既に修正済みだった不具合2件（FAB配色のトンマナ違反・一覧カードから編集画面への導線欠落）に対する回帰防止として`tests/Feature/ItemEditTest.php`を新規作成（自グループの`items.edit`が200＋Inertia `Items/Edit`をレンダーすること／他グループのアイテムは404になることを検証）。`php artisan test`全体で26 passed（新規2件含む）・既存7件失敗（Auth系・環境起因、全フェーズ通じて同一）で回帰なしを確認。(3) Phase 9の全チェック項目が完了したため進捗サマリを✅完了に更新。**残タスク**: Phase 10（登録UX改善）・Phase 11（音声入力削除の実装）は引き続き未着手。

- 2026-07-25: Phase 9 目視確認（ユーザー実施）で新たに2件の不具合を発見・修正。(1) ライトモードでFAB（＋登録ボタン）が`bg-ink`（黒系）になっており§6.2のトンマナに反していたため`bg-accent text-accent-ink`に修正。(2) 一覧カードから編集画面へ遷移する導線が存在せず（Phase 6のリデザイン時に旧テーブルの編集リンクが引き継がれず欠落）、「個数を一度修正すると再修正できない」という報告の真因だったことが判明（そもそも編集画面へ到達できなかった）。`ItemCard.tsx`の品名を`Link`化し`items.edit`へ遷移できるよう修正、ユーザーが遷移可能なことを確認済み。`docs/04`§5.1・§10.6に導線仕様を追記。**残タスク**: この編集導線に対するFeatureテスト（`items.edit`のGET確認・他グループ404）を追加すること。なお、ログイン後の遷移先（`intended()`によるIntended URL復元）とダークモードのLINEログインボタン文字色の非対称（accent/danger-inkのコントラスト反転設計との対比）についてもユーザーに確認したが、いずれも現状維持で確定。
- 2026-07-25: Phase 9（総仕上げ・受け入れ）着手。機械的に確認可能な項目を実施: (1) `git diff origin/development...HEAD` で認証/グループ機能/Docker構成/ジャンル・保管場所管理に差分がないことを確認（現ブランチ`feat/mvp_phase9`は`origin/development`と同一コミットから分岐、コード変更は未着手）。(2) 音声入力・グループ機能のコードレベルでのデグレ確認（`VoiceInput.tsx`/`api.voice.transcribe`ルートの現存を確認。実機動作確認は別途要）。(3) `php artisan test` 実行時に `htdocs/.env.testing` の `APP_KEY` が空になっており全Featureテストが `MissingAppKeyException` で失敗する不具合を発見。原因はPhase 8のコミット(`87e71b8`)でLINE認証情報と同様に機密情報と誤認され手動で削除されたものと推測。`php artisan key:generate --show` でテスト専用キーを新規生成し復旧（`base64:6/rLfwl1pO4BioLzoSIYriZjO2ltf18e52H6N9rKrTM=`）。復旧後は24 passed / 既存7件失敗（Auth系・環境起因、全フェーズ通じて同一の既知の失敗）で回帰なしを確認。(4) F-1〜F-4の受け入れ条件をコードレビューで確認: F-1〜F-3は実装済みで要件を満たす。F-4は基本部分（status選択・quantity任意化）は実装済みだが、2026-07-24追記の登録後遷移・購入履歴自動作成はPhase 10未着手のため未充足（想定通り、Phase 10で対応予定）。**残タスク**: 全画面のライト/ダーク目視確認、スマホ実機での「開いて3秒で判断」確認 — いずれも本セッションのツール制約により未実施、ユーザー側での確認が必要。開発DBのデータ（9 items / 1 user）はテスト実行前後で保持されることを確認済み。
- 2026-07-24: 【ドキュメント更新のみ・コード変更なし】「気になる挙動」4件についてユーザーと方針を検討し、`CLAUDE.md`・`docs/02`・`docs/03`・`docs/04`・`docs/05` を更新。(1) 登録後の遷移: `items.store` 成功時のリダイレクト先を `items.index` に変更し「〇〇を登録しました」のフラッシュ表示、`Items/Create.tsx` ヘッダーに戻る導線（`items.index`固定）を追加する方針を `docs/03` §7.13・`docs/04` §5.8 に明記。(2) 登録時の購入履歴自動作成: `ItemController@store` で同一トランザクション内に購入履歴を1件自動作成（ステータスは上書きしない。`recordPurchase`とは別処理として`ItemService::createInitialPurchaseHistory`を新設）する方針を `docs/03` §7.14・`docs/02` §3.2 に明記。「購入記録なし」分岐は将来の防御として維持。(3) Undoトースト: `autoClose`を6000→3500に短縮し、コンパクトな`className`を追加する方針を `docs/04` §5.6,§10.7 に明記。(4) 音声入力削除: `CLAUDE.md` §8・`docs/02` §5・`docs/03` §4/ステップ5/6・`docs/04` §8,§5.7,§10.9 から音声入力を「変更禁止」対象外とし「削除予定」に変更（Whisper API未整備で実質使用不可のため）。ドキュメント更新を完了条件とする削除手順を `docs/05` Phase 11 に整理。上記いずれも本セッションでは**ドキュメントのみ更新し、実装コードには一切手を加えていない**。新規タスクは `docs/05` Phase 10（登録UX改善）・Phase 11（音声入力削除）として追加。次回はこれらの実装から着手可能。
- 2026-07-24: Phase 8（他画面トンマナ）完了。**Auth6画面**（Login/Register/ForgotPassword/ConfirmPassword/VerifyEmail/ResetPassword）: `text-LINK01`/`hover:text-blue-*`/`visited:text-LINK02` のリンク色を `text-accent hover:text-ink` に統一、説明文・補助文言の `text-gray-*` を `text-muted`/`text-ink` に置換。ステータス系メッセージ（メール確認送信済み等）の緑色は「緑はステータス専用」ルールに従い`text-ink`の中立表示に変更。LINEログインボタン（`LINE01`）は指示通り維持。**Group**（Create/Edit＋UpdateGroupForm/DeleteGroupForm/LeaveGroupForm）: パネルを`bg-surface shadow-card sm:rounded-[20px]`に、見出し`text-ink`・本文`text-muted`に統一。既存の主=`PrimaryButton`(accent)・削除=`DangerButton`・脱退=`DangerButton`の割り当てはそのまま維持（§6.2準拠を確認）。DeleteGroupFormのパスワード未設定時リンクも`text-accent`へ。**Profile**（Edit＋4partials）: 同様にパネル・見出し・本文をトークン化、メール確認リンク・送信済みメッセージも整合。**Welcome.tsx**: 未定義だった`bg-dots-*`ユーティリティ（tailwind.config.js未登録で無効化していた）を`bg-paper`に置換、リンク文言・selectionカラーをトークン化。**Dashboard.tsx**: 残す/削除の意思決定はスコープ外のため保留し、現状維持前提でパネル・文字色のみトークン化。検証: `npm run tsc`/`npm run lint`で新規エラーなし（既存の`ssr.tsx`起因のみ）、`vite build`成功、`php artisan test`で回帰なし（24件パス、既存7件失敗はAuth系・環境起因で同一）、開発DBのデータもテスト前後で保持。**ブラウザでの実見た目確認は本セッションのツール制約により未実施**、Phase 9で全画面のライト/ダーク目視確認を行う。
- 2026-07-24: Phase 7（Items フォーム）完了。`Pages/Items/Partials/Form.tsx`: `FormItemFields`/`FieldName` に `status` を追加し、品名の次に `StatusSegment`（Phase6で作成済み）を再利用したステータス選択UIを追加（既定は編集時=既存値／新規時=`in_stock`）。`quantity` の型を `number` → `number | null` に変更し、空入力は `null` を送信するよう変更、ラベルを「個数」→「個数（任意）」に変更。フォームパネルの残存旧配色（`bg-white dark:bg-gray-800`・`shadow-md`・`rounded-lg`・エラー文言の`text-red-500`）もトークン化（`bg-surface`・`shadow-card`・`rounded-[20px]`・`text-danger`）。＋追加ボタン（`AddButton`＝ghost）・保存ボタン（`PrimaryButton`＝`bg-accent`）は Phase4 で既に是正済みであることを確認。`Pages/Items/Create.tsx`/`Edit.tsx` の `useForm` 初期値に `status` を追加（Create既定`in_stock`・Edit既存値）、`quantity` 初期値を `1` → `null` に変更、`Edit.tsx` の `Item` 型にも `status`/`quantity: number | null` を追加。音声入力 `VoiceInput` の `onResult` は変更せず現状維持（name/quantityのみセット、statusは不変）で音声入力デグレなしを確認。検証: `npm run tsc`/`npm run lint`で新規エラーなし（既存の`ssr.tsx`起因のみ）、`vite build`成功、`php artisan test`で回帰なし（24件パス、既存7件失敗はAuth系・環境起因で同一）、開発DB（users/items件数）もテスト実行前後で保持されることを確認。**ブラウザでの実見た目確認（フォームでのステータス切替・個数任意入力の挙動）は本セッションのツール制約により未実施**。
- 2026-07-23: 【環境修正】テスト実行が開発DBを破壊していた問題を修正。原因は、`docker-compose.yml` の `app` サービスの `env_file: .env`（リポジトリルートの `.env`。`DB_CONNECTION`/`DB_HOST`/`DB_DATABASE`等を含む）がコンテナの実OS環境変数として注入され、Laravelの環境変数解決順序（`$_SERVER`優先）により `phpunit.xml` 側のテスト用DB指定が上書きされず、Feature テストの `RefreshDatabase` が開発DB（`uchistock-db`）に対して `migrate:fresh` 相当を実行し、データが消えていたこと。対応: (1) `docker-compose.yml` の `app` サービスから `env_file: .env` を削除（`db`サービスは対象外）、要 `docker-compose up -d --force-recreate app`。(2) `uchistock-db-testing` DBを新設し `db-user` に権限付与。(3) `htdocs/.env.testing` を新規作成（`DB_DATABASE=uchistock-db-testing`・`APP_ENV=testing`・array/syncドライバ等）し `.gitignore` に追加。(4) `phpunit.xml` は `APP_ENV=testing` のみ残し他は `.env.testing` に一本化。検証: `php artisan test` を複数回実行しても開発DB（users/items件数）が保持され、テストは `uchistock-db-testing` に対して実行されることを確認（migrate:fresh後は空、テスト後も開発DBは無傷）。**なお `Item::getItemsByGroupId` は MySQL固有の `FIELD()` 関数を使用しているため、SQLite化は見送りMySQLのテストDBを採用（ユーザー指摘により方針転換）**。
- 2026-07-23: 【環境整備】開発時に毎回ユーザー登録する手間を省くため、`database/seeders/UserSeeder.php`（開発用グループ＋`test@example.com`/`password`のログイン可能ユーザー）と `database/seeders/ItemSeeder.php`（ジャンル4種・保管場所4種・在庫状態/購入履歴のバリエーションを持つアイテム8件）を新規作成し `DatabaseSeeder` に登録。`migrate:fresh --seed` で開発DBに投入済み。
- 2026-07-23: Phase 6（Items 一覧カード）完了。`resources/js/constants/itemStatus.ts` 新規（`ItemStatusValue`/`ITEM_STATUS`/`STATUS_ACTIVE_CLASS`、単一の真実）。`Components/StatusSegment.tsx` 新規（3値segmented control・1タップ変更・`role="group"`/`aria-pressed`・`motion-safe:active:scale-95`）。`Components/BuyButton.tsx` 新規（`in_stock`時はghost表示、`react-icons/md`のカートアイコン）。`Pages/Items/Partials/ItemCard.tsx` 新規（品名+個数チップ/ジャンル・保管場所メタ/前回購入表示+そろそろ買い足し/StatusSegment+BuyButtonの操作段。ステータス変更・買った・Undoの通信ロジック（`router.patch`/`post`/`delete`）を内包）。`Items/Index.tsx` を全面刷新（旧テーブル廃止→1カラム`max-w-xl`のカード一覧、ソート切替は既存`Dropdown`コンポーネントを再利用してInertia `preserveScroll`/`preserveState`付きLinkで実装、空状態カード、右下固定FAB追加）。`Item`型は`Items/Index.tsx`からexportし`ItemCard.tsx`で`import type`により参照（循環参照はTypeScriptの型消去により実害なし）。検証: `npm run tsc`/`npm run lint`で新規エラーなし（既存の`ssr.tsx`起因のエラーのみ、StatusSegment.tsxに既存コードと同種の未使用引数warning1件のみ発生も許容範囲と判断）、`vite build`成功、`php artisan test`で新規追加分含め回帰なし（Item関連6件パス、既存の7件失敗はAuth系・環境起因で変更前と同一）。**ブラウザでの実見た目確認（状態順ソート/前回購入表示/個数チップのnull非表示）は本セッションのツール制約により未実施**、次回実機/ブラウザでの目視確認を推奨。
- 2026-07-23: Phase 5（レイアウト2種）完了。`Layouts/AuthenticatedLayout.tsx`: 背景`bg-gray-100`→`bg-paper`、ナビ/ヘッダー`bg-white`→`bg-surface`＋`border-line`、ドロップダウン起点ボタン・ハンバーガー・モバイルメニューをトークン化（`text-muted`/`text-ink`/`bg-surface-2`）。グループ未所属の強制モーダルは見出し`text-ink`・本文`text-muted`・警告アイコン`text-danger`に統一。`Layouts/GuestLayout.tsx`: 背景`bg-paper`、カード`bg-surface rounded-[20px] shadow-card border border-line`（`max-w-sm`は維持）。付随して `Components/NavLink.tsx`/`ResponsiveNavLink.tsx` のアクティブ色（indigo/blue）を`accent`/`accent-soft`へ、非アクティブを`muted`/`line-strong`へ置換。強制モーダルのボタンに使われている`primary-link-btn`/`secondary-link-btn`（`app.css`）もblue直値からトークン（主=accent／スキップ=neutral、§6.2準拠）へ置換。検証: `npm run tsc`/`npm run lint`で新規エラーなし（既存の`ssr.tsx`起因のエラーのみ、無関係と確認）、`vite build`成功。**ブラウザでの実見た目確認は本セッションのツール制約により未実施**。
- 2026-07-22: Phase 4（共通部品トークン化）完了。`Button.tsx` の variant を `primary`/`neutral`/`danger`/`ghost` に再定義（`warning`/`success` 廃止）し全色をトークン参照へ。`SaveButton`→`primary`、`AddButton`→`ghost`、`CancelButton`→`neutral` に是正（従来 保存/追加=緑・キャンセル=赤の誤用を解消）。`PrimaryButton`/`SecondaryButton`/`DangerButton` は構造を維持したままトークン化（`Button`への統合は見送り、指示書§6.3の「段階的でよい」に従う）。`TextInput`/`TextArea`/`SelectInput`/`Checkbox`/`InputLabel`/`InputError`/`Divider` をトークン化しfocusをaccentリングに統一、フィールド角丸を`rounded-lg`に統一。`Modal.tsx`（オーバーレイ`bg-ink/40`・パネル`bg-surface rounded-[20px] shadow-card`）・`Dropdown.tsx`（面`bg-surface`・`rounded-xl shadow-card`・項目hover`bg-surface-2`）をトークン化。`utils/toast.ts`を`toast.tsx`にリネームし`showBuyUndoToast`を追加、トースト全体の配色は`toastClassName`が`ToastContainer`側のpropだったため`app.tsx`側に移して設定。検証: `npm run tsc`/`npm run lint`で新規エラーなし（既存の`ssr.tsx`起因のエラー・警告は変更前から存在し無関係と確認）、`vite build`成功、コンパイル後のCSS/JSに新トークンクラスが反映されていることを確認。ローカルDocker環境で`public/hot`が古いまま残っておりVite dev serverが実際には起動していない不整合を発見・削除（本番ビルド出力にフォールバックさせ動作確認に使用。git管理外のファイルのため影響なし）。**ブラウザでの実見た目確認は本セッションのツール制約により未実施**、次回実機/ブラウザでのライト・ダーク目視確認を推奨。
- 2026-07-22: Phase 3（API: status/購入/Undo）完了。`routes/web.php` に3ルート追加（`items.status.update`/`items.purchase.store`/`items.purchase.destroy`）。`ItemController` に `findOwnedItem`（他グループは404）、`updateStatus`/`storePurchase`/`destroyLatestPurchase` を追加し、既存 `edit`/`update`/`destroy` も `findOwnedItem` に置換。`index` で `sort`（status/purchased）受け取りと `days_since_purchase` 付与に対応。`ItemService` に `recordPurchase`/`undoLatestPurchase` を実装（DBトランザクション）。`ItemCreateRequest`/`ItemUpdateRequest` の `quantity` を `nullable|min:0` に緩和、`status` を enum バリデーションに追加、未指定時は `in_stock` をデフォルト適用。`ItemFactory`/`PurchaseHistoryFactory` を新規作成。Feature テスト `ItemStatusTest`（自グループ更新・他グループ404・不正値422）・`ItemPurchaseTest`（購入記録・他グループ404・Undo復元）を追加し全6件パス。`php artisan test` 全体は新規6件含め24件パス、既存の7件失敗（Auth系・環境起因）は変更前と同一で回帰なしを確認。
- 2026-07-22: Phase 2（DB・モデル基盤）完了。`app/Enums/ItemStatus.php` 新規作成（label/sortWeight/values）。マイグレーション2本追加（`add_status_to_items`＝status列 default in_stock、`create_purchase_histories_table`）。`app/Models/PurchaseHistory.php` 新規作成。`Item` モデルに `status` の fillable/casts、`purchaseHistories()` リレーション追加、`getItemsByGroupId` を `withMax` + `orderByRaw`（status順/purchased順）へ差し替え。`migrate:fresh --seed` を実行（既存のローカル手動テストデータ7件は消える前提でユーザー承認済み）。DBスキーマ（quantity nullable / status default in_stock）・Enumキャスト・並び順ロジックをtinkerで実地検証。既存Featureテストは変更前と同じ7件失敗（Auth系・環境起因、Phase 2の変更とは無関係と確認済み）で回帰なし。作業ブランチは `feat/mvp_phase1`→PR #80で`development`へマージ済み、現在は新規ブランチ `feat/mvp_phase2` で作業中（ユーザーが別途ブランチ運用を実施）。
- 2026-07-22: Phase 0（事前準備）・Phase 1（デザイン基盤トークン）完了。作業ブランチは既存の `feat/mvp_phase1` を継続使用。`items.quantity` の nullable 化は `doctrine/dbal` 不使用で `create_items_table` マイグレーションを直接編集する方式に変更（`docs/03` 更新済み）。`app.css` にカラートークン（paper/surface/ink/status/accent/danger）を light/dark 両方で定義、`tailwind.config.js` に同トークン・丸ゴシックフォント・`shadow.card` を登録し、`tailwindcss` CLI 単体ビルドでユーティリティ生成を確認。
- 2026-07-21: ドキュメント（01〜04）整備完了、本TODO作成。実装未着手。
