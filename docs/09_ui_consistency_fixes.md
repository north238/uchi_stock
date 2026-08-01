# UchiStock UI 一貫性・不具合修正 指示書（Phase 12）

作成日: 2026-08-01
対象読者: 実装担当（Claude Code）およびレビュアー（開発者本人）
上位文書: `docs/04_frontend_design_guide.md`（デザイン規定）／ `docs/02_requirements.md`（変更禁止事項）
関連: `docs/08_genre_color_removal.md`（Phase 13。**本書の §6-2 は Phase 13 の完了に依存する**）

Phase 1（ソロ実運用検証）の中で発見された UI の不整合・不具合 5 件を修正する。
本書は既存のデザイン方針（`docs/04`）を変更するものではなく、**方針からズレている実装を方針に寄せる**ためのもの。

---

## 0. 前提と制約

- `docs/02` §5 の変更禁止事項は引き続き有効。**認証・グループ機能・Docker 構成・ジャンル/保管場所管理のロジックには手を入れない**。
  - §5 のナビゲーションリンク追加は「グループ機能そのもの」ではなく画面遷移導線の追加であるため対象外と判断する。`GroupController` 等のバックエンドには一切触れないこと。
- ドキュメントファースト: 本書で新規に規定する事項（§1 のページヘッダー方式、§2 のページコンテナ）は、実装後に `docs/04` へ反映する（§6 参照）。
- 「ついでの改善」は禁止。本書に列挙した変更以外の差分を出さないこと。

---

## 1. 保存ボタンに到達できない不具合（最優先）

### 症状

ブラウザ（PC）でアイテムの登録・編集画面を開くと、スクロールしても画面下部の「保存」ボタンが表示されず、押せない。スマートフォンでは再現しない。

### 原因

`resources/js/Layouts/AuthenticatedLayout.tsx` のルート要素が高さを `h-screen`（`height: 100vh`）で固定し、スクロールを `main` の内部スクロールコンテナに一任している。

```tsx
<div className="flex flex-col h-screen bg-paper">
  <nav>...</nav>
  <main className="flex-1 overflow-y-auto">{children}</main>
</div>
```

この構造ではドキュメント自身がスクロールしないため、`main` の内部スクロールが期待どおり働かない条件下で、下端のコンテンツに到達する手段が完全に失われる。Laravel Breeze の標準レイアウトは `min-h-screen`（ドキュメントスクロール）であり、この改変が不具合の直接原因。

### 修正

ドキュメントスクロールに戻す。

- ルート: `flex flex-col h-screen bg-paper` → `flex flex-col min-h-screen bg-paper`
- `main`: `flex-1 overflow-y-auto` → `flex-1`

`overflow-y-auto` は削除する（残すと min-height 解決の挙動が変わり、同種の問題が再発しうる）。

**ナビゲーションバーは固定する**（2026-08-01 決定）。ドキュメントスクロールに変えるとナビが一緒に流れてしまうため、`<nav>` に `sticky top-0 z-30` を付与して従来の見え方を保つ。FAB の `z-40` より下、`Modal` のオーバーレイより下になるよう `z-30` とすること。

### 検証

- PC ブラウザで `items.create` / `items.edit` を開き、保存ボタンまでスクロールして押下できること。
- ウィンドウ高さを 500px 程度まで縮めても到達できること。
- スマートフォン実機で一覧・登録・編集・プロフィール・グループ設定がいずれも従来どおりスクロールできること（デグレ確認）。
- 全画面でスクロール中もナビが上部に留まり、FAB・モーダル・トーストと重なり順が破綻しないこと。

---

## 2. ページヘッダーの統一

### 現状

`AuthenticatedLayout` の `header` prop を使う画面と、使わずに本文内へ見出しを置く画面が混在している。

| 画面                                                   | 現状                                                                                                             |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `Items/Index.tsx`                                      | `header` 未使用。本文内に `<h1 className="text-xl font-bold text-ink">ストック一覧</h1>`                         |
| `Items/Create.tsx`                                     | `header` 未使用。本文先頭に「戻る」リンクのみでタイトルなし                                                      |
| `Items/Edit.tsx`                                       | 「戻る」リンクは対応済み。タイトルなし                                                                           |
| `Group/Create.tsx` `Group/Edit.tsx` `Profile/Edit.tsx` | `header` prop 使用。`bg-surface shadow` の帯（`max-w-7xl mx-auto py-6 px-4`）が出る                              |
| `Dashboard.tsx`                                        | `header` prop 使用。MVP では未使用のプレースホルダだが、`header` prop 廃止に伴い型エラーになるため必ず追随させる |

`header` prop 方式は `max-w-7xl` の帯であり、Items 側の `max-w-xl` と横幅の基準も食い違っている。

### 方針

**`header` prop 方式を廃止し、本文先頭にタイトル行を置く方式へ全画面を統一する。**

理由: モバイルファースト（`docs/04` §8）では、`bg-surface shadow` の帯が縦方向を占有して 1 画面の情報密度を下げる。主役である Items 一覧が既に本文内見出し方式であり、そちらに寄せるほうが変更範囲も小さい。

### 修正

1. `AuthenticatedLayout.tsx` から `header` prop とその描画ブロックを削除する。

   ```tsx
   {
     header && (
       <header className="bg-surface shadow">
         <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
           {header}
         </div>
       </header>
     );
   }
   ```

   併せて型定義から `header?: ReactNode` を削除し、未使用になる `ReactNode` の import も整理する。

2. `header` を渡していた各画面（`Group/Create.tsx`・`Group/Edit.tsx`・`Profile/Edit.tsx`・`Dashboard.tsx`）から `header={...}` を削除し、本文コンテナ先頭に §3 の `PageHeading` を置く。

3. `Items/Create.tsx` / `Items/Edit.tsx` にもタイトル行を追加する（現状は「戻る」リンクのみでページ名が分からない）。「戻る」リンク自体は両画面とも対応済みのため新規追加は不要。

4. `Dashboard.tsx` は MVP の導線上ほぼ到達しないが、`header` prop 廃止で型エラーになるため必ず追随させる。**この画面の存廃判断は本書のスコープ外**とし、`docs/05` のバックログに残したまま、`PageContainer` + `PageHeading` へ機械的に移行するだけに留めること。

5. `Welcome.tsx` は `GuestLayout` 系のゲスト画面で `AuthenticatedLayout` を使っていない。`PageContainer` / `PageHeading` の適用対象外だが、独自の最大幅指定（`max-w-7xl` 等）が残っている場合は §3-0 の `max-w-page` に揃えること。Auth 6画面も同様に `GuestLayout`（`max-w-sm`）配下のため、今回は変更しない。

### タイトル文言

| 画面           | タイトル     |
| -------------- | ------------ |
| `Items/Index`  | ストック一覧 |
| `Items/Create` | ストック登録 |
| `Items/Edit`   | ストック編集 |
| `Group/Create` | グループ作成 |
| `Group/Edit`   | グループ設定 |
| `Profile/Edit` | プロフィール |

`Group/Create.tsx` は現状ページヘッダーとパネル内 `<header>` で「グループ作成」が二重表示になっている。パネル内の `<h2>` は削除し、説明文（`<p>`）のみ残すこと。

---

## 3. パディングの統一（ストック一覧に合わせる）

### 現状の不整合

```
Items/Index.tsx    : mx-auto max-w-xl px-4 py-6 sm:px-6 lg:px-8
Items/Create.tsx   : mx-auto max-w-xl px-4 pt-6 sm:px-6 lg:px-8  ＋ Form 側で py-6（二重）
Group/Edit.tsx     : py-12 → max-w-2xl mx-auto sm:px-6 lg:px-8   （モバイルで左右パディング 0）
Profile/Edit.tsx   : py-12 → max-w-2xl mx-auto sm:px-6 lg:px-8   （同上）
Group/Create.tsx   : py-12 → bg-surface max-w-xl mx-auto sm:py-6 lg:py:8 sm:px-6 lg:px-8
```

さらに**クラス競合**がある。`Items/Partials/Form.tsx` のパネル:

```tsx
<div className="p-4 sm:p-8 bg-surface max-w-xl mx-auto sm:py-6 lg:py-8 sm:px-6 lg:px-8 shadow-card sm:rounded-[20px]">
```

Tailwind の生成順は `p-*` → `px-*` → `py-*` のため、`sm` 以上では後勝ちで `sm:py-6` / `sm:px-6` が適用され、**`sm:p-8` は一切効いていない**。`Group/Create.tsx` にも同じ競合クラス列がある。加えて `Group/Create.tsx` の `lg:py:8` はタイポで無効なクラス。

### 修正

#### 3-0. 幅トークンの新設とナビ幅の統一

本文幅は **576px（`max-w-xl` 相当）** に統一する（2026-08-01 決定）。1000px 級の 1 カラムは、カード内で品名と「買った」ボタンが左右に離れて視線移動が増え、`docs/02` §7 の「3秒で判断」に反するため採らない。カードの 2 カラム化（`lg` 以上）は将来の選択肢として残すが、**本フェーズではスコープ外**とする。

幅の値をナビとページコンテナの 2 箇所に直書きすると将来ズレるため、`tailwind.config.js` の `theme.extend` にトークンを追加し、両方から参照する。

```js
maxWidth: {
  page: '36rem', // 576px。本文とナビの共通幅
},
```

`AuthenticatedLayout.tsx` のナビ内側コンテナの最大幅を `max-w-7xl` → `max-w-page` に変更する。現状は本文 576px に対してナビが 1280px あり、PC でロゴとアバターだけが左右に離れて浮くため。左右パディング（`px-4 sm:px-6 lg:px-8`）は本文と同じ値を維持すること。

モバイルメニュー（`sm:hidden` の展開領域）は現状フル幅で表示されている。ナビ内側の幅変更に追随して同じ `max-w-page` 内に収まるようにし、開閉時に横位置がズレないことを目視確認する。

#### 3-1. 共通ページコンテナを新設

`resources/js/Components/PageContainer.tsx` を新規作成し、ストック一覧の値を正とする。

```tsx
import { PropsWithChildren } from 'react';

export default function PageContainer({
  className = '',
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={`mx-auto max-w-page px-4 py-6 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}
```

- 最大幅は §3-0 の `max-w-page` に統一する（`Group/Edit` `Profile/Edit` の `max-w-2xl` も寄せる）。
- 縦余白は `py-6` に統一する（`py-12` は廃止）。`Group/Edit` `Profile/Edit` は上下 24px ずつ詰まるが想定内。

#### 3-2. 見出しコンポーネントを新設

§2 と合わせて `resources/js/Components/PageHeading.tsx` を新規作成する。

```tsx
export default function PageHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return <h1 className="text-xl font-bold text-ink">{children}</h1>;
}
```

`Items/Index.tsx` の既存 `<h1 className="text-xl font-bold text-ink">` をこれに置き換え、他画面でも同一のものを使う。

#### 3-3. 各画面を `PageContainer` へ移行

- `Items/Index.tsx`: 外側 div を `PageContainer` に置換（クラス値は変わらない）。
- `Items/Create.tsx` / `Items/Edit.tsx`: ページ側の外側 div を `PageContainer` にし、`Form.tsx` 側の外側 `<div className="py-6">` は**削除**する（縦余白の二重を解消）。`Form.tsx` はパネル要素のみを返す形にし、`max-w-xl mx-auto` もページコンテナ側に責務を移す。
- `Group/Create.tsx` / `Group/Edit.tsx` / `Profile/Edit.tsx`: `py-12` の外側 div と `max-w-2xl mx-auto sm:px-6 lg:px-8` を `PageContainer` に置換。
- `Dashboard.tsx`: 同様に `PageContainer` へ置換（§2-4 のとおり機械的な移行に留める）。

#### 3-4. パネルのパディングを統一

カード/パネル要素は **`p-4 sm:p-8` のみ**とし、競合する `sm:py-6 lg:py-8 sm:px-6 lg:px-8` は全て削除する。対象:

- `Items/Partials/Form.tsx`
- `Group/Create.tsx`
- （`Group/Edit.tsx` `Profile/Edit.tsx` は既に `p-4 sm:p-8` のみ。変更不要）

角丸・影は既存どおり `shadow-card sm:rounded-[20px]` を維持する。

---

## 4. FAB と「買った」ボタンの重なり

### 症状

ストック一覧で、右下固定の FAB（`fixed bottom-6 right-6`）が、最終カードの「買った」ボタン（カード右端配置）と重なって押せない。

### 修正

`Items/Index.tsx` のリストコンテナに下部余白を追加する。FAB の高さ（`py-3` + テキスト ≒ 44px）＋ `bottom-6`（24px）＋ 余裕を見て `pb-24` とする。

- `PageContainer` に `className="pb-24"` を渡す形にする（`py-6` の `padding-bottom` を上書き）。
- FAB 側の `bottom-6 right-6` および `z-40` は変更しない。
- 空状態カードのときは FAB と重なる要素がないが、余白があっても実害はないため分岐は設けない。

### 検証

アイテムを 10 件程度登録し、最下部までスクロールして最終カードの「買った」ボタンが FAB と重ならず押下できること。

---

## 5. ハンバーガーメニューにグループ編集がない

### 現状

`AuthenticatedLayout.tsx` のデスクトップ用 `Dropdown` には、グループ所属有無での出し分けがある。

```tsx
{
  user.group_id ? (
    <Dropdown.Link href={route('groups.edit', user.group_id)}>
      グループ編集
    </Dropdown.Link>
  ) : (
    <Dropdown.Link href={route('groups.create')}>グループ作成</Dropdown.Link>
  );
}
```

一方、モバイル用メニュー（`showingNavigationDropdown` で開く領域）は「プロフィール」「ログアウト」のみで、上記の分岐が実装されていない。モバイル主体のアプリでグループ設定に到達できない状態。

### 修正

モバイルメニューのユーザーセクションに、デスクトップと同一の分岐を `ResponsiveNavLink` で追加する。表示順はデスクトップと揃え、**プロフィール → グループ編集/グループ作成 → ログアウト** とする。

```tsx
<div className="mt-3 space-y-1">
  <ResponsiveNavLink href={route('profile.edit')}>
    プロフィール
  </ResponsiveNavLink>
  {user.group_id ? (
    <ResponsiveNavLink href={route('groups.edit', user.group_id)}>
      グループ編集
    </ResponsiveNavLink>
  ) : (
    <ResponsiveNavLink href={route('groups.create')}>
      グループ作成
    </ResponsiveNavLink>
  )}
  <ResponsiveNavLink method="post" href={route('logout')} as="button">
    ログアウト
  </ResponsiveNavLink>
</div>
```

**バックエンド（ルート・コントローラ・グループ機能のロジック）には一切変更を加えないこと。**

### 検証

- グループ所属ユーザーでハンバーガーを開き「グループ編集」から `groups.edit` に遷移できること。
- グループ未所属ユーザーで「グループ作成」が表示されること（シーダーの `test@example.com` はグループ所属のため、未所属ケースは DB を直接編集するか別ユーザーで確認）。

---

## 6. 「＋追加」ボタンのレイアウト崩れと追加後の自動選択

### 6-1. レイアウト崩れの解消

#### 症状

登録・編集画面の「ジャンル（任意）」「保管場所（任意）」の右にある `＋追加` ボタンが、スマートフォン幅で折り返して 2 行になり、セレクトと高さが揃わない。

#### 原因

`resources/js/Pages/Items/Partials/SelectableWithAdd.tsx` でボタンの幅を 80px に固定している。

```tsx
<div className="flex gap-2 items-center mt-1">
  <div className="flex-grow"><SelectInput ... /></div>
  <div className="flex-shrink-0 w-20"><AddButton ... /></div>
</div>
```

`AddButton` は `Button`（`px-4` / `text-base` / `w-full`）を使うため、80px から左右パディング 32px を引いた 48px しか文字に使えず、「＋追加」が収まらず折り返す。画面が狭いほどセレクト側も縮むため、スマートフォンで顕在化する。

#### 修正

**ラベル行に逃がす**（2026-08-01 決定）。横並びをやめ、入力行はセレクトの全幅にする。

- ラベルと `＋ 追加` を `flex items-center justify-between` の 1 行に置き、その下にセレクトを `w-full` で配置する。
- `＋ 追加` はテキストボタン（`text-accent` / `text-sm` / `font-bold`）とし、`docs/04` §6.2 の「補助追加＝ゴースト/中立、緑は禁止」に従う。
- タップ領域を確保するため `px-2 py-2` 以上を確保し、最小 44px 四方を満たすこと。`whitespace-nowrap` を付け、いかなる幅でも折り返さないようにする。
- `w-20` の固定幅ラッパーは削除する。`AddButton` の `w-full` に依存した現在の構造も併せて解消すること。
- `disabled` 時は `opacity-50 cursor-not-allowed`（`Button` と同じ扱い）とする。

`AddButton`（`Components/Buttons/AddButton.tsx`）自体は他所で使われている可能性があるため、**このコンポーネントは変更せず**、`SelectableWithAdd` 側で直接ボタンを組むか、用途に合った表示にすること。他所での使用有無を `grep` で確認し、`SelectableWithAdd` 専用と分かった場合に限り `AddButton` を整理してよい。

#### 検証

- 幅 320px（iPhone SE 相当）まで縮めても `＋ 追加` が 1 行に収まり、セレクトが全幅で表示されること。
- ラベル・セレクト・エラー表示の縦位置が他のフィールド（品名・個数）と揃っていること。
- キーボードフォーカスリングが見えること。

### 6-2. 追加直後の自動選択

#### 現状

モーダルからジャンル/保管場所を追加しても、セレクトは未選択のままで、ユーザーが改めて選び直す必要がある。

```tsx
const handleAddGenre = async (genreName: string) => {
  await addGenre(genreName);
  await reloadGenres();
  setIsGenreModalOpen(false);
  showSuccessToast('ジャンルを追加しました');
};
```

追加したレコードの ID がフロントに返らないため、どれを選べばよいか判断できない。

#### 前提

**この対応は `Phase 13`（ジャンルの Color 切り離しと API 整理）で `Api/GenreController::store()` がレコードを返すようになることに依存する。** Phase 13 を先に完了させること。Phase 13 完了後、`POST /api/genres` は次の形を返す。

```json
{
  "status": "success",
  "message": "ジャンルを登録しました",
  "data": { "id": 12, "name": "掃除用品" }
}
```

#### 修正

`resources/js/Pages/Items/Partials/Form.tsx` の `handleAddGenre` / `handleAddPlace` で、返却された ID を選択状態に反映する。

```tsx
const handleAddGenre = async (genreName: string) => {
  try {
    const res = await addGenre(genreName);
    await reloadGenres(); // 先にオプションを更新する
    if (res?.data?.id) {
      setData('genre_id', String(res.data.id));
    }
    setIsGenreModalOpen(false);
    showSuccessToast('ジャンルを追加しました');
  } catch (error) {
    console.error(error);
    showErrorToast('ジャンルの追加に失敗しました');
  }
};
```

- **順序が重要**: `reloadGenres()` の完了後に `setData` すること。オプション配列に該当 ID が存在しない状態で値をセットすると、セレクトが空表示になる。
- `data.genre_id` は型上 `number | null` だが、既存の `handleGenreChange` が `e.target.value`（文字列）をセットしており、オプションの `value` も `String(g.id)` である。**既存の挙動に合わせて文字列でセットする**こと。この型不整合自体は既存のもので、本フェーズでは修正しない（`docs/05` のバックログに記録する）。
- `data` が返らなかった場合（旧レスポンス形状・エラー時）は選択を変更せず、従来どおりの挙動にフォールバックすること。
- `optionsApi.ts` の `addGenre` / `addPlace` に戻り値の型を付ける。

```ts
type AddOptionResponse = {
  status: string;
  message: string;
  data: { id: number; name: string } | null;
};
```

#### 検証

- ジャンルを追加すると、モーダルを閉じた直後にセレクトが追加したジャンルを選択した状態になっていること。
- そのまま保存すると、当該ジャンルが紐づいたアイテムが登録されること。
- 保管場所でも同様に動くこと。
- 追加に失敗したとき（API 500）はエラートーストが出て、セレクトの選択が変わらないこと。

---

## 7. ドキュメント更新（実装後に必須）

コード変更後、以下を `docs/04_frontend_design_guide.md` に反映する。

- **§2.2 トークン**: `tailwind.config.js` の `maxWidth.page`（36rem / 576px）を追記し、本文幅とナビ幅の単一の真実であることを明記。
- **§6.4 共通レイアウト**: `AuthenticatedLayout` は `min-h-screen` によるドキュメントスクロールとする旨を明記し、`h-screen` + `main` 内部スクロールを禁止事項として追記（§1 の再発防止）。ナビは `sticky top-0 z-30`、ナビ内側は `max-w-page` であることも記載する。
- **新規 §6.10 ページ骨格**: `header` prop 方式は廃止し、全画面が `PageContainer`（`mx-auto max-w-page px-4 py-6 sm:px-6 lg:px-8`）＋ `PageHeading` で始まることを規定。パネルのパディングは `p-4 sm:p-8` のみとし、`p-*` と `px-*`/`py-*` を同一要素に併記しないことを明記。1000px 級の 1 カラムを採らない理由と、2 カラム化を将来の選択肢として保留した旨も残す。
- **z-index の対応表**: ナビ 30 / FAB 40 / モーダル・トーストはそれ以上、という並びを記載する（現状どこにも明文化がなく、今後の追加要素で衝突しうるため）。
- **§5.7 登録・編集フォーム調整**: 「＋追加」はセレクト横ではなくラベル行に置く旨（§6-1）と、追加直後に当該オプションを自動選択する旨（§6-2）を追記する。
- **§5.5 FAB**: 一覧コンテナに `pb-24` を確保する旨を追記。
- **§7 変更対象ファイル**: `Components/PageContainer.tsx` `Components/PageHeading.tsx` を追加。

`docs/05_implementation_todo.md` に Phase 12 として本書のチェックリストを追加し、完了時に実施内容を追記する。

---

## 8. 変更対象ファイル一覧

| ファイル                                                  | 変更内容                                                                                                                                                  | 該当節         |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `resources/js/Layouts/AuthenticatedLayout.tsx`            | `min-h-screen` 化・`overflow-y-auto` 削除・nav を `sticky top-0 z-30`／ナビ内側を `max-w-page` に／`header` prop 削除／モバイルメニューにグループ導線追加 | §1, §2, §3, §5 |
| `tailwind.config.js`                                      | `maxWidth.page: '36rem'` を追加                                                                                                                           | §3-0           |
| `resources/js/Components/PageContainer.tsx`               | 新規                                                                                                                                                      | §3             |
| `resources/js/Components/PageHeading.tsx`                 | 新規                                                                                                                                                      | §2, §3         |
| `resources/js/Pages/Items/Index.tsx`                      | `PageContainer`/`PageHeading` 適用・`pb-24` 追加                                                                                                          | §3, §4         |
| `resources/js/Pages/Items/Create.tsx`                     | `PageContainer` 適用・タイトル追加                                                                                                                        | §2, §3         |
| `resources/js/Pages/Items/Edit.tsx`                       | 同上                                                                                                                                                      | §2, §3         |
| `resources/js/Pages/Items/Partials/Form.tsx`              | 外側 `py-6` div 削除・パネルの競合クラス整理／追加直後の自動選択                                                                                          | §3, §6-2       |
| `resources/js/Pages/Items/Partials/SelectableWithAdd.tsx` | 「＋追加」をラベル行へ移動・`w-20` 固定幅を撤廃                                                                                                           | §6-1           |
| `resources/js/api/optionsApi.ts`                          | `addGenre`/`addPlace` の戻り値に型を付与                                                                                                                  | §6-2           |
| `resources/js/Pages/Group/Create.tsx`                     | `header` 削除・`PageContainer` 適用・見出し二重解消・競合クラス/タイポ修正                                                                                | §2, §3         |
| `resources/js/Pages/Group/Edit.tsx`                       | `header` 削除・`PageContainer` 適用                                                                                                                       | §2, §3         |
| `resources/js/Pages/Profile/Edit.tsx`                     | `header` 削除・`PageContainer` 適用                                                                                                                       | §2, §3         |
| `resources/js/Pages/Dashboard.tsx`                        | `header` 削除・`PageContainer` 適用（機械的移行のみ。存廃判断はしない）                                                                                   | §2, §3         |
| `resources/js/Pages/Welcome.tsx`                          | 独自の最大幅指定が残っていれば `max-w-page` に揃える（該当なければ変更不要）                                                                              | §2, §3         |
| `docs/04_frontend_design_guide.md`                        | 規定追記                                                                                                                                                  | §7             |
| `docs/05_implementation_todo.md`                          | Phase 12 追加・実施記録                                                                                                                                   | §7             |

---

## 9. コミット分割

依存関係の順に分ける。各コミットは単独でレビュー可能にすること。

1. `修正：レイアウトのスクロール構造を min-h-screen に戻しナビを固定`（§1 のみ。単独で不具合が直ることを確認できる粒度にする）
2. `追加：本文幅トークン max-w-page を新設しナビ幅を揃える`（§3-0）
3. `追加：PageContainer・PageHeading を新設`（§3-1, §3-2。まだ適用しない）
4. `改修：全画面のページヘッダーとパディングを統一`（§2, §3-3, §3-4）
5. `修正：一覧下部に余白を追加し FAB と買ったボタンの重なりを解消`（§4）
6. `追加：モバイルメニューにグループ編集/作成の導線を追加`（§5）
7. `修正：ジャンル・保管場所の＋追加をラベル行へ移しスマホでの崩れを解消`（§6-1）
8. `改修：ジャンル・保管場所の追加直後に該当オプションを選択状態にする`（§6-2。**Phase 13 完了後に着手**）
9. `更新：UI 統一方針をデザイン指示書に反映`（§7）

---

## 10. 完了の定義

- §1〜§6 の各「検証」項目をすべて満たす。
- `npm run tsc` / `npm run lint` で新規のエラー・警告が出ていない（既存の `ssr.tsx` 由来のものを除く）。
- `npm run build`（`vite build`）が成功する。
- `php artisan test` に回帰がない（既知の Auth 系・環境起因の失敗のみ）。
- `git diff` に、認証・グループ機能のバックエンド・Docker 構成の差分が含まれていない（ジャンル/保管場所の API は Phase 13 で別途扱うため、本フェーズでは触らない）。
- 全画面で本文とナビの左右端が揃っている（PC で確認）。
- PC ブラウザとスマートフォン実機の双方で、ライト/ダーク両テーマで全画面を目視確認済み。
