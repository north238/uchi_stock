# 10. LINEログイン不具合修正指示書 — standalone PWA と OAuth state の非互換対応

作成日: 2026-08-02
対象ブランチ: `development` から新規ブランチ `fix/line-login-standalone` を作成して作業すること

---

## 1. 背景と根本原因(実装前に必ず読むこと)

### 1.1 事象

- PC ブラウザからの LINE ログインは成功する
- スマホの「ホーム画面に追加」したアイコンから起動した場合のみ、LINE ログインが失敗する
- 本番ログ(`storage/logs/laravel.log`)には以下が記録される:

  ```text
  production.ERROR: システムエラー {"message":"","file":"/var/www/html/vendor/socialiteproviders/line/Provider.php","line":118}
  ```

- `socialiteproviders/line` v4.1.0 の `Provider.php` 118行目は `throw new InvalidStateException();` であることをソース照合で確認済み。message が空なのは同例外が引数なしで投げられるため

### 1.2 根本原因(確定済み)

`public/site.webmanifest` の `"display": "standalone"` により、ホーム画面アプリは Safari 本体とストレージ(Cookie / セッション)が完全に分離される。この状態で OAuth フローが以下のように壊れる:

1. ホーム画面アプリ(standalone)で `/login/line/redirect` → OAuth の state がホーム画面アプリ専用セッションに保存される
2. LINE 認可中に LINE アプリ本体へ切り替わる(自動ログイン)
3. 認可後のコールバック `/login/line/callback` が **Safari 本体で開く**
4. Safari には state を持つセッション Cookie が存在しない → 新規セッションが発行される → state 不一致 → `InvalidStateException`

### 1.3 調査で無罪確定済みの項目(再調査不要)

| 項目                            | 確認結果                                          |
| ------------------------------- | ------------------------------------------------- |
| `APP_URL` / `LINE_REDIRECT_URI` | `https://uchistock.bridgin-app.com` で一致        |
| `SESSION_DOMAIN`                | null(自動スコープ)で正常                          |
| `SESSION_SAME_SITE`             | `lax` で正常                                      |
| TrustProxies                    | `$proxies = '*'` 設定済み                         |
| Redis 接続                      | `ping()` 成功、セッションキーの書き込みも確認済み |

### 1.4 採用しない対策と理由

- **`Socialite::driver('line')->stateless()` は使用禁止。** state 検証の無効化はログイン CSRF(攻撃者アカウントへの強制ログイン、将来のアカウント紐付け乗っ取り)を許すため。本指示書の完了後も、この方針は維持すること

---

## 2. 変更内容

### 2.1 [必須] manifest の display モード変更

**ファイル: `htdocs/public/favicon/site.webmanifest`**

```diff
-  "display": "standalone"
+  "display": "browser"
```

- 他のキー(`name`, `icons`, `theme_color`, `background_color`)は変更しない
- `minimal-ui` は採用しない(iOS での解釈が不安定で standalone 相当になるケースがあるため)
- あわせて `htdocs/resources/views/app.blade.php` に `apple-mobile-web-app-capable` の meta タグが存在するか確認し、**存在する場合は削除する**(manifest より優先されて standalone 化するため)

### 2.2 [必須] 例外ハンドラのログ強化

今回の調査では `"message":""` のみで例外クラスが特定できず、ソース照合が必要だった。再発時の調査コストを下げるため、「システムエラー」を記録している例外ハンドラ(`app/Exceptions/Handler.php` またはログ出力箇所)に例外クラス名を追加する:

```php
Log::error('システムエラー', [
    'exception' => get_class($e),   // ← 追加
    'message'   => $e->getMessage(),
    'file'      => $e->getFile(),
    'line'      => $e->getLine(),
]);
```

- 既存のログフォーマットへのキー追加のみとし、ハンドラの制御フローは変更しない

### 2.3 [必須] ドキュメント更新(コード変更より先にコミットする)

1. **`CLAUDE.md`**: 「変更禁止・制約事項」の節に以下を追記する(Docker 構成変更禁止と同列の恒久制約として):

   > - **manifest の `display` は `browser` を維持すること。** `standalone` にするとホーム画面アプリと Safari のストレージ分離により LINE ログイン(OAuth state 検証)が壊れる。2026-08-02 の本番検証で確定した制約(詳細は `docs/10_line_login_standalone_fix.md`)
   > - **Socialite の `stateless()` は使用禁止。** ログイン CSRF 防御(state 検証)を無効化するため

2. **`docs/06_production_deploy.md`**: 確認項目に「本番ハードニング時は TrustProxies 設定(`$proxies = '*'`, 設定済み)を前提に `SESSION_SECURE_COOKIE=true` を有効化する」を追記する(本指示書のスコープでは有効化しない。追記のみ)

3. 本ファイル(`docs/10_line_login_standalone_fix.md`)をリポジトリの `docs/` に配置する

### 2.4 [スコープ外 — 実施しないこと]

- `disable_auto_login` パラメータの付与(standalone 維持の代替案だったが、案B 採用により不要)
- `SESSION_SECURE_COOKIE=true` の有効化(別タスクとして実施)
- Docker 構成(`docker/` 配下、`docker-compose.yml`)の変更 — **一切禁止(既存制約)**
- `SocialiteLoginController` の認証ロジック変更

---

## 3. コミット順序

1. `docs: LINEログインstandalone問題の修正指示書と制約を追記`(CLAUDE.md、docs/06 追記、docs/10 配置)
2. `fix: manifestのdisplayをbrowserに変更(standalone起因のLINEログイン不能を解消)`
3. `improve: 例外ログに例外クラス名を追加`

---

## 4. 検証手順(受け入れ条件)

### 4.1 デプロイ後のスマホ実機検証(ユーザーが実施)

manifest の display モードは**ホーム画面追加時に焼き付けられる**ため、既存アイコンでは検証できない。必ず以下の順で行う:

1. 変更をデプロイする
2. スマホから既存の UchiStock アイコンを削除する
3. Safari で `https://uchistock.bridgin-app.com` を開き、改めて「ホーム画面に追加」する
4. 新しいアイコンから起動し、**Safari の UI(アドレスバー)付きで開くこと**を確認する
5. その状態で LINE ログインを実行する

### 4.2 受け入れ条件

- [ ] 4.1 の手順で、ホーム画面アイコン起動からの LINE ログインが成功する
- [ ] PC ブラウザからの LINE ログインが引き続き成功する(デグレなし)
- [ ] `laravel.log` に `InvalidStateException` が新規記録されない
- [ ] 意図的にエラーを発生させた場合(または既存エラーログの次回発生時)、ログに `"exception":"..."`(クラス名)が含まれる
- [ ] `git diff` で Docker 関連ファイル・認証ロジック(`SocialiteLoginController` の処理フロー)に差分がない

### 4.3 検証失敗時のフォールバック調査

万一 4.1 手順後もログインに失敗する場合は、以下で切り分ける(修正着手前にユーザーへ報告すること):

```bash
# Redis を観測しながらスマホでログインを再現し、
# redirect 時の SETEX と callback 時の GET のセッション ID が一致するか確認する
docker compose -f docker-compose.prod.yml exec redis redis-cli monitor
```

> **セキュリティ注意**: `redis-cli monitor` の出力にはセッション ID や値が平文で含まれる。確認後は速やかに終了し、出力をログ・チャット等に共有する場合は該当値をマスキングすること。

- ID 不一致が続く場合: meta タグの standalone 化残存、または LINE アプリ内ブラウザでのコールバック受信を疑う
- ID 一致なのに失敗する場合: 別原因のため、強化済みログの例外クラス名を確認して報告する

---

## 5. 家族展開時の注意(Phase 2 向けメモ)

- 家族がすでにホーム画面へアイコンを追加していた場合、4.1 と同様に**アイコンの削除→再追加の案内が必要**(Phase 1 の現時点では Fumiya の端末のみのため影響は限定的)

ドキュメント貼り付け用に、案Aを自己完結でまとめます。

---

## 6. `disable_auto_login`によるstandalone復活(未検証・保留中)

### 目的

manifestを`"display": "standalone"`に戻し、全画面表示とタブ増殖なしを実現する。

### 原理

standaloneでLINEログインが壊れる直接の引き金は、認可中にLINEアプリへ切り替わり、コールバックがホーム画面アプリの外(デフォルトブラウザ)で開くこと。LINE Loginの`disable_auto_login=true`パラメータでアプリ切り替え自体を抑止し、フロー全体をWeb内で完結させれば、コンテキスト分離が発生せずstate検証が通る——という仮説。

### 実装(1行)

`SocialiteLoginController`の認可URL組み立て部に、既存の`bot_prompt`と同じパターンで追加:

```php
$urlWithParam = $url
    . (strpos($url, '?') === false ? '?' : '&') . 'bot_prompt=aggressive'
    . '&disable_auto_login=true';
```

あわせて`public/favicon/site.webmanifest`の`display`を`browser`→`standalone`に戻す。

### トレードオフ

- ログイン時にLINEアプリの自動認証が使えず、**LINEのメールアドレス＋パスワードの手入力**が必要になる。リメンバークッキー(動作確認済み)により実質初回とログアウト後のみ
- 現状運用(ブックマーク)のログアウト後復帰は認可ワンタップで済むため、**復帰の手間は現状より重くなる**。交換条件は「日次のタブ増殖解消 ⇔ 稀なログイン時の手入力」

### リスク(未検証事項)

**iOSがstandaloneアプリから外部ドメイン(LINE認可画面)への遷移をアプリ内WebViewに留めるかは未確認。** アプリ内ブラウザシート(別ストレージ)で開かれた場合、同じコンテキスト分離が再発し案Aは不成立。文献で断定できないため実機検証が必須。

### 検証手順

1. 上記1行＋manifest変更をデプロイ
2. ホーム画面の既存アイコンを削除し、**「Webアプリとして追加」にチェックを入れて**再追加
3. 新アイコン(全画面起動)からLINEログインを実行
4. 成功 → 案A採用で確定。`docs/07`とCLAUDE.mdの「`display: browser`維持」制約を「standalone + `disable_auto_login`必須」に改訂
5. 失敗(`InvalidStateException`再発) → 案Aを恒久的に棄却し、現状のブックマーク運用で確定。本節に棄却日と理由を追記

### 前提知識(2026-08-03時点の確定事項)

- iOS 17.4以降、ホーム画面追加時の「Webアプリとして追加」チェックでユーザーがstandalone/ブックマークを選択でき、**manifestの`display`はデフォルト値を決めるだけ**でユーザー選択を強制できない
- したがって案A採用時も、チェックを外して追加した端末ではブックマークとして動く(それ自体は無害)
