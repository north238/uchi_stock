# UchiStock フロントエンド デザイン指示書（MVP / フェーズ0）

最終更新: 2026-07-21
対象読者: フロントエンド実装担当（AIエージェント）およびレビュアー（開発者本人）
上位文書: `docs/02_requirements.md`（要件）／ `docs/03_implementation_plan.md`（実装計画）
ビジュアル基準: リデザイン案モック v1（`親しみやすい生活アプリ` / ステータス主役）

本書は、確定したデザイン方向を実装に落とすための指示書。**色・タイポ・余白・コンポーネント形状**を規定し、`resources/js` の実装がこの基準からブレないようにする。バックエンドAPI・データ設計は `docs/03` を正とする。

---

## 1. デザイン原則

1. **開いて3秒で「買ってよいか」が分かる。** 一覧はスクロールせず上部だけで判断材料が視認できる密度にする。
2. **ステータスが主役、個数は脇役。** 視覚的な主役は「ある／少ない／ない」。個数は小さな参考表示に留める。
3. **色の役割を分離する。** 緑＝ステータス（状態）専用の意味色。コーラル＝アクション（買った・登録）専用のアクセント。この2つを混同しない。
4. **親しみやすい生活の道具。** 丸ゴシック・広めの余白・角丸で、家族の誰でも触れる柔らかさを出す。
5. **ダーク対応は必須。** 全コンポーネントでライト／ダーク両方を成立させる。

## 2. カラートークン

Tailwind の `dark:` は既存コード同様 **メディアクエリ方式**（OS設定追従）で運用する。新規のリデザイン部分は **CSSカスタムプロパティをトークン層**として持ち、テーマ切替を1箇所に集約する（既存の `dark:gray-800` 等の直接指定はそのまま残してよい）。

### 2.1 トークン定義（`resources/css/app.css` に追加）

```css
@layer base {
  :root {
    /* ベース（温かみのある紙色。定番クリームは避けた中立紙） */
    --color-paper: 241 242 238; /* #F1F2EE 背景 */
    --color-surface: 255 255 255; /* #FFFFFF カード */
    --color-surface-2: 247 248 244; /* #F7F8F4 面2 */
    --color-ink: 35 39 31; /* #23271F 文字 */
    --color-muted: 109 115 104; /* #6D7368 補助文字 */
    --color-faint: 154 160 148; /* #9AA094 弱文字 */
    --color-line: 229 231 223; /* #E5E7DF 罫線 */
    --color-line-strong: 213 216 205; /* #D5D8CD 強罫線 */

    /* アクセント＝コーラル（アクション専用） */
    --color-accent: 239 106 74; /* #EF6A4A */
    --color-accent-ink: 255 255 255; /* ボタン上の文字 */
    --color-accent-soft: 253 238 233; /* #FDEEE9 */

    /* ステータス＝緑の単色濃淡（意味色 / 濃い=ある→薄い=ない） */
    --color-st-in: 31 158 90; /* #1F9E5A ある（満） */
    --color-st-in-ink: 255 255 255;
    --color-st-low: 154 211 176; /* #9AD3B0 少ない（中） */
    --color-st-low-ink: 16 80 47;
    --color-st-out: 238 245 240; /* #EEF5F0 ない（空・アウトライン） */
    --color-st-out-ink: 92 155 120;
    --color-st-out-line: 203 228 213; /* #CBE4D5 */
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --color-paper: 22 24 20; /* #161814 */
      --color-surface: 35 38 31; /* #23261F */
      --color-surface-2: 28 31 25; /* #1C1F19 */
      --color-ink: 238 240 232; /* #EEF0E8 */
      --color-muted: 162 168 154; /* #A2A89A */
      --color-faint: 118 124 110; /* #767C6E */
      --color-line: 51 55 48; /* #333730 */
      --color-line-strong: 63 68 58; /* #3F443A */
      --color-accent: 244 122 92; /* #F47A5C */
      --color-accent-ink: 36 16 9; /* #241009 */
      --color-accent-soft: 58 36 29; /* #3A241D */
      --color-st-in: 43 171 102; /* #2BAB66 */
      --color-st-in-ink: 6 33 15;
      --color-st-low: 79 143 107; /* #4F8F6B */
      --color-st-low-ink: 234 250 240;
      --color-st-out: 35 48 42; /* #23302A */
      --color-st-out-ink: 127 184 151;
      --color-st-out-line: 55 73 63; /* #37493F */
    }
  }
}
```

> `R G B` 形式で持つのは、Tailwind の `<alpha-value>` を使えるようにするため。

### 2.2 Tailwind への登録（`tailwind.config.js` の `theme.extend.colors` に追記）

既存の `LINE01` / `LINK01-03` は残し、以下を追加する。

```js
colors: {
  // 既存
  LINE01: "#06C755", LINK01: "#0645AD", LINK02: "#681da8", LINK03: "#3366BB",
  // 追加：リデザイン用トークン
  paper:      "rgb(var(--color-paper) / <alpha-value>)",
  surface:    "rgb(var(--color-surface) / <alpha-value>)",
  "surface-2":"rgb(var(--color-surface-2) / <alpha-value>)",
  ink:        "rgb(var(--color-ink) / <alpha-value>)",
  muted:      "rgb(var(--color-muted) / <alpha-value>)",
  faint:      "rgb(var(--color-faint) / <alpha-value>)",
  line:       "rgb(var(--color-line) / <alpha-value>)",
  "line-strong":"rgb(var(--color-line-strong) / <alpha-value>)",
  accent:     "rgb(var(--color-accent) / <alpha-value>)",
  "accent-ink":"rgb(var(--color-accent-ink) / <alpha-value>)",
  "accent-soft":"rgb(var(--color-accent-soft) / <alpha-value>)",
  status: {
    in:  "rgb(var(--color-st-in) / <alpha-value>)",
    low: "rgb(var(--color-st-low) / <alpha-value>)",
    out: "rgb(var(--color-st-out) / <alpha-value>)",
    "in-ink":  "rgb(var(--color-st-in-ink) / <alpha-value>)",
    "low-ink": "rgb(var(--color-st-low-ink) / <alpha-value>)",
    "out-ink": "rgb(var(--color-st-out-ink) / <alpha-value>)",
    "out-line":"rgb(var(--color-st-out-line) / <alpha-value>)",
  },
}
```

以降、色は `bg-surface` / `text-ink` / `bg-status-in` のようにトークン経由で指定する。テーマ差はトークンが吸収するため、原則 `dark:` を新規に書かない。

### 2.3 ステータス色マッピング（確定事項）

| 状態   | 値         | 濃淡           | 見え方                           |
| ------ | ---------- | -------------- | -------------------------------- |
| ある   | `in_stock` | 最も濃い（満） | 塗りつぶし濃緑・白文字           |
| 少ない | `low`      | 中間           | 塗りつぶし中緑・濃緑文字         |
| ない   | `out`      | 最も薄い（空） | 淡い面＋緑アウトライン・弱緑文字 |

**「鮮度が薄れて空になる」メタファー。** 「ない」が最も控えめな見た目になるため、以下で"買い時"を担保する:

- 一覧の並びは **ない → 少ない → ある**（`out` を最上部）
- `out` / `low` のカードには**コーラルの一言**「そろそろ買い足し」を添える（緊急性はアクセント色が担い、状態は緑が担う）

## 3. タイポグラフィ

- フォント（`tailwind.config.js` の `fontFamily.sans` を差し替え）:

```js
fontFamily: {
  sans: [
    '"Hiragino Maru Gothic ProN"', '"Hiragino Maru Gothic Pro"',
    '"Hiragino Sans"', '"Yu Gothic UI"', '"Noto Sans JP"',
    "system-ui", "-apple-system", ...defaultTheme.fontFamily.sans,
  ],
},
```

- **丸ゴシック優先。** 主要ターゲット（開発者本人の iPhone / macOS）では Hiragino Maru Gothic が効き、親しみやすさが出る。Android 等は Noto Sans JP へフォールバック（角丸味は落ちるが可読性は担保）。webフォントCDNは使わない（同一オリジン制約・読み込み遅延回避）。
- 数値（日数・件数）は **`tabular-nums`**（`font-variant-numeric`）で桁を揃える。
- 目安スケール: 品名 17px/700・見出し 20px/700・本文 13–14px・補助 12px。行間はやや広め。

## 4. 形状・余白・影

| トークン          | 値                                                            | 用途                       |
| ----------------- | ------------------------------------------------------------- | -------------------------- |
| カード角丸        | 20px（`rounded-[20px]`）                                      | 一覧カード・フォームパネル |
| チップ/ボタン角丸 | 999px（`rounded-full`）                                       | ステータス・買った・ソート |
| カード内padding   | 13–14px                                                       |                            |
| カード間 gap      | 11–12px                                                       |                            |
| カード影          | `0 1px 2px rgba(30,40,25,.04), 0 6px 20px rgba(30,40,25,.06)` | 浅く柔らかい               |

`box-shadow` は `theme.extend.boxShadow.card` に登録して `shadow-card` で使う。

## 5. コンポーネント仕様

新規は `resources/js/Components` または `resources/js/Pages/Items/Partials` に作成。既存の汎用コンポーネント（`PrimaryButton` 等）は Breeze 由来のため、リデザイン部では**この指示書のトークンに沿った新規コンポーネントを優先**する（既存を無理に流用しない）。

### 5.1 一覧カード `ItemCard`

構成（上→下）:

1. **上段**: 品名（17px/700）＋ 右上に個数チップ `残り {目安}`（`bg-surface-2` / `border-line` / 12px / `text-muted`）。個数が無ければチップ非表示。品名は `Link`（`route('items.edit', item.id)`）とし、タップで編集画面へ遷移する（ジャンル・保管場所・メモ・quantity の確認・修正手段はこの導線のみのため必須。§10.6 参照）
2. **メタ**: `ジャンル ・ 保管場所`（12px / `text-faint`）。両方無ければ省略（空セパレータを出さない）。
3. **前回購入**: 時計アイコン＋「前回購入 **{N}日前**」。記録なしは「購入記録なし」（`text-faint`）。`out`/`low` は末尾に `・ そろそろ買い足し`（`text-accent`/700）。
4. **操作段**: 左に**ステータス セグメント**、右に**買ったボタン**。

> **2026-07-25 追記**: 初期実装（Phase 6）では品名への編集導線が漏れており、一覧カードから編集画面へ一切遷移できない状態だった（Phase 9 受け入れ確認で発覚）。品名を `Link` 化して修正済み。

### 5.2 ステータス セグメント `StatusSegment`（F-1）

- 3ボタン `[ある][少ない][ない]` を角丸トラック（`bg-surface-2` 相当）に格納した segmented control。
- **選択中のみ**該当色で塗る: `in`→`bg-status-in text-status-in-ink` / `low`→`bg-status-low text-status-low-ink` / `out`→`bg-status-out text-status-out-ink` ＋ `ring-1 ring-status-out-line`。未選択は `text-faint`・透明背景。
- タップで**その状態に1タップ変更**（トグルやサイクルにしない）。押下時 `active:scale-95` の微アニメ。
- 変更は即時 `router.patch(route('items.status.update', id), { status }, { preserveScroll: true })`。楽観更新可。`prefers-reduced-motion` を尊重。
- a11y: `role="group"` / 各ボタン `aria-pressed`。キーボードフォーカスリング必須。

### 5.3 買ったボタン `BuyButton`（F-2）

- コーラル塗り `bg-accent text-accent-ink`・`rounded-full`・カゴアイコン＋「買った」。`shadow`（accentの40%）。`active:scale-95`。
- `in_stock` のアイテムでは**ゴースト表示**（`bg-transparent` ＋ `ring-1.5` accent45%・`text-accent`）にして、買い足しが必要な `out`/`low` の塗りボタンを相対的に目立たせる。
- タップで `router.post(route('items.purchase.store', id), {}, { preserveScroll: true })` → 履歴記録＋status=in_stock。
- 直後に **Undoトースト**を表示（§5.6）。

### 5.4 ソート切替（F-3）

- サブバー右に `並び替え {状態順 ▾}`（`bg-surface` / `border-line-strong` / `rounded-full` / 12.5px）。
- 選択肢: **状態順（既定）** / **前回購入が古い順**。`router.get` にクエリ `?sort=` を付けて再取得（永続化不要）。

### 5.5 FAB（新規登録）

- 画面右下固定。`bg-ink text-surface`・`rounded-2xl`・＋アイコン＋「登録」。`items.create` へ遷移。

### 5.6 Undoトースト

- 画面下部に一時表示。`bg-ink text-surface`・`rounded-[14px]`。「『{品名}』を買ったに記録しました」＋右に「取り消す」（コーラル）。
- 「取り消す」で直近購入を取り消し（`docs/03` の Undo エンドポイント採用時）。
- **小さめの表示・短めの自動消滅**（2026-07-24 決定）。既存実装は `autoClose: 6000` で他のトーストより大きく主張が強かったため、`autoClose: 3000〜4000` 程度に短縮し、パディング・最小高さを控えめにした compact な見た目にする（§10.7）。
- 既存のトースト実装（`utils/toast`）と役割が重複する場合は方式を統一する。

### 5.7 登録・編集フォーム調整（F-4）

`resources/js/Pages/Items/Partials/Form.tsx` を調整（音声入力機能は Phase 11 で削除済み。§8・§10.9 参照）:

- **ステータス選択**（`StatusSegment` を再利用した3値、既定 `in_stock`）を品名の次に追加。
- **個数を任意入力化**（未入力可・ラベルを「個数（任意）」）。視覚的な優先度も下げる。
- `FormItemFields` / `FieldName` に `status` を追加。
- 「＋追加」ボタンの緑（現状 `bg-green-*`）を廃し、**中立色 or アウトライン**へ。緑はステータス専用（役割分離）に統一する。
- 保存ボタンはコーラル（`bg-accent`）へ寄せる。

### 5.8 登録画面の戻る導線（2026-07-24 追加）

- 登録完了後は `items.index`（一覧）へリダイレクトする方針に変更したため（`docs/03` §7.13）、`Items/Create.tsx` のヘッダー左上に一覧へ戻るリンクを設置する。
- アイコンは `MdArrowBack`（`react-icons/md`、§10.4）。遷移先は `items.index` 固定（ブラウザ履歴の `back()` には依存しない）。

## 6. 全画面への展開（共通トンマナ）

このセクションは Items 以外も含めた**全画面を同じトンマナに揃える**ための指示。§2–§4 のトークンを土台に、まず「骨格」と「共通部品」を整え、その後で各画面を寄せる。効かせる順序は **骨格 → 共通部品 → 画面個別**。共通部品を直せば、それを使う全画面が一斉に揃う。

### 6.1 追加トークン：危険色（danger）

削除・退会など破壊的操作用の意味色を追加する（accent＝アクション、緑＝ステータスとは別枠の意味色）。§2.1 の `:root` に追記:

```css
/* 破壊的操作（削除・退会） */
--color-danger: 202 60 60; /* #CA3C3C */
--color-danger-ink: 255 255 255;
--color-danger-soft: 249 233 233; /* #F9E9E9 */
```

ダーク（`@media (prefers-color-scheme: dark)` の `:root` 内）:

```css
--color-danger: 224 104 104; /* #E06868 */
--color-danger-ink: 40 12 12;
--color-danger-soft: 58 30 30;
```

Tailwind へ `danger` / `danger-ink` / `danger-soft` を §2.2 と同じ要領で登録する。

### 6.2 アクション→色マッピング（全画面共通の絶対ルール）

色は**見た目でなく「操作の意味」で決める**。ここが統一の肝。

| 操作の意味       | 例                             | 色 / 形                                                                 |
| ---------------- | ------------------------------ | ----------------------------------------------------------------------- |
| 主アクション     | 保存・登録・作成・送信・買った | コーラル塗り `bg-accent text-accent-ink rounded-full`                   |
| 副アクション     | キャンセル・戻る・スキップ     | 中立アウトライン `bg-surface border border-line-strong text-ink`        |
| 破壊的アクション | 削除・退会・グループ削除       | danger `bg-danger text-danger-ink`（または `text-danger` アウトライン） |
| 補助追加         | ＋ジャンル追加・＋保管場所追加 | ゴースト/中立 `text-accent` or `border-line-strong`（**緑は禁止**）     |
| ブランド固定     | LINEログイン                   | `LINE01`（例外的に既存維持）                                            |

**要修正の現状**: 保存＝緑・追加＝緑・キャンセル＝赤・Primary＝青。→ 上表へ統一する。とくに「キャンセルは danger（赤）ではない」「追加の緑は廃止（緑はステータス専用）」。

### 6.3 共通ボタンの統廃合

ボタンが乱立している（`PrimaryButton` / `SecondaryButton` / `DangerButton` / `Button` ＋ `Buttons/{Save,Add,Cancel}`）。**単一の `Button`（variant制）へ集約**する。

- `Button` の variant を再定義: `primary`(コーラル) / `neutral`(アウトライン) / `danger`(朱) / `ghost`。`warning`/`success`（黄/緑）は**廃止**。サイズ `sm|md|lg` は維持。全色を直値（`bg-blue-600` 等）からトークン参照へ置換。
- ラッパーの意味を正す: `SaveButton`→`primary`、`CancelButton`→`neutral`（赤をやめる）、`AddButton`→`ghost`/`neutral`（緑をやめる）。
- `PrimaryButton` / `SecondaryButton` / `DangerButton` は段階的に `Button` へ寄せる（当面は中身のトークン化で見た目だけ先に揃えてもよい）。
- 幅は用途で使い分け（フォーム送信は全幅、一覧内アクションは自動幅）。フォーカスリングは `focus:ring-accent`（danger は `ring-danger`）。

### 6.4 共通レイアウト（骨格）

**AuthenticatedLayout**（`resources/js/Layouts/AuthenticatedLayout.tsx`）

- 背景 `bg-gray-100 dark:bg-gray-900` → `bg-paper`。
- ナビ／ヘッダー `bg-white dark:bg-gray-800` → `bg-surface`、境界 `border-line`。
- アクティブ `NavLink` の下線・強調を `accent` に（現状 indigo/blue）。
- ドロップダウン起点ボタン・アバターもトークン化。グループ未所属の強制モーダルは §6.6 の Modal 規定に従う（ボタンは §6.2 準拠）。

**GuestLayout**（`resources/js/Layouts/GuestLayout.tsx`）

- 背景 `bg-gray-50 dark:bg-gray-900` → `bg-paper`。
- カード `bg-white dark:bg-gray-800 rounded-md shadow-lg` → `bg-surface rounded-[20px] shadow-card border border-line`。`max-w-sm` は維持。

### 6.5 共通入力・フォーム部品

`TextInput` / `TextArea` / `SelectInput` / `Checkbox` / `InputLabel` / `InputError`:

- 枠 `border-line`、面 `bg-surface`、文字 `text-ink`、プレースホルダ `text-faint`。
- フォーカスは **accent リング**（`focus:border-accent focus:ring-accent`。現状の blue を置換）。
- `InputLabel` → `text-ink`(700)、`InputError` → `text-danger`。
- フィールド角丸は `rounded-lg`（8–10px）で統一（カードの 20px とは別スケール）。
- `@tailwindcss/forms` は維持。

### 6.6 Modal / Dropdown / Divider / Toast

- **Modal**（`Components/Modal.tsx`）: パネル `bg-surface`・`rounded-[20px]`・`border-line`。オーバーレイ `bg-ink/40`。ボタンは §6.2 準拠（削除確認＝danger、キャンセル＝neutral）。
- **Dropdown**（`Components/Dropdown.tsx`）: メニュー面 `bg-surface border-line rounded-xl shadow-card`、項目 hover `bg-surface-2`、文字 `text-ink`。
- **Divider**: `border-line`。
- **Toast**（`utils/toast`）: 成功＝status-in 寄り or 中立、エラー＝danger、通常記録＝ink 面。§5.6 の Undo と整合させる。

### 6.7 画面別の適用方針

| 画面                                                        | 方針                                                                                                                                                               |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Auth**（Login/Register/Forgot/Reset/Confirm/VerifyEmail） | GuestLayout のトークン化で大半が自動で揃う。主ボタン＝コーラル、リンクは `text-accent`（現 `LINK*` 青を置換 or 温かい ink 下線）。**LINEログインは LINE01 維持**。 |
| **Welcome**                                                 | ブランドの入口。paper 背景・ink 見出し・コーラル CTA。巨大ヒーローは作らず簡潔に。                                                                                 |
| **Dashboard**                                               | 現状「You're logged in!」のプレースホルダ。MVP は `/`→`items.index` に流れるため**基本は未使用**。残すなら簡素なホームとしてトークン化、使わないなら削除を検討。   |
| **Group**（Create/Edit＋partials）                          | フォームは surface パネル＋accent 主ボタン。`DeleteGroupForm`＝danger、`LeaveGroupForm`＝danger or neutral、`UpdateGroupForm`＝primary。                           |
| **Profile**（Edit＋partials）                               | 各フォームを surface セクション化。保存＝primary、`DeleteUserForm`＝danger、パスワード系＝primary。見出し・区切りをトークン化。                                    |

### 6.8 追加の変更対象ファイル（§7 の Items 分に加えて）

| ファイル                                                                                              | 変更                                                  |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `resources/js/Layouts/AuthenticatedLayout.tsx`                                                        | 背景/ナビ/ヘッダー/アクティブ色をトークン化           |
| `resources/js/Layouts/GuestLayout.tsx`                                                                | paper/surface/角丸/影をトークン化                     |
| `resources/js/Components/Button.tsx`                                                                  | variant 再定義（primary/neutral/danger/ghost）        |
| `resources/js/Components/Buttons/{Save,Add,Cancel}Button.tsx`                                         | variant を役割に合わせ修正（緑/赤の誤用是正）         |
| `resources/js/Components/{PrimaryButton,SecondaryButton,DangerButton}.tsx`                            | トークン化 or `Button` へ集約                         |
| `resources/js/Components/{TextInput,TextArea,SelectInput,Checkbox,InputLabel,InputError,Divider}.tsx` | 枠/面/フォーカス/エラー色をトークン化                 |
| `resources/js/Components/{Modal,Dropdown}.tsx`                                                        | パネル/オーバーレイ/項目をトークン化                  |
| `resources/js/Pages/Auth/*`                                                                           | GuestLayout 継承で概ね自動。個別リンク/ボタン色を確認 |
| `resources/js/Pages/{Group,Profile}/**`                                                               | 主/副/破壊ボタンの色を §6.2 に統一                    |
| `resources/js/Pages/Welcome.tsx` / `Dashboard.tsx`                                                    | トークン化（Dashboard は要否判断）                    |
| `resources/js/utils/toast.*`                                                                          | 種別ごとの色をトークンに整合                          |

### 6.9 展開の推奨順序

1. §2 トークン＋§6.1 danger を導入（土台）
2. §6.3 ボタン集約 → §6.5 入力 → §6.6 Modal/Dropdown（共通部品）
3. §6.4 レイアウト2種
4. Items（§5）→ Auth → Group → Profile → Welcome/Dashboard（画面個別）
5. 全画面でライト/ダーク・主要導線を目視確認

各ステップは独立してレビュー可能な粒度でコミットを分ける。

## 7. 変更対象ファイル

| ファイル                                         | 変更                                                           |
| ------------------------------------------------ | -------------------------------------------------------------- |
| `tailwind.config.js`                             | `colors`（トークン）・`fontFamily.sans`・`boxShadow.card` 追加 |
| `resources/css/app.css`                          | `:root` トークン定義＋ダークの上書き                           |
| `resources/js/Pages/Items/Index.tsx`             | テーブル廃止→`ItemCard` のカード一覧へ全面刷新・ソート・空状態 |
| `resources/js/Components/StatusSegment.tsx`      | 新規                                                           |
| `resources/js/Components/BuyButton.tsx`          | 新規                                                           |
| `resources/js/Pages/Items/Partials/ItemCard.tsx` | 新規                                                           |
| `resources/js/Pages/Items/Partials/Form.tsx`     | status追加・個数任意化・＋追加ボタン中立化                     |
| `resources/js/Pages/Items/Create.tsx`            | ヘッダーに戻る導線を追加（§5.8）                               |
| `resources/js/utils/toast.tsx`                   | `showBuyUndoToast` のサイズ・自動消滅時間を調整（§5.6,§10.7）  |

## 8. 実装時の遵守事項

- **モバイルファースト。** 基準幅はスマホ（〜390px）。PC は中央寄せ・最大幅で同じカードを流用（旧テーブルは復活させない）。
- **横スクロールを本文に出さない。** 幅広要素は各自の `overflow-x-auto` に閉じる。
- **ダーク両対応。** トークン経由で必ず両テーマ成立を確認。
- **色の役割を越えない。** 緑＝ステータス、コーラル＝アクション、danger＝破壊的操作のみ。緑をボタンに、コーラルを状態に使わない（§6.2）。
- **アクセシビリティ。** フォーカスリング・`aria-pressed`・`prefers-reduced-motion` 尊重・コントラスト確保。
- **デグレ禁止。** グループ機能の挙動を壊さない（`docs/02` §5）。音声入力機能は Phase 11 で削除済み。

## 9. やらないこと

- webフォントのCDN読み込み（同一オリジン制約・表示遅延のため）
- ステータスを信号色（緑/黄/赤）で塗り分ける多色化（本方針は緑の単色濃淡で統一）
- 旧テーブル型一覧の併存
- 賞味期限・数量増減UIなどスコープ外要素の追加（`docs/02` §6）

## 10. 実装詳細（フロント・データ連携）

「ドキュメントだけで迷わず実装する」ための具体仕様。バックエンドの props 形は `docs/03` §7.12 と対応。

### 10.1 ステータス定数（`resources/js/constants/itemStatus.ts` 新規・単一の真実）

```ts
export type ItemStatusValue = 'in_stock' | 'low' | 'out';

export const ITEM_STATUS: { value: ItemStatusValue; label: string }[] = [
  { value: 'in_stock', label: 'ある' },
  { value: 'low', label: '少ない' },
  { value: 'out', label: 'ない' },
];

// セグメント選択中のスタイル（未選択は text-faint・透明背景）
export const STATUS_ACTIVE_CLASS: Record<ItemStatusValue, string> = {
  in_stock: 'bg-status-in text-status-in-ink',
  low: 'bg-status-low text-status-low-ink',
  out: 'bg-status-out text-status-out-ink ring-1 ring-status-out-line',
};
```

### 10.2 Item 型（`Items/Index.tsx`）

```ts
interface Item {
  id: number;
  name: string;
  status: ItemStatusValue;
  quantity: number | null;
  days_since_purchase: number | null; // null = 購入記録なし
  last_purchased_at: string | null;
  genre?: { id: number; name: string } | null;
  place?: { id: number; name: string } | null;
}
// ページ props: { items: Item[]; sort: "status" | "purchased" }
```

### 10.3 表示ロジック（確定ルール）

- **前回購入**: `days_since_purchase` を「今日 / {n}日前 / 購入記録なし」で表示。

```ts
const lastBuyText = (d: number | null) =>
  d === null ? '購入記録なし' : d === 0 ? '今日' : `${d}日前`;
```

- **個数**: `quantity` が `null` は**チップ非表示**。数値のみ「残り {quantity}」（単位なし）。定性表記はしない（モックの「少/十分/約2kg」は演出であり実データは整数）。
- **買い足しの一言**: `status` が `out` / `low` のとき、前回購入の末尾に `・ そろそろ買い足し`（`text-accent`/700）を付す。
- **登録直後の表示**（2026-07-24 追記）: 登録時に購入履歴が自動作成される（`docs/03` §7.14）ため、登録直後のアイテムは `days_since_purchase = 0` となり「前回購入 今日」と表示される。「購入記録なし」分岐は将来的な履歴削除経路のための防御的な表示として残るが、通常の登録フローでは到達しない。

### 10.4 アイコン（`react-icons` v5 を使用・CDN不可）

| 用途             | アイコン（import 元）                       |
| ---------------- | ------------------------------------------- |
| 前回購入（時計） | `MdOutlineAccessTime`（`react-icons/md`）   |
| 買った（カゴ）   | `MdOutlineShoppingCart`（`react-icons/md`） |
| 登録FAB / ＋追加 | `MdAdd`（`react-icons/md`）                 |
| ソートの▾        | `MdKeyboardArrowDown`（`react-icons/md`）   |
| 登録画面の戻る   | `MdArrowBack`（`react-icons/md`）           |

### 10.5 コンポーネント インターフェース

```ts
interface StatusSegmentProps {
  value: ItemStatusValue;
  onChange: (next: ItemStatusValue) => void; // その値へ1タップ変更（トグル/サイクルにしない）
  disabled?: boolean;
}
interface BuyButtonProps {
  onBuy: () => void;
  ghost?: boolean; // in_stock のとき true でアウトライン化
  disabled?: boolean;
}
interface ItemCardProps {
  item: Item;
}
```

`StatusSegment` は `ITEM_STATUS` を map。選択中は `STATUS_ACTIVE_CLASS[value]`、未選択は `text-faint bg-transparent`。各ボタン `aria-pressed`、`role="group"`。

### 10.6 サーバ通信（Inertia `router`）

```ts
// 編集画面への遷移（品名タップ。§5.1）
<Link href={route('items.edit', item.id)}>{item.name}</Link>

// ステータス変更（F-1）
router.patch(
  route('items.status.update', item.id),
  { status: next },
  { preserveScroll: true },
);

// 買った（F-2）→ 記録後に Undo トースト
const prev = item.status; // 押下前ステータスを保持
router.post(
  route('items.purchase.store', item.id),
  {},
  {
    preserveScroll: true,
    onSuccess: () =>
      showBuyUndoToast(item, () =>
        router.delete(route('items.purchase.destroy', item.id), {
          data: { previous_status: prev },
          preserveScroll: true,
        }),
      ),
  },
);

// 並び替え（F-3）
router.get(
  route('items.index'),
  { sort },
  { preserveScroll: true, preserveState: true },
);
```

`preserveScroll` で一覧位置を保ち、redirect back により props が最新化される。楽観更新は任意（実装時は失敗で元に戻す）。`prefers-reduced-motion` を尊重。

### 10.7 Undo トースト（`react-toastify` v11 ／ `utils/toast.tsx` に1関数追加）

既存 `showSuccessToast/showErrorToast` と同じ `toast()` を使い、アクション付きトーストを追加:

```tsx
export const showBuyUndoToast = (item: { name: string }, onUndo: () => void) =>
  toast(
    ({ closeToast }) => (
      <div className="flex items-center justify-between gap-2 text-sm">
        <span>「{item.name}」を買ったに記録しました</span>
        <button
          className="font-bold text-accent"
          onClick={() => {
            onUndo();
            closeToast?.();
          }}
        >
          取り消す
        </button>
      </div>
    ),
    {
      autoClose: 3500, // 2026-07-24 変更: 6000 → 3500（主張が強すぎるとの指摘のため短縮）
      position: 'bottom-center',
      className: '!min-h-0 !py-2 !px-3', // 2026-07-24 追加: 他トーストより小さめのコンパクト表示
    },
  );
```

トーストの見た目は `bg-ink / text-surface` に寄せる（`toastClassName` か CSS で上書き。既存 `defaultOptions` は踏襲）。`className` によるサイズ調整はこの Undo トーストのみに適用し、`showSuccessToast`/`showErrorToast` の見た目には影響させない。

### 10.8 一覧レイアウト・空状態・ソート

- **PC/タブレット**: モバイルと同一カードを **1カラム・中央寄せ・`max-w-xl`（〜640px）** で表示。旧テーブルは復活させない。
- **空状態**: `bg-surface` カードに「登録されたアイテムはありません。」＋コーラルの「アイテムを登録する」導線（§6.2 主アクション）。
- **ソートUI**: サブバー右の切替（既定=状態順）。現在値は `sort` prop を表示。

### 10.9 Form（登録・編集）詳細（§5.7 の補足）

- `status` 初期値: 新規=`"in_stock"`、編集=既存値。`StatusSegment` を流用し `FieldName` に `"status"` を追加。
- `quantity`: `value={data.quantity ?? ""}`、未入力は送信時 `null`。ラベルは「個数（任意）」。
- 音声入力機能は Phase 11 で削除済み（`docs/02` §5、`docs/05` Phase 11）。status はユーザー操作のみで変更する。

---

参考: 確定ビジュアルはモック v1。実装は本書のトークン・コンポーネント仕様に厳密に従い、差分が出たら本書を更新してから実装を進める。
