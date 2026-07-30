# UchiStock 本番デプロイ構成 実装指示書（Raspberry Pi + Cloudflare Tunnel）

> このファイルは Claude Code がそのまま実装に着手するための指示書です。
> 上から順に実行してください。**既存の開発用構成（`docker/` 配下・`docker-compose.yml`）は一切変更しません。** 本番用は新規ファイルとして追加します（CLAUDE.md の「Docker 構成は変更禁止」に準拠）。

---

## 0. 前提・ゴール

### ゴール

Raspberry Pi（ARM64）上で、UchiStock を **本番構成の Docker** で常時稼働させ、**Cloudflare Tunnel（ホスト側 systemd の cloudflared）** 経由で外部公開する。Phase 1（本人による 2 週間の実運用検証）を開始できる状態にする。

### 確定済みの前提

- ホスティング: 手元の Raspberry Pi（外部アクセス可）
- 公開経路: Cloudflare Tunnel。**トークンは発行済み**。
- cloudflared: **ホスト側で systemd 常駐**（Docker コンテナにはしない）
- DB: MySQL / MariaDB（既存の MySQL コンテナを踏襲）
- Web サーバー: **Nginx を存置**（FrankenPHP 等への置換は Phase 2 以降の検討事項）
- アプリ: Laravel 10 / PHP 8.2 / Inertia + React（Vite ビルド）

### 設計方針（3 原則）

1. **開発と本番を分離**：本番専用ファイルを新規追加。既存には触れない。
2. **最小露出**：ホストにポート公開するのは Nginx の 1 ポートのみ。DB・Redis・PHP-FPM はホストに公開しない。
3. **本番はコード焼き込み**：bind mount を使わず、イメージにコードとビルド済みアセットを含める。

### 確定した設計判断（当初「あとで考える」だった 4 点を今固めた）

本指示書は以下の 4 点を暫定回避ではなく確定設計として組み込む。詳細は §7 に集約。

- **A. アセット共有**：volume 共有をやめ、**共通フロントビルドステージから app / web の両イメージへ `public/build` を焼き込む**。二重管理に見えるが単一成果物由来なので不整合は起きない。`deploy.sh` の volume 削除という不安定な小細工を排除。
- **B. storage 揮発扱い**：アバター画像は `Storage::disk('public')` に保存されるが、**LINE ログインのたびに再取得・再生成される**実装のため、消えても次のログインで復元される。よって**永続化しない**（named volume を持たない）。`public/storage` シンボリックリンクだけは配信のため起動時に張る（リンク先は揮発データ）。これにより storage 周りの volume 共有・権限調整が不要になり構成が簡素化。
- **C. キュー / スケジューラ**：Phase 1 は非同期処理を持たないため **`QUEUE_CONNECTION=sync` のまま、worker / scheduler コンテナは作らない**。将来（購入周期推定機能）追加時の構成は §7-C に設計として明記済み。
- **D. DB バックアップ（学習目的）**：実データの保険としてではなく**バックアップ／リストアを一度きちんと経験すること**を目的に据える。**ホスト側 cron で日次 `mysqldump` ＋ 3 世代保持、かつリストア手順を検証まで行う**（§7-D）。個人利用ゆえ保険としての要求はないが、取得〜復元の一連を通す価値を優先。

---

## 1. 作成するファイル一覧

すべて**新規作成**。既存ファイルは編集しない。

| #   | パス                                    | 目的                                                                   |
| --- | --------------------------------------- | ---------------------------------------------------------------------- |
| 1   | `docker/php/Dockerfile.prod`            | 本番用 PHP-FPM。xdebug なし、`--no-dev`、Vite ビルド焼き込み           |
| 2   | `docker/php/php.prod.ini`               | 本番用 PHP 設定。`display_errors=off`・opcache 本番最適化・xdebug なし |
| 3   | `docker/nginx/Dockerfile.prod`          | 本番用 Nginx。本番 conf を参照                                         |
| 4   | `docker/nginx/default.prod.conf`        | 本番用サーバー設定（`default.conf` を流用）                            |
| 5   | `docker/nginx/nginx.prod.conf`          | 本番用グローバル設定。**CSP を本番ドメイン向けに修正**                 |
| 6   | `docker-compose.prod.yml`               | 本番用 compose。ポート非公開・bind mount なし                          |
| 7   | `htdocs/.env.production.example`        | 本番 `.env` の雛形                                                     |
| 8   | `deploy.sh`                             | 更新デプロイを 1 コマンド化                                            |
| 9   | `scripts/backup-db.sh`                  | DB 日次バックアップ＋世代管理（ホスト cron から実行）                  |
| 10  | `docker/php/entrypoint.prod.sh`         | 起動時に `storage:link`・キャッシュ最適化を実行するエントリポイント    |

> ホスト側 cloudflared の systemd ユニットはリポジトリには含めない（§2-9 に設定内容を参考として記載。実ファイルはラズパイ上の `/etc/systemd/system/` に直接作成する）。

---

## 2. 各ファイルの実装

### 2-1. `docker/php/Dockerfile.prod`

既存 `docker/php/Dockerfile` からの差分方針:

- **xdebug を削除**（`pecl install` と `docker-php-ext-enable` から除外）
- **マルチステージ化**：ビルドステージで `composer install --no-dev` と `npm ci && npm run build` を実行し、最終ステージには `vendor/` とビルド済み `public/build` のみを持ち込む（`node_modules` は最終イメージに残さない）
- ラズパイ（ARM64）で動くよう、ベースイメージは `php:8.2-fpm-alpine`（マルチアーキ対応）を継続

```dockerfile
# ---- Build stage: Composer 依存 ----
FROM php:8.2-fpm-alpine AS vendor

RUN apk add --no-cache $PHPIZE_DEPS libzip-dev icu-dev oniguruma-dev \
    && docker-php-ext-install pdo_mysql zip intl mbstring
COPY --from=composer:2.7.2 /usr/bin/composer /usr/local/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1
WORKDIR /app
COPY ./htdocs/composer.json ./htdocs/composer.lock ./
# アプリコードが無いと post-install スクリプトが失敗するため一旦スキップ
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# ---- Build stage: フロントエンド（Vite）----
FROM node:18-alpine AS frontend
WORKDIR /app
COPY ./htdocs/package.json ./htdocs/package-lock.json ./
RUN npm ci
COPY ./htdocs ./
# vendor を先に入れておく（ビルドで参照される場合に備える）
COPY --from=vendor /app/vendor ./vendor
RUN npm run build

# ---- Final stage: 本番 PHP-FPM ----
FROM php:8.2-fpm-alpine AS php-fpm

RUN apk add --no-cache \
    icu-libs libzip oniguruma tzdata mysql-client bash \
    freetype libpng libjpeg-turbo libwebp

# PHP 拡張（xdebug は入れない）
RUN apk add --no-cache --virtual .build-deps \
    $PHPIZE_DEPS icu-dev libzip-dev oniguruma-dev libxml2-dev \
    freetype-dev libpng-dev libjpeg-turbo-dev libwebp-dev \
    && pecl install redis \
    && docker-php-ext-configure intl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-enable redis \
    && docker-php-ext-install zip intl pdo_mysql ctype dom fileinfo filter mbstring pdo session xml gd \
    && apk del .build-deps

COPY --from=composer:2.7.2 /usr/bin/composer /usr/local/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV COMPOSER_HOME=/composer
ENV PATH=$PATH:/composer/vendor/bin

WORKDIR /var/www/html

# アプリコード本体
COPY ./htdocs /var/www/html
# ビルド済み依存・アセットを上書きで焼き込み
COPY --from=vendor   /app/vendor            /var/www/html/vendor
COPY --from=frontend /app/public/build      /var/www/html/public/build
# 本番 PHP 設定
COPY ./docker/php/php.prod.ini /usr/local/etc/php/php.ini
COPY ./docker/php/www.conf     /usr/local/etc/php-fpm.d/www-custom.conf
# 本番エントリポイント（storage:link・キャッシュ最適化）
COPY ./docker/php/entrypoint.prod.sh /usr/local/bin/entrypoint.prod.sh
RUN chmod +x /usr/local/bin/entrypoint.prod.sh

# post-install 相当（autoload 最適化）を本番向けに実行
RUN composer dump-autoload --optimize --no-dev

RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage /var/www/html/bootstrap/cache

ENTRYPOINT ["/usr/local/bin/entrypoint.prod.sh"]
CMD ["php-fpm", "-F"]
```

> **注意**: `npm run build` がビルドに `vendor`（Ziggy 等）を必要とするかはプロジェクト依存。上記は念のため vendor を frontend ステージへコピーしている。ビルドが vendor 不要なら該当行は削除してよい。
>
> **判断 A の要**: 上の `frontend` ステージ（`public/build` を生成）は、後述の Nginx イメージ（§2-5）からも同じ成果物を参照する。両イメージが同一のビルド成果を焼き込むため、volume 共有なしでアセットの不整合が起きない。

---

### 2-2. `docker/php/php.prod.ini`

既存 `php.ini` から **xdebug セクションを完全に除去**し、エラー表示とopcacheを本番化する。実用設定（timezone・mbstring・上限値）は継続。

```ini
[Date]
date.timezone = "Asia/Tokyo"

[mbstring]
zend.multibyte = On
zend.script_encoding = "UTF-8"
mbstring.language = "Japanese"

[opcache]
opcache.enable = 1
opcache.enable_cli = 0
opcache.memory_consumption = 128
opcache.interned_strings_buffer = 8
opcache.max_accelerated_files = 10000
; 本番はコードが変わらない前提でタイムスタンプ検証を無効化（性能向上）
; デプロイ時は opcache クリアのためコンテナを再起動すること
opcache.validate_timestamps = 0
opcache.fast_shutdown = 1

[error_reporting]
; 本番：画面には出さずログへ
error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT
display_errors = Off
display_startup_errors = Off
log_errors = On
error_log = "/var/log/php_errors.log"

[memory_limit]
memory_limit = 256M

[max_execution_time]
max_execution_time = 60

[upload_max_filesize]
upload_max_filesize = 20M

[post_max_size]
post_max_size = 20M

[session]
session.use_strict_mode = On
session.use_only_cookies = On
session.cookie_secure = On
session.cookie_httponly = On
session.cookie_samesite = Strict
```

> `memory_limit` と `max_execution_time` は開発用（1G / 300s）から本番現実値へ縮小。音声入力（大きな upload）は Phase 11 で削除済みのため上限も縮小して問題ない。挙動に問題が出たら調整する。

---

### 2-3. `docker/nginx/default.prod.conf`

既存 `default.conf` をほぼ流用。`fastcgi_pass` の向き先は本番 compose のサービス名に合わせる（下記では `app` を使用。2-6 参照）。

```nginx
server {
    listen 80;
    server_name _;
    index index.php index.html;
    root /var/www/html/public;

    error_log  /var/log/nginx/error.log;
    access_log /var/log/nginx/access.log;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass app:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME /var/www/html/public/index.php;
        fastcgi_param PATH_INFO $fastcgi_script_name;
    }

    location ~* \.(css|gif|ico|jpeg|jpg|js|png|svg|webp|woff2)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
        try_files $uri =404;
    }

    location ~ /\.(git|env|htaccess|htpasswd|DS_Store|vscode|idea|log) {
        deny all;
    }
}
```

---

### 2-4. `docker/nginx/nginx.prod.conf`

既存 `nginx.conf` から **CSP を本番用に修正するのが最重要**。開発用の `localhost:5173`（Vite）・`localhost:8080` を除去し、本番ドメインに合わせる。

```nginx
user www-data;
worker_processes auto;

error_log  /var/log/nginx/error.log error;
pid        /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    server_tokens off;
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    sendfile on;
    keepalive_timeout 65;

    # セキュリティヘッダー
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # CSP: 本番用（Vite dev サーバー参照を除去）
    # ${APP_DOMAIN} を実際の公開ドメインに置換すること（例: uchistock.example.com）
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.bunny.net; font-src 'self' https://fonts.bunny.net; connect-src 'self' https://access.line.me; img-src 'self' data:; media-src 'self' blob:;" always;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_disable "msie6";

    include /etc/nginx/conf.d/*.conf;
}
```

> **要手動置換**: CSP 内にドメイン指定が必要になった場合は `${APP_DOMAIN}` を実ドメインへ。現状の設定は `'self'` ベースなので Cloudflare Tunnel の独自ドメインでもそのまま動くはず。LINE 認証（`access.line.me`）は残している。

---

### 2-5. `docker/nginx/Dockerfile.prod`

**判断 A を反映**：volume 共有はやめ、php イメージと同じ `frontend` ビルドステージから `public/build` を焼き込む。これにより Nginx も PHP も同一のビルド成果物を持ち、不整合が構造的に発生しない。

```dockerfile
# ---- 共通フロントビルド（php Dockerfile.prod の frontend ステージと同一内容）----
FROM node:18-alpine AS frontend
WORKDIR /app
COPY ./htdocs/package.json ./htdocs/package-lock.json ./
RUN npm ci
COPY ./htdocs ./
RUN npm run build

# ---- Nginx 本体 ----
FROM nginx:stable-alpine

WORKDIR /var/www/html

COPY ./docker/nginx/default.prod.conf /etc/nginx/conf.d/default.conf
COPY ./docker/nginx/nginx.prod.conf   /etc/nginx/nginx.conf

# 静的配信対象：public 本体 ＋ ビルド済みアセットを焼き込み
COPY ./htdocs/public /var/www/html/public
COPY --from=frontend /app/public/build /var/www/html/public/build

RUN adduser -s /bin/sh -D -G www-data www-data 2>/dev/null || true \
    && chown -R www-data:www-data /var/www/html

CMD ["nginx", "-g", "daemon off;"]
```

> **判断 A の設計意図**:
>
> - 当初案の「app→web を volume で共有」は、空 volume にのみイメージ内容がコピーされる Docker の初期化挙動に依存し、**2 回目以降のデプロイでアセットが古いまま残るリスク**があった。`deploy.sh` で volume を削除する回避策も、削除漏れや競合で壊れやすい。
> - 代わりに **app と web が各自のイメージ内に `public/build` を焼き込む**。ビルドステージは同一定義なので成果物は一致する。デプロイ（再ビルド）のたびに両者が最新の同一アセットを持つ。
> - コスト：`npm run build` が 2 回走る（app 用・web 用）。ラズパイでは無視できない時間になり得るため、§5 のクロスビルド案（開発機で ARM64 イメージを buildx）と併せて検討。**ビルド時間が問題なら判断 A を維持したまま、後述の「単一ビルダーステージ共有」最適化（§7-A 補足）に切り替えられる。**
>   **`storage/app/public`（アバター画像）の配信について（判断 B）**:
>   アバターは LINE ログイン毎に再生成される揮発データのため、永続化 volume は持たない。`public/storage` シンボリックリンク（`storage:link` で生成）は app コンテナ内に張られ、app が保存したアバターを **PHP 経由**で配信すれば足りる。Nginx が静的に直接配信する必要がある場合のみ storage の共有が要るが、Phase 1 では PHP 経由配信で問題ない。実装後にアバターが表示されるかを検証（§4 チェックリスト）。

---

### 2-6. `docker-compose.prod.yml`

開発用との差分:

- **ホストへのポート公開は web の 1 つだけ**（cloudflared が叩く `127.0.0.1:8080` のみ。DB・Redis・app は公開しない）
- **bind mount なし**（コードはイメージ内）
- `container_name` は開発用（`uchistock-*`）と衝突しないよう `-prod` を付与
- `restart: unless-stopped` でラズパイ再起動後も自動復帰

```yaml
services:
  db:
    container_name: uchistock-db-prod
    build:
      context: .
      dockerfile: ./docker/mysql/Dockerfile
    environment:
      - MYSQL_DATABASE=${DB_DATABASE}
      - MYSQL_USER=${DB_USERNAME}
      - MYSQL_PASSWORD=${DB_PASSWORD}
      - MYSQL_ROOT_PASSWORD=${DB_PASSWORD}
      - TZ=${TZ}
    command: mysqld --default-authentication-plugin=mysql_native_password
    # ports は公開しない（内部ネットワークのみ）
    volumes:
      - mysql_data_prod:/var/lib/mysql
      - ./docker/mysql/my.cnf:/etc/mysql/conf.d/my.cnf
    networks:
      - uchistock_prod_network
    restart: unless-stopped

  redis:
    container_name: uchistock-redis-prod
    image: redis:6.2.14
    # ports は公開しない
    volumes:
      - redis_data_prod:/data
    networks:
      - uchistock_prod_network
    restart: unless-stopped

  app:
    container_name: uchistock-app-prod
    build:
      context: .
      dockerfile: ./docker/php/Dockerfile.prod
    environment:
      - DB_HOST=db
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    # 判断 B: アバターは LINE ログイン毎に再生成される揮発データのため永続化 volume なし
    depends_on:
      - db
      - redis
    networks:
      - uchistock_prod_network
    restart: unless-stopped

  web:
    container_name: uchistock-web-prod
    build:
      context: .
      dockerfile: ./docker/nginx/Dockerfile.prod
    # cloudflared（ホスト）からのみ到達。ローカルホストにのみバインド。
    ports:
      - '127.0.0.1:8080:80'
    depends_on:
      - app
    networks:
      - uchistock_prod_network
    restart: unless-stopped

networks:
  uchistock_prod_network:
    driver: bridge

volumes:
  mysql_data_prod:
  redis_data_prod:
```

> **ポイント**:
>
> - `web` の `ports` は `127.0.0.1:8080:80`。**ホストのローカルにのみ**バインドし、外部 NIC には晒さない。cloudflared が `localhost:8080` を叩く。
> - 開発用 compose の `networks: external: true` と異なり、本番は自前で bridge ネットワークを作る（`external` にしない）。
> - **`build_assets` volume は廃止**（判断 A）。`public/build` は app / web の各イメージに焼き込み済みなので volume 共有は不要。
> - **`storage_public` volume も持たない**（判断 B）。アバター画像は LINE ログイン毎に再生成される揮発データのため、消えても次のログインで復元される。`storage:link` だけは entrypoint で張る。
> - 永続化する volume は `mysql_data_prod`（DB 実体）と `redis_data_prod`（セッション・キャッシュ）のみ。**コンテナは使い捨て、これら 2 つの volume だけがデータを保持する**。デプロイでコンテナを作り直しても両 volume は残るため、DB データは無傷。

---

### 2-7. `htdocs/.env.production.example`

本番 `.env` の雛形。実ファイル `.env` はラズパイ上で作成し、**リポジトリにコミットしない**。

```dotenv
APP_NAME=UchiStock
APP_ENV=production
APP_KEY=            # ラズパイで php artisan key:generate --show して設定
APP_DEBUG=false
APP_URL=https://<your-tunnel-domain>

LOG_CHANNEL=stack
LOG_LEVEL=warning

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=uchistock
DB_USERNAME=uchistock
DB_PASSWORD=<strong-password>

REDIS_HOST=redis
REDIS_PORT=6379

SESSION_DRIVER=redis
SESSION_LIFETIME=120
CACHE_STORE=redis
QUEUE_CONNECTION=sync

TZ=Asia/Tokyo

# LINE 認証（本番チャネル）
LINE_CHANNEL_ID=<prod-channel-id>
LINE_CHANNEL_SECRET=<prod-channel-secret>
```

> **注意点**:
>
> - `APP_DEBUG=false` は本番の鉄則（例外画面から情報漏洩を防ぐ）。
> - `DB_HOST=db` / `REDIS_HOST=redis`：本番はコンテナ間通信なのでサービス名を指定。ポート番号も内部の 3306 / 6379（開発用の 3307 / 6579 ではない）。
> - LINE のコールバック URL は本番ドメインで LINE Developers 側に登録し直すこと。

---

### 2-8. `deploy.sh`

更新デプロイを 1 コマンド化。ラズパイ上のリポジトリルートで実行する。

```bash
#!/bin/bash
# UchiStock 本番デプロイ（Raspberry Pi）
# 使い方: ./deploy.sh
set -euo pipefail

cd "$(dirname "$0")"

echo "==> git pull"
git pull origin main

echo "==> デプロイ前 DB バックアップ"
./scripts/backup-db.sh || echo "warn: バックアップに失敗（デプロイは継続）"

echo "==> イメージ再ビルド（public/build は app/web 各イメージに焼き込まれる）"
docker compose -f docker-compose.prod.yml build

echo "==> コンテナ起動（storage:link・キャッシュ最適化は entrypoint が実行）"
# 判断 A: アセットはイメージ内に焼き込み済みのため volume 削除の小細工は不要。
# opcache.validate_timestamps=0 のため、再ビルド＋recreate で確実に新コードへ差し替わる。
docker compose -f docker-compose.prod.yml up -d --build

echo "==> マイグレーション"
docker compose -f docker-compose.prod.yml exec -T app php artisan migrate --force

echo "==> 完了"
```

> - `migrate --force` は本番で対話プロンプトを飛ばすため必須。
> - `storage:link` と `config/route/view:cache` は **entrypoint（§2-11）が起動ごとに実行**するので deploy.sh からは外した。`.env` 変更もコンテナ再起動で確実に反映される。
> - デプロイ前に必ず DB バックアップを取る（§7-D）。

---

### 2-9. ホスト側 systemd 設定（参考。リポジトリには含めない）

cloudflared は**コンテナではなくホストで** systemd 常駐。トークンは発行済み。

> このユニット定義はリポジトリに実ファイルとして置かない（トークンを含む運用のため、コミット対象にする意味が薄い）。以下の内容をそのままラズパイ上の `/etc/systemd/system/cloudflared-uchistock.service` として作成する。

```ini
# /etc/systemd/system/cloudflared-uchistock.service に配置
[Unit]
Description=cloudflared tunnel for UchiStock
After=network.target

[Service]
# トークンは環境ファイル等で秘匿する（下記コマンドに直書きしない運用も可）
ExecStart=/usr/local/bin/cloudflared tunnel run --token <YOUR_TUNNEL_TOKEN>
Restart=always
RestartSec=5
User=nobody

[Install]
WantedBy=multi-user.target
```

セットアップ手順（ホスト側、参考）:

```bash
# cloudflared インストール（ARM64）
# 公式の最新手順に従うこと。パッケージ or バイナリ配置。

# Cloudflare ダッシュボードで Public Hostname を設定:
#   <your-tunnel-domain>  ->  http://localhost:8080
# （↑ web コンテナがバインドしている 127.0.0.1:8080 に向ける）

sudo systemctl daemon-reload
sudo systemctl enable --now cloudflared-uchistock
sudo systemctl status cloudflared-uchistock
```

> **接続の全体像**:
> `インターネット → Cloudflare → (Tunnel) → cloudflared(ホスト) → localhost:8080 → web コンテナ(Nginx:80) → app コンテナ(PHP-FPM:9000)`
> DB・Redis はこの経路のどこからも直接露出しない。

---

### 2-10. `docker/php/entrypoint.prod.sh`（判断 B）

app コンテナ起動時に毎回実行。`storage:link` を張り、本番キャッシュを最適化してから php-fpm を起動する。

```bash
#!/bin/sh
set -e

cd /var/www/html

# storage:link: public/storage -> storage/app/public
# アバター（LINE ログイン毎に再生成される揮発データ）の配信リンクを張る
php artisan storage:link --force || true

# 本番キャッシュ最適化（config/route/view）
php artisan config:cache
php artisan route:cache
php artisan view:cache

# CMD（php-fpm -F）へ制御を渡す
exec "$@"
```

> **設計意図**:
>
> - `storage:link` を起動時に張るのは、`config:cache` 等と合わせて「デプロイ時のやり忘れ」を構造的に防ぐため。判断 B により storage は揮発扱いだが、リンク自体は毎回張り直しておくのが安全。
> - `--force` で既存リンクを張り直し、再デプロイでも確実にリンクが有効になる。
> - `config:cache` 等を entrypoint に集約したことで、`deploy.sh` と初回手順が簡潔になり、「キャッシュし忘れ」を構造的に防ぐ。
> - `exec "$@"` により、Dockerfile の `CMD ["php-fpm", "-F"]` がそのまま PID 1 になる（シグナルが正しく php-fpm に届く）。

---

### 2-11. `scripts/backup-db.sh`（判断 D）

**目的は実データの保険ではなく、バックアップ／リストアの一連を一度きちんと経験すること。** ホスト側 cron から日次実行。`mysqldump` を取り、3 世代を超えた古いバックアップを削除する。

```bash
#!/bin/bash
# UchiStock DB バックアップ（ホスト cron から日次実行）
# crontab 例: 0 3 * * *  /path/to/uchistock/scripts/backup-db.sh >> /var/log/uchistock-backup.log 2>&1
set -euo pipefail

cd "$(dirname "$0")/.."

BACKUP_DIR="${UCHISTOCK_BACKUP_DIR:-./backups}"
KEEP_GENERATIONS=3   # 学習目的のため 3 世代で十分（実データの保険が主目的ではない）

mkdir -p "$BACKUP_DIR"

# .env から DB 認証情報を読む
set -a; . ./htdocs/.env; set +a

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTFILE="$BACKUP_DIR/uchistock_${TIMESTAMP}.sql.gz"

echo "==> dump 開始: $OUTFILE"
docker compose -f docker-compose.prod.yml exec -T db \
  mysqldump -u"${DB_USERNAME}" -p"${DB_PASSWORD}" \
  --single-transaction --quick --lock-tables=false \
  "${DB_DATABASE}" | gzip > "$OUTFILE"

echo "==> 古い世代を削除（${KEEP_GENERATIONS} 世代保持）"
ls -1t "$BACKUP_DIR"/uchistock_*.sql.gz 2>/dev/null \
  | tail -n +$((KEEP_GENERATIONS + 1)) \
  | xargs -r rm -v

echo "==> 完了: $(ls -1 "$BACKUP_DIR"/uchistock_*.sql.gz | wc -l) 世代保持中"
```

ホスト側 cron 登録（参考）:

```bash
chmod +x scripts/backup-db.sh
crontab -e
# 毎日 03:00 に実行
# 0 3 * * *  /home/pi/uchistock/scripts/backup-db.sh >> /var/log/uchistock-backup.log 2>&1
```

#### リストア検証（この工程まで実施して初めて「バックアップができた」とみなす）

**バックアップは「戻せることを確認して初めて完成」。** 取得スクリプトを作ったら、必ず一度リストアを通しで検証する。

```bash
# 1. バックアップを取得
./scripts/backup-db.sh

# 2. リストアが「復元」であることを確かめるため、現在の件数を記録し、わざと変更を加える
docker compose -f docker-compose.prod.yml exec -T db \
  mysql -u"$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" \
  -e "SELECT COUNT(*) AS before FROM items;"
#    → 例：アイテムを1件削除するなどして状態を変える

# 3. 最新バックアップからリストア
LATEST=$(ls -1t backups/uchistock_*.sql.gz | head -1)
gunzip < "$LATEST" | docker compose -f docker-compose.prod.yml exec -T db \
  mysql -u"$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE"

# 4. バックアップ時点の状態に戻っていることを確認
docker compose -f docker-compose.prod.yml exec -T db \
  mysql -u"$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" \
  -e "SELECT COUNT(*) AS after FROM items;"
```

**合格基準**: 手順 2 で加えた変更が手順 3 のリストア後に消え、`before` と `after` の件数が一致すること。一度確認できたら仕組みは機能していると判断してよい。

> **設計意図（学習ポイント）**:
>
> - バックアップ設計は「取る設計」と「戻す設計」がセットで初めて完成する。取得スクリプトだけ作って満足するのが最も多い失敗。この指示書はリストア検証を必須工程に含める。
> - バックアップ専用コンテナは常駐させず、**ホスト cron ＋ `docker compose exec`** で済ませる。ラズパイのリソースを食わず、仕組みも単純。
> - `--single-transaction` で InnoDB を無停止・整合性を保ってダンプ。
> - 世代数 3・保存先 SD カード（`./backups`）で構わない。**今回の主目的はデータ保護ではなく仕組みの経験**のため。実データ保護が本番要求になったら、保持期間は「障害に気づくまでの日数」から逆算し、保存先は外部媒体（3-2-1 ルール）へ退避する（§7-D）。

---

## 3. 初回デプロイ手順（ラズパイ上）

```bash
# 1. リポジトリ取得
git clone <repo> uchistock && cd uchistock

# 2. 本番 .env 作成
cp htdocs/.env.production.example htdocs/.env
#   → APP_KEY / DB_PASSWORD / APP_URL / LINE_* を埋める
docker compose -f docker-compose.prod.yml build   # 先にビルド
#   APP_KEY 生成:
docker compose -f docker-compose.prod.yml run --rm app php artisan key:generate --show
#   → 出力を htdocs/.env の APP_KEY に貼る

# 3. 起動
docker compose -f docker-compose.prod.yml up -d

# 4. 初回マイグレーション（seed が必要なら --seed）
docker compose -f docker-compose.prod.yml exec -T app php artisan migrate --force

# 5. キャッシュ最適化
docker compose -f docker-compose.prod.yml exec -T app php artisan config:cache
docker compose -f docker-compose.prod.yml exec -T app php artisan route:cache
docker compose -f docker-compose.prod.yml exec -T app php artisan view:cache

# 6. cloudflared をホストで起動（§2-9）

# 7. ブラウザで https://<your-tunnel-domain> を開き動作確認
```

---

## 4. 検証チェックリスト

- [ ] `docker compose -f docker-compose.prod.yml ps` で db / redis / app / web が Up
- [ ] `docker compose -f docker-compose.prod.yml exec app php -m | grep -i xdebug` が**空**（xdebug が入っていない）
- [ ] `docker compose -f docker-compose.prod.yml exec app php -i | grep display_errors` が **Off**
- [ ] ホスト `curl -I http://127.0.0.1:8080` が 200/302 を返す
- [ ] `curl` で外部から DB ポートに到達**できない**（3306 が外部公開されていない）
- [ ] `https://<your-tunnel-domain>` でトップページ表示
- [ ] LINE ログインが本番ドメインで成功する（コールバック URL 登録済み）
- [ ] アイテム一覧・ステータス変更・「買った」ワンタップが動作
- [ ] ラズパイ再起動後、`docker compose` と cloudflared が自動復帰する

---

## 5. 実装時に実測で確定する点（設計は済み、値の調整のみ）

> 当初「あとで考える」だった 4 論点（アセット共有・storage 永続化・キュー・バックアップ）は §7 で確定済み。ここに残るのは、実装後に実測しないと最終値が決まらない項目のみ。

1. **`npm run build` が vendor を必要とするか**（Ziggy 等）。不要なら php Dockerfile.prod の frontend ステージの vendor コピー行を削除。nginx Dockerfile.prod の frontend ステージは vendor を持たないので、必要なら合わせて追加。
2. **ARM64 でのビルド時間**。ラズパイ上ビルドが重い場合は、開発機で `docker buildx` により ARM64 イメージをクロスビルドして持ち込む。§7-A 補足の「単一ビルダー共有」最適化も検討。
3. **CSP のドメイン**。`'self'` ベースで足りるか、ブラウザのコンソールで実検証して調整。
4. **`opcache.validate_timestamps = 0`** の副作用：デプロイ後は必ず再ビルド＋recreate（`deploy.sh` が満たす）。

---

## 6. この指示書のスコープ外（今はやらない・ただし設計は決めた）

- **FrankenPHP / Octane への移行**（Nginx 存置で十分。Phase 2 でコンテナ削減したくなったら検討）
- **CI/CD パイプライン化**（Phase 1 は手動 `deploy.sh` で十分）
- **キュー / スケジューラの常駐**（§7-C に将来構成を明記。購入周期推定機能の実装時に追加）
- **複数プロジェクト同居のリバースプロキシ集約**（ラズパイ共用サーバー化する場合の Phase 2 テーマ）
- **監視・アラート・ログ集約**

---

## 7. 確定した 4 設計判断の詳細

### 7-A. アセット共有：volume 共有 → 両イメージへ焼き込み

**問題**: Nginx（静的配信）と PHP-FPM（アプリ）が同じ `public/build` を参照する必要がある。当初案の named volume 共有は、空 volume にのみイメージ内容がコピーされる Docker の初期化挙動に依存し、再デプロイでアセットが古いまま残る事故が起きやすい。

**確定**: app・web の**両イメージが、同一定義の `frontend` ビルドステージから `public/build` を焼き込む**（§2-1・§2-5）。単一のビルド成果物由来なので不整合は構造的に発生しない。`deploy.sh` の volume 削除という壊れやすい回避策も不要。

**トレードオフと補足**: `npm run build` が app 用・web 用で 2 回走る。ラズパイでは無視できない時間になり得る。

**現時点の決定（2026-07-28）**: **別々ステージ方式のまま進める**。理由は、ラズパイでの `npm run build` の所要時間が未実測で、統合の必要性を判断する材料がないため。まず実測し、問題が出たら対応する（「推測より計測」）。この方式は 1 ファイルで完結し可読性が高く、マルチステージビルドの学習にも適している。

**統合（単一ビルダー共有）への切り替え基準**: 次のいずれかが起きたら統合を検討する。

- デプロイ 1 回の総ビルド時間が許容を超える（体感の目安：毎回のデプロイが億劫になる長さ。実測して判断）。
- フロントのビルド定義（Node バージョン・ビルドコマンド等）を変更する頻度が上がり、php 側・nginx 側 2 箇所の重複メンテがミスを生むようになった。

**切り替え時にやること（将来の自分への手順メモ）**:

- 1 つの「builder」ステージで `vendor` と `public/build` を作る。app イメージはそこから両方を、web イメージは `public/build` を、それぞれ `COPY --from=builder` で取得する統合 Dockerfile にする。ビルドは 1 回で済む。
- 統合方式は別々方式の上位互換（ビルドが速く重複がない）で、機能的な劣化はない。唯一のコストは可読性がやや下がること。
- 切り替えは Dockerfile の書き換えのみで、compose や他ファイルへの影響はない（アセットの焼き込み先は変わらないため）。

### 7-B. storage：ユーザーデータは揮発扱い、永続化しない

**問題（当初想定）**: コード焼き込み方式では、デプロイのたびにイメージが作り直され、`storage/app` に保存したファイルが消える。実装調査で `SocialiteLoginController` がアバター画像を `Storage::disk('public')`（＝`storage/app/public/users/{id}/*.webp`）に保存していることを確認した。

**確定（再調査で方針変更）**: このアバターは **LINE ログインのたびに再取得・再生成される**（ログイン処理内で既存を削除して作り直す）。つまり消えても次のログインで自動的に復元される揮発データであり、**永続化は不要**。

- `storage` 配下は一切 named volume で永続化しない。app / web に storage volume をマウントしない。
- `storage/framework`（キャッシュ・コンパイル済みビュー）と `storage/logs` も同様に永続化しない。コンテナ再生成で消えて健全。
- `php artisan storage:link --force` は entrypoint で起動時に張る（§2-10）。リンク自体は配信のため必要だが、リンク先は揮発データ。
- アバターの配信は PHP 経由で足りる（Nginx が静的直配信する必要はない）。実装後に「LINE ログイン→アバター表示」を検証（§4）。

**この変更の効果**: storage volume の共有・読み取り専用マウント・権限補正がすべて不要になり、compose と entrypoint が簡素化された。永続化対象は `mysql_data_prod` と `redis_data_prod` の 2 つだけ。

### 7-C. キュー / スケジューラ：Phase 1 は sync、将来構成は確定済み

**確定（今）**: `QUEUE_CONNECTION=sync`。worker / scheduler コンテナは作らない。理由は Phase 1 に非同期・定期処理が存在せず、常駐させてもラズパイのリソースを無駄に消費するだけだから。

**将来構成（購入周期推定機能などで必要になった時に追加する設計）**:

```yaml
# docker-compose.prod.yml に追加する worker（キュー実行）
worker:
  container_name: uchistock-worker-prod
  build: { context: ., dockerfile: ./docker/php/Dockerfile.prod }
  command: php artisan queue:work --sleep=3 --tries=3 --max-time=3600
  environment: [DB_HOST=db, REDIS_HOST=redis, REDIS_PORT=6379]
  depends_on: [db, redis]
  networks: [uchistock_prod_network]
  restart: unless-stopped

# scheduler（cron 相当。「そろそろ無いかも」判定バッチ等）
scheduler:
  container_name: uchistock-scheduler-prod
  build: { context: ., dockerfile: ./docker/php/Dockerfile.prod }
  command: sh -c "while true; do php artisan schedule:run; sleep 60; done"
  environment: [DB_HOST=db, REDIS_HOST=redis, REDIS_PORT=6379]
  depends_on: [db, redis]
  networks: [uchistock_prod_network]
  restart: unless-stopped
```

追加時は `QUEUE_CONNECTION=redis` に切り替える。entrypoint（config:cache 等）は worker/scheduler では不要なので、これらは entrypoint をバイパスする（`entrypoint: []` を指定するか、command 前に明示）。

### 7-D. DB バックアップ：学習目的で取得〜リストア検証まで一度通す

**位置づけ**: このプロジェクトは個人利用でバックアップの実運用要求はない。あえて設ける目的は、**バックアップ取得とリストアの一連を一度きちんと経験しておくこと**。データ保護そのものが目的ではない（検証の核心である「確認回数の記録・習慣継続の記録」は DB の中身とは別に手元に残るため、DB 消失は検証を無に帰さない）。

**確定**: `scripts/backup-db.sh`（§2-11）をホスト cron で日次実行。`--single-transaction` で整合性を保ってダンプし gzip 圧縮、**3 世代保持**。バックアップ専用コンテナは常駐させない。**取得スクリプトを作るだけで終わらせず、§2-11 のリストア検証手順を一度通して「戻せること」を確認するところまでを完了条件とする**。

**バックアップ設計の型（学習の一般化・要求が来たとき逆算する 4 問）**:

1. **頻度（RPO）**: 「何時間前の状態まで戻れれば許容できるか」。UchiStock は更新が少なく日次で十分。
2. **保持期間**: 「障害に気づくまでの日数」から逆算する。今回は学習目的なので 3 世代。実要求が「1 週間」なら日次 7 世代。
3. **保存先の独立性（3-2-1 ルール）**: 元データと同時に失われない場所へ。SD カードに DB とバックアップを同居させても故障で共倒れ。実要求時は USB / クラウドへ退避。今回は学習目的のため SD 上（`./backups`）で可。
4. **リストア検証**: 取ったバックアップは戻せて初めて完成。定期的に（最低一度）リストアを試す。← この工程を必ず含めるのが本設計の眼目。

> 実データ保護が本番要求になった際は、上の 4 問を埋め直す：保持期間を要求日数に、保存先を外部媒体（`UCHISTOCK_BACKUP_DIR`）に、リストア検証を定期化する。仕組み（cron ＋ mysqldump ＋ 世代管理 ＋ リストア）はそのまま流用できる。

---

## 6. この指示書のスコープ外（今はやらない）

- FrankenPHP / Octane への移行（Nginx 存置で十分）
- CI/CD パイプライン化（Phase 1 は手動 `deploy.sh` で十分）
- 複数プロジェクト同居のためのリバースプロキシ集約（ラズパイを共用サーバー化する場合の Phase 2 テーマ）
- 監視・アラート・ログ集約

---

## 実装順序（Claude Code 向け推奨）

1. §2-2 `php.prod.ini` → §2-4 `nginx.prod.conf` → §2-3 `default.prod.conf`（設定ファイル 3 点を先に）
2. §2-10 `entrypoint.prod.sh`（php イメージが参照するので Dockerfile より前に用意）
3. §2-1 `Dockerfile.prod`（php）→ §2-5 `Dockerfile.prod`（nginx）
4. §2-6 `docker-compose.prod.yml`
5. §2-7 `.env.production.example`
6. §2-8 `deploy.sh` ＋ §2-11 `scripts/backup-db.sh`（実行権限 `chmod +x` を両方に付与）
7. ローカル（開発機）で `docker compose -f docker-compose.prod.yml build` が通ることまで確認
8. §5 の実測項目（vendor 要否・ビルド時間・CSP）を潰す
9. §2-9 の内容を参考に、ラズパイ上で cloudflared の systemd ユニットを直接作成（リポジトリには含めない）

> すべて新規ファイル。既存の `docker-compose.yml`・`docker/**/Dockerfile`・`php.ini`・`nginx.conf`・`default.conf` は**編集しないこと**。
>
> 実行権限が必要なファイル: `deploy.sh`、`scripts/backup-db.sh`、`docker/php/entrypoint.prod.sh`（Dockerfile 内で `chmod +x` 済みだがリポジトリ上でも付与推奨）。
