# UchiStock ロゴ・ファビコン差し替え 実装指示書

最終更新: 2026-08-01
対象読者: 実装担当（Claude Code）およびレビュアー（開発者本人）
上位文書: `docs/04_frontend_design_guide.md`（カラートークン・トンマナ）

## 1. 背景と決定事項

- ブランドアイコンを新デザイン（**コーラル角丸スクエア + 白の家 + チェック**）に刷新する。
- ヘッダーはアイコン単体ではなく**ロックアップ（アイコン + 「UchiStock」ワードマーク）**を表示する。
- ワードマークは OS フォント差の影響を受けないよう、**アウトライン化済み SVG パス**で持つ（M PLUS Rounded 1c Bold 由来、SIL OFL 1.1。フォントファイル自体はリポジトリに含めない）。
- 色はデザイントークンに準拠: アイコンはブランド固定色（コーラル `#EF6A4A`）、ワードマークは `currentColor`（配置側で `text-ink` を指定しトークン経由でライト/ダークに追従させる）。

## 2. 成果物ファイルと配置先

同梱ファイルをリポジトリの以下パスへ配置（既存ファイルは上書き）:

| 同梱ファイル | 配置先 |
| --- | --- |
| `favicon/favicon.svg` | `htdocs/public/favicon/favicon.svg` |
| `favicon/favicon-96x96.png` | `htdocs/public/favicon/favicon-96x96.png` |
| `favicon/apple-touch-icon.png` | `htdocs/public/favicon/apple-touch-icon.png` |
| `favicon/web-app-manifest-192x192.png` | `htdocs/public/favicon/web-app-manifest-192x192.png` |
| `favicon/web-app-manifest-512x512.png` | `htdocs/public/favicon/web-app-manifest-512x512.png` |
| `ApplicationLogo.tsx` | `htdocs/resources/js/Components/ApplicationLogo.tsx` |
| `masters/*`（原本SVG） | 配置不要。デザイン原本としてリポジトリ外またはdocs配下で保管 |

補足:

- `favicon.svg` はライト/ダークで角丸スクエアの色が `#EF6A4A` / `#F47A5C` に切り替わる（`prefers-color-scheme`）。白の家・チェックは両テーマ共通。
- `apple-touch-icon.png` / `web-app-manifest-*.png` は**フルブリード（角丸なし・全面コーラル）**で、家をセーフゾーン内（約82%）に収めた maskable 対応版。OS 側で角丸/マスクが適用される前提。
- `favicon-96x96.png` は角丸つき版。
- 旧アセットのバックアップが必要なら `favicon_bak/` の運用に合わせる（不要なら `favicon_bak/` ごと削除を検討してよいが、削除は別コミットに分ける）。

## 3. 実装手順

### 3.1 ファビコン一式の差し替え

1. §2 の表どおりに `htdocs/public/favicon/` 配下を上書きする。
2. `htdocs/resources/views/app.blade.php` の `<head>` 参照は現状のままで整合（ファイル名変更なし）。
3. **typo 修正**: 同ファイルの `<meta name="apple-mobile-web-app-title" content="UchiStoke" />` を `UchiStock` に修正する。
4. `htdocs/public/favicon/site.webmanifest` の `theme_color` を `#EF6A4A` に変更する（`background_color` は `#ffffff` のまま維持）。

### 3.2 ヘッダーロゴ（ApplicationLogo）の差し替え

1. `htdocs/resources/js/Components/ApplicationLogo.tsx` を同梱ファイルで置き換える。
2. viewBox が旧: 正方形（1:1）→ 新: `0 0 500 96`（約 5.2:1 の横長）に変わるため、**呼び出し側のサイズ指定を確認・調整**する:
   - `resources/js/Layouts/AuthenticatedLayout.tsx` / `GuestLayout.tsx`（および他に `ApplicationLogo` を参照している箇所を grep で全確認）。
   - 幅固定クラス（`w-20` など）があれば削除し、**高さ基準 + 幅自動**にする: 推奨 `className="h-8 w-auto text-ink"`（GuestLayout のような大きめ表示は `h-10 w-auto text-ink`）。
   - 旧実装の `fill-current text-gray-500` のような灰色指定は `text-ink` に置き換える（ワードマークの色はここで決まる）。
3. ロゴをリンクにしている場合（`items.index` や `dashboard` への `Link`）はその構造を維持する。
4. 実装時点の確認により `GuestLayout.tsx` はロゴ自体を表示していなかった（本書は既存表示のサイズ調整のみを想定していたが実態と相違）。ログイン/登録画面のブランド一貫性のため、`ApplicationLogo` をカード上部に新規追加する（`Link href="/"` でラップ、`h-10 w-auto text-ink`）。

### 3.3 検証

1. `npm run tsc` / `npm run lint` で新規エラーがないこと。
2. `npm run build`（vite build）が成功すること。
3. ブラウザ目視:
   - ヘッダー（AuthenticatedLayout / GuestLayout）でロックアップが崩れずに表示される（ライト/ダーク両方。ワードマークがダークで `#EEF0E8` 系になること）。
   - タブのファビコンが新アイコンに変わる（キャッシュ強制リロード）。ライト/ダークのOS設定でスクエア色が切り替わる。
   - モバイル幅（〜390px）でヘッダーがはみ出さない。狭幅でレイアウトが厳しい場合のみ、ワードマークを隠してアイコンのみ表示するのは**不可**（本件の主旨に反する）。代わりに `h-7` まで縮小して収める。
4. スマホ実機または DevTools で `site.webmanifest` のアイコン/テーマ色反映を確認（Phase 1 のソロ実運用で Raspberry Pi 配信時に再確認）。

## 4. 遵守事項

- Docker 構成（`docker/` 配下・`docker-compose.yml`）には一切触れない。
- 色の直値はブランド固定色（アイコンのコーラル/白）のみ許容。ワードマークや周辺 UI は必ずトークン（`text-ink` 等）経由。
- コミットは (1) favicon 一式 + blade 修正、(2) ApplicationLogo + レイアウト調整、の 2 つに分ける。`favicon_bak/` 削除を行う場合は (3) として分離。
- 本書の内容と実装に差分が生じた場合は、実装前に本書を更新する（ドキュメントファースト）。

## 5. デザイン原本（masters/）

- `logo-lockup.svg` — ロックアップ原本（viewBox 0 0 500 96）
- `icon-rounded.svg` — 角丸アイコン原本（favicon PNG の元）
- `icon-fullbleed.svg` — フルブリード原本（apple-touch / maskable PNG の元）

PNG を再生成する場合はこれらの SVG から任意サイズで書き出す（96 / 180 / 192 / 512）。
