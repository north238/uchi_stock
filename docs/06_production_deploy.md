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
- **B. storage 揮発扱い**：アバター画像は `Storage::disk('public')` に保存されるが、**LINE ログインのたびに再取得・再生成される**実装のため、消えても次のログインで復元される。よって**バックアップ対象には含めない（named volume によるバックアップ・永続化は不要）**。ただし、Nginx は `.webp` 等の画像拡張子を静的ファイルとして直接配信する設定（`docker/nginx/default.prod.conf`）のため PHP には渡らず、**app と web の間で `storage/app/public` の実体を volume で共有する必要がある**（2026-08-02 訂正。詳細は §7-B）。`public/storage` シンボリックリンクは両コンテナに必要（app は起動時に `storage:link`、web はビルド時に手動で作成）。
- **C. キュー / スケジューラ**：Phase 1 は非同期処理を持たないため **`QUEUE_CONNECTION=sync` のまま、worker / scheduler コンテナは作らない**。将来（購入周期推定機能）追加時の構成は §7-C に設計として明記済み。
- **D. DB バックアップ（学習目的）**：実データの保険としてではなく**バックアップ／リストアを一度きちんと経験すること**を目的に据える。**ホスト側 cron で日次 `mysqldump` ＋ 3 世代保持、かつリストア手順を検証まで行う**（§7-D）。個人利用ゆえ保険としての要求はないが、取得〜復元の一連を通す価値を優先。

---

## 1. 作成するファイル一覧

すべて**新規作成**。既存ファイルは編集しない。

| #   | パス                               | 目的                                                                                            |
| --- | ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| 1   | `docker/Dockerfile.prod`           | **統合**。`vendor`／`frontend` ビルドステージを共有し、`php-fpm`・`nginx` の 2 ターゲットを定義 |
| 2   | `docker/php/php.prod.ini`          | 本番用 PHP 設定。`display_errors=off`・opcache 本番最適化・xdebug なし                          |
| 3   | ~~`docker/nginx/Dockerfile.prod`~~ | **廃止**（#1 に統合。削除済み）                                                                 |
| 4   | `docker/nginx/default.prod.conf`   | 本番用サーバー設定（`default.conf` を流用）                                                     |
| 5   | `docker/nginx/nginx.prod.conf`     | 本番用グローバル設定。**CSP を本番ドメイン向けに修正**                                          |
| 6   | `docker-compose.prod.yml`          | 本番用 compose。ポート非公開・bind mount なし                                                   |
| 7   | `htdocs/.env.production.example`   | 本番 `.env` の雛形                                                                              |
| 8   | `deploy.sh`                        | 更新デプロイを 1 コマンド化                                                                     |
| 9   | `scripts/backup-db.sh`             | DB 日次バックアップ＋世代管理（ホスト cron から実行）                                           |
| 10  | `docker/php/entrypoint.prod.sh`    | 起動時に `storage:link`・キャッシュ最適化を実行するエントリポイント                             |

> `cloudflared/uchistock.service.example`（トークン方式の systemd ユニット雛形）はこの一覧から除外している。§2-9 の通り不採用となり、実ファイルは作成しない（参考コードのみ <details> 内に残す）。

---

## 2. 各ファイルの実装

### 2-1. `docker/Dockerfile.prod`（統合・app と web を 1 ファイルで定義）

> **2026-07-31 改訂**：当初は php 用・nginx 用に Dockerfile を分けていたが、実測により **`npm run build` が `vendor` を必要とする**（Ziggy が composer パッケージのため）ことが判明。分離したままでは nginx 側にも vendor ステージが必要になり、`apk add`（ARM 上で約 584 秒）とフロントビルドが二重に走る。よって**単一 Dockerfile に統合**し、`vendor` / `frontend` ステージを両イメージで共有する（判断 A の切り替え・§7-A 参照）。

方針:

- **xdebug を削除**（`pecl install` と `docker-php-ext-enable` から除外）
- **マルチステージ**：`vendor`（composer 依存）と `frontend`（Vite ビルド）を**各 1 回だけ**実行し、`php-fpm` / `nginx` の両最終ステージがその成果物を `COPY --from` で取得する
- compose 側から `target:` で作り分ける（§2-6）
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
# 【必須】vendor を入れること。Ziggy（tightenco/ziggy）は composer パッケージで、
# tsc が ../../vendor/tightenco/ziggy を型解決に使うため、無いと TS2307 でビルド失敗する。
FROM node:18-alpine AS frontend
WORKDIR /app
COPY ./htdocs/package.json ./htdocs/package-lock.json ./
RUN npm ci
COPY ./htdocs ./
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

# ---- Final stage: 本番 Nginx ----
FROM nginx:stable-alpine AS nginx

WORKDIR /var/www/html

COPY ./docker/nginx/default.prod.conf /etc/nginx/conf.d/default.conf
COPY ./docker/nginx/nginx.prod.conf   /etc/nginx/nginx.conf

# 静的配信対象：public 本体 ＋ 上の frontend ステージのビルド成果物
COPY ./htdocs/public /var/www/html/public
COPY --from=frontend /app/public/build /var/www/html/public/build

RUN adduser -s /bin/sh -D -G www-data www-data 2>/dev/null || true \
    && chown -R www-data:www-data /var/www/html

CMD ["nginx", "-g", "daemon off;"]
```

> **判断 A の要**: `vendor` と `frontend` の 2 ステージは**ビルド全体で 1 回ずつしか走らない**。`php-fpm` と `nginx` の両最終ステージが同じ `frontend` ステージから `public/build` を取得するため、アセットの不整合が構造的に発生せず、volume 共有も不要。
>
> **実測（ARM64・Raspberry Pi）**: 初回フルビルド約 1171 秒。内訳の大半は PHP 拡張のコンパイル（`apk add --virtual .build-deps` 約 882 秒、vendor ステージの `apk add` 約 584 秒）。フロント部分は `npm ci` 約 96 秒＋`npm run build` 約 78 秒。**分離構成のままだとこれらが二重に走るため統合した**。

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

### 2-5. ~~`docker/nginx/Dockerfile.prod`~~ → **廃止（§2-1 に統合）**

**2026-07-31 改訂により削除。** Nginx イメージは §2-1 の統合 Dockerfile の `nginx` ステージとして定義する。旧 `docker/nginx/Dockerfile.prod`・`docker/php/Dockerfile.prod` は §2-1 の `docker/Dockerfile.prod` への統合に伴い**削除済み**。

> **なぜ分離をやめたか**: 分離構成では nginx 用 Dockerfile にも `frontend` ステージが必要だが、`npm run build` は `vendor`（Ziggy）を要求するため、nginx 側にも `vendor` ステージを持たせる必要が生じる。すると ARM 上で約 584 秒かかる `apk add` とフロントビルドが二重に走り、コストが許容範囲を超える。§7-A に記録した「切り替え基準」に該当したため統合した。
> **`storage/app/public`（アバター画像）の配信について（判断 B・2026-08-02 訂正）**:
> 当初「Nginx が静的に直接配信する必要がある場合のみ storage の共有が要るが、Phase 1 では PHP 経由配信で問題ない」としていたが、これは誤りだった。`docker/nginx/default.prod.conf` の静的ファイル用 `location` ブロックは `.webp` 等の画像拡張子を **Nginx が直接ファイルシステムから配信**する設定であり、PHP には一切渡らない。したがって web（Nginx）コンテナ側にも `storage/app/public` の実体と `public/storage` シンボリックリンクが必要。対応: `docker/Dockerfile.prod` の `nginx` ステージに `ln -sfn` でシンボリックリンクを追加し、`docker-compose.prod.yml` に `storage_public` volume を新設して app/web 間で実体を共有する（詳細は §7-B）。実装後にアバターが表示されるかを検証（§4 チェックリスト）。

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
    healthcheck:
      test:
        [
          'CMD-SHELL',
          'mysqladmin ping -h 127.0.0.1 -u"$$MYSQL_USER" -p"$$MYSQL_PASSWORD" --silent',
        ]
      interval: 5s
      timeout: 5s
      retries: 20
      start_period: 30s

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
      dockerfile: ./docker/Dockerfile.prod
      target: php-fpm # 統合 Dockerfile の php-fpm ステージ
    # 本番イメージには .env を焼き込まない（.dockerignore で除外）。
    # ラズパイ上の htdocs/.env を起動時に環境変数として注入する。
    env_file:
      - ./htdocs/.env
    environment:
      - DB_HOST=db
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    # 判断 B: アバターは LINE ログイン毎に再生成される揮発データのため永続化 volume なし
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - uchistock_prod_network
    restart: unless-stopped

  web:
    container_name: uchistock-web-prod
    build:
      context: .
      dockerfile: ./docker/Dockerfile.prod
      target: nginx # 統合 Dockerfile の nginx ステージ
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

> ### ⚠ 最重要：すべての compose コマンドに `--env-file ./htdocs/.env` を付けること
>
> `db` サービスの `${DB_DATABASE}` 等は **compose ファイル自身の変数展開**であり、`env_file:`（コンテナへの環境変数注入）とは別物。Compose が変数展開に使う `.env` は**プロジェクトルート**のものなので、`htdocs/.env` は自動では読まれない。
>
> ```bash
> docker compose --env-file ./htdocs/.env -f docker-compose.prod.yml <command>
> ```
>
> **付け忘れると起きること**（実際に発生）:
>
> - ルートに `.env`（開発用）があると**黙ってそれが使われ**、開発用の DB 名／パスワードで MySQL が初期化される
> - ルートに `.env` が無い場合は `The "DB_DATABASE" variable is not set` の警告が出て、MySQL は `MYSQL_ROOT_PASSWORD` 空で起動失敗する
>
> **MySQL の初期化は volume 作成時の 1 回だけ**。誤った値で初期化してしまったら、volume を作り直す以外に修正できない:
>
> ```bash
> docker compose --env-file ./htdocs/.env -f docker-compose.prod.yml down
> docker volume rm uchi_stock_mysql_data_prod   # 名前は docker volume ls で確認
> docker compose --env-file ./htdocs/.env -f docker-compose.prod.yml up -d
> ```
>
> **推奨**: ラズパイ上ではプロジェクトルートの `.env` を退避する（`mv .env .env.dev.bak`）。付け忘れた際に「静かに開発用設定で動く」のではなく「警告が出て失敗する」ようになり、事故に気づける。`deploy.sh` / `scripts/backup-db.sh` 内の compose 呼び出しにも `--env-file` を入れること。
> **ポイント**:
>
> - `web` の `ports` は `127.0.0.1:8080:80`。**ホストのローカルにのみ**バインドし、外部 NIC には晒さない。cloudflared が `localhost:8080` を叩く。
> - 開発用 compose の `networks: external: true` と異なり、本番は自前で bridge ネットワークを作る（`external` にしない）。
> - **`build_assets` volume は廃止**（判断 A）。`public/build` は app / web の各イメージに焼き込み済みなので volume 共有は不要。
> - **`storage_public` volume を新設**（判断 B・2026-08-02 訂正）。app/web 間で `storage/app/public`（アバター画像の実体）を共有するための volume で、**永続化・バックアップが目的ではない**（アバターは LINE ログイン毎に再生成される揮発データのため）。app は読み書き、web は読み取り専用（`:ro`）でマウントする。
> - 永続化・バックアップ対象の volume は引き続き `mysql_data_prod`（DB 実体）と `redis_data_prod`（セッション・キャッシュ）のみ。`storage_public` はコンテナ間共有専用でバックアップ対象に含めない。デプロイでコンテナを作り直しても `mysql_data_prod`/`redis_data_prod` は残るため、DB データは無傷。

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

COMPOSE="docker compose --env-file ./htdocs/.env -f docker-compose.prod.yml"

echo "==> git pull"
git pull origin main

echo "==> デプロイ前 DB バックアップ"
./scripts/backup-db.sh || echo "warn: バックアップに失敗（デプロイは継続）"

echo "==> イメージ再ビルド（public/build は app/web 各イメージに焼き込まれる）"
$COMPOSE build

echo "==> コンテナ起動（DB の healthcheck 通過を待ってから app が起動する）"
# 判断 A: アセットはイメージ内に焼き込み済みのため volume 削除の小細工は不要。
# opcache.validate_timestamps=0 のため、再ビルド＋recreate で確実に新コードへ差し替わる。
$COMPOSE up -d --force-recreate

echo "==> マイグレーション"
$COMPOSE exec -T app php artisan migrate --force

echo "==> 完了"
```

> - `migrate --force` は本番で対話プロンプトを飛ばすため必須。
> - `storage:link` と `config/route/view:cache` は **entrypoint（§2-11）が起動ごとに実行**するので deploy.sh からは外した。`.env` 変更もコンテナ再起動で確実に反映される。
> - デプロイ前に必ず DB バックアップを取る（§7-D）。
> - **DB 起動待ち**: `depends_on` だけでは MySQL の接続受付を待たない（§5 参照）。`up -d --force-recreate` で db も作り直されるため、db の healthcheck が `healthy` になるまで app の起動が待機し、その後にマイグレーションを実行する。待機ループを deploy.sh 側に書く必要はない。

---

### 2-9. cloudflared 設定 → **不採用。`07_cloudflare_tunnel.md` を参照**

> **2026-07-30 追記**: 以下のトークン方式は**採用しなかった**。ラズパイに既存トンネル `pi-tunnel` がローカル管理方式（`/etc/cloudflared/config.yml`）で稼働していたため、そこに ingress ルールを追記する方式で実施し、疎通確認まで完了済み。**実際の手順は `07_cloudflare_tunnel.md` にまとめてあるが、トンネル設定・ホスト固有情報を含むためリポジトリにはコミットせず、リポジトリ外（本人の手元）で個別管理している。** 以下は参考として残す。

<details>
<summary>不採用となったトークン方式（参考）</summary>

#### `cloudflared/uchistock.service.example`（ホスト側 systemd）

cloudflared は**コンテナではなくホストで** systemd 常駐。トークンは発行済み。

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

</details>

> **接続の全体像**（方式によらず共通）:
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
# crontab 例: 0 3 * * *  /path/to/uchistock/scripts/backup-db.sh >> /home/pi/uchistock-backup.log 2>&1
set -euo pipefail

cd "$(dirname "$0")/.."

BACKUP_DIR="${UCHISTOCK_BACKUP_DIR:-./backups}"
KEEP_GENERATIONS=3   # 学習目的のため 3 世代で十分（実データの保険が主目的ではない）

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTFILE="$BACKUP_DIR/uchistock_${TIMESTAMP}.sql.gz"

echo "==> dump 開始: $OUTFILE"
# DB認証情報はホスト側で.envを読まず、dbコンテナに注入済みの環境変数（MYSQL_USER等）を使う
# --no-tablespaces: MySQL 8 系で PROCESS 権限のないユーザーでも dump できるようにする
# MYSQL_PWD: コマンドライン引数にパスワードを載せない（"Using a password..." 警告の抑制）
docker compose --env-file ./htdocs/.env -f docker-compose.prod.yml exec -T db sh -c \
  'MYSQL_PWD="$MYSQL_PASSWORD" mysqldump -u"$MYSQL_USER" --no-tablespaces --single-transaction --quick --lock-tables=false "$MYSQL_DATABASE"' \
  | gzip > "$OUTFILE"

# ダンプの妥当性チェック（不完全なダンプでローテーションが走り、正常世代を失う事故を防ぐ）
gzip -t "$OUTFILE"
zcat "$OUTFILE" | tail -1 | grep -q "Dump completed" || {
  echo "==> エラー: ダンプが不完全のため中断（$OUTFILE を削除）"
  rm -f "$OUTFILE"
  exit 1
}
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
# 0 3 * * *  /home/pi/uchistock/scripts/backup-db.sh >> /home/pi/uchistock-backup.log 2>&1
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

# 4. 初回マイグレーション
docker compose -f docker-compose.prod.yml exec -T app php artisan migrate --force

# 4-1. マスタデータ投入（初回のみ・`--seed`は使わない）
#   `migrate --seed` は DatabaseSeeder 全体（UserSeeder/ItemSeeder の開発用テストデータ含む）を
#   本番に投入してしまうため使用しない。マスタ系シーダーのみ個別に実行する。
#   RolesTableSeeder / ColorsTableSeeder はどちらも id を明示した insert で冪等ではないため、
#   再実行すると主キー重複で失敗する。deploy.sh には含めず、初回のみ手動実行とする。
#   ColorsTableSeeder を投入しないと、ジャンル新規作成時に colors への外部キー制約違反で失敗する。
docker compose --env-file ./htdocs/.env -f docker-compose.prod.yml exec -T app \
  php artisan db:seed --class=RolesTableSeeder --force
docker compose --env-file ./htdocs/.env -f docker-compose.prod.yml exec -T app \
  php artisan db:seed --class=ColorsTableSeeder --force

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
- [ ] `app/Http/Middleware/TrustProxies.php` の `$proxies` が `'*'` になっている（Cloudflare Tunnel構成で必須。§5-5参照）
- [ ] 本番ハードニング時は TrustProxies 設定（`$proxies = '*'`, 設定済み）を前提に `SESSION_SECURE_COOKIE=true` を有効化する（本チェックリストでは有効化しない、追記のみ。詳細は `docs/10_line_login_standalone_fix.md`）

---

## 5. 実装時に実測で確定する点（設計は済み、値の調整のみ）

> 当初「あとで考える」だった 4 論点（アセット共有・storage 永続化・キュー・バックアップ）は §7 で確定済み。ここに残るのは、実装後に実測しないと最終値が決まらない項目のみ。

1. ~~**`npm run build` が vendor を必要とするか**~~ → **確定（2026-07-31）：必要**。Ziggy は composer パッケージ（`tightenco/ziggy`）で、`tsc` が `../../vendor/tightenco/ziggy` を型解決に使う。無いと `TS2307: Cannot find module` でビルド失敗。frontend ステージへの vendor コピーは**必須**。
2. ~~**ARM64 でのビルド時間**~~ → **実測（2026-07-31）：初回フルビルド約 1171 秒**。内訳は PHP 拡張コンパイルが支配的（`apk add --virtual .build-deps` 約 882 秒、vendor ステージ 約 584 秒）、フロントは `npm ci` 約 96 秒＋`npm run build` 約 78 秒。この結果を受けて **Dockerfile を統合**（§7-A）。以降の再ビルドは拡張コンパイルがレイヤーキャッシュに乗るため大幅に短縮される見込み（要実測）。なお開発機で `docker buildx` によるクロスビルドに切り替える案は引き続き有効（Phase 2 検討）。
3. **CSP のドメイン**。`'self'` ベースで足りるか、ブラウザのコンソールで実検証して調整。
4. **`opcache.validate_timestamps = 0`** の副作用：デプロイ後は必ず再ビルド＋recreate（`deploy.sh` が満たす）。
5. **TrustProxies の設定**（Cloudflare Tunnel 構成で必須）。`app/Http/Middleware/TrustProxies.php` の `$proxies` が未設定（null）だと `X-Forwarded-Proto: https` が無視され、Laravel が自身を HTTP と誤認する。結果として `asset()`／`route()` が `http://` を生成し Mixed Content、リダイレクトが http に落ちる、`session.cookie_secure=On` のため Cookie が送られずセッション／CSRF が壊れる、といった原因の分かりにくい不具合が出る。
   - **対処**: `protected $proxies = '*';`
   - **`'127.0.0.1'` では効かない**：PHP-FPM から見た接続元は cloudflared ではなく **Nginx コンテナ**であり、クライアント IP は Docker ブリッジのゲートウェイ（`172.x.x.1` 等）になるため。
   - `'*'` が妥当な理由：`web` は `127.0.0.1:8080` にのみバインドされ外部から直接叩けないため、ヘッダーを偽装できる第三者の経路が存在しない。
6. **DB 起動待ち**: `depends_on` だけでは MySQL の接続受付を待たない。`--force-recreate` で db を作り直すデプロイでは、マイグレーションが Connection refused で失敗する。`healthcheck` ＋ `condition: service_healthy` で解決（2026-08-01 対応）。

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

**当初の決定（2026-07-28）**: 別々ステージ方式のまま進める。ラズパイでの `npm run build` の所要時間が未実測で、統合の必要性を判断する材料がなかったため。まず実測し、問題が出たら対応する（「推測より計測」）。

**実測と再判断（2026-07-31）: 統合へ切り替え済み**

実際にラズパイでビルドして、切り替え基準に該当する事象が発生した。

- **判明した事実**: `npm run build` は `vendor` を必要とする。Ziggy は composer パッケージ（`tightenco/ziggy`）で、`tsc` が `../../vendor/tightenco/ziggy` を型解決に使うため。app 側は frontend ステージに vendor をコピーしていたので通ったが、nginx 側は vendor を持たず `TS2307: Cannot find module` で失敗した。
- **分離を維持した場合のコスト**: nginx 側にも `vendor` ステージが必要になる。vendor ステージの `apk add` は ARM 上で約 584 秒かかり、これとフロントビルド（約 174 秒）が二重に走る。当初想定していた「フロントビルド 3 分の重複」より遥かに重い。
- **判断**: 切り替え基準の「2 箇所の重複メンテがミスを生む」に該当。**統合方式（§2-1）へ移行**した。

**統合後の構成**: 単一の `docker/Dockerfile.prod` に `vendor` → `frontend` → （`php-fpm` / `nginx`）の 4 ステージを定義。ビルドステージは各 1 回のみ実行され、両最終ステージが `COPY --from` で成果物を取得する。compose 側は `target:` でイメージを作り分ける。

**この経験からの学び**: 「実測してから判断する」方針は機能した。机上で統合を決めていたら妥当な選択にはなったが、_なぜ_ 統合が必要か（Ziggy の vendor 依存）を理解しないまま進むことになった。逆に分離のまま進めていたら、ビルド時間が二倍以上に膨らむ構成に気づかなかった可能性がある。

### 7-B. storage：ユーザーデータは揮発扱い、ただし配信のため app/web 間で共有は必要

**問題（当初想定）**: コード焼き込み方式では、デプロイのたびにイメージが作り直され、`storage/app` に保存したファイルが消える。実装調査で `SocialiteLoginController` がアバター画像を `Storage::disk('public')`（＝`storage/app/public/users/{id}/*.webp`）に保存していることを確認した。

**確定（再調査で方針変更）**: このアバターは **LINE ログインのたびに再取得・再生成される**（ログイン処理内で既存を削除して作り直す）。つまり消えても次のログインで自動的に復元される揮発データであり、**バックアップ・永続化は不要**（この結論自体は変わらない）。

**不具合発生と訂正（2026-08-02）**: 上記の結論から「storage 周りの volume 共有は一切不要」と拡大解釈し、`public/storage` シンボリックリンクを app コンテナのみに張り、**PHP経由で配信すれば足りる**としていたが、これは誤りだった。

- **症状**: 本番環境で LINE ログイン後、アバター画像が `GET /storage/users/{id}/*.webp` で 404 になる。
- **原因**: `docker/nginx/default.prod.conf` の静的ファイル用 `location ~* \.(css|gif|ico|jpeg|jpg|js|png|svg|webp|woff2)$` ブロックが `.webp` を含む画像拡張子を**Nginx が直接ファイルシステムから配信**する設定になっており、PHP（app コンテナ）には一切リクエストが渡らない。app コンテナには `storage:link` によるシンボリックリンクと実体があるが、web（Nginx）コンテナには `public/storage` シンボリックリンクも `storage/app/public` の実体も存在しないため、Nginx がパスを解決できず 404 になる。
- **訂正した設計**:
  - `docker/Dockerfile.prod` の `nginx` ステージに `RUN ln -sfn /var/www/html/storage/app/public /var/www/html/public/storage` を追加し、web コンテナにもシンボリックリンクを作成する。
  - `docker-compose.prod.yml` に `storage_public` という名前の volume を新設し、`app`（読み書き）・`web`（読み取り専用 `:ro`）の両方で `storage/app/public` にマウントして実体を共有する。
  - **この volume の位置づけ**: 目的は永続化ではなく **app/web 間のファイル共有**。アバールが揮発データであるという性質・バックアップ対象外という結論は変わらない。

- `storage/framework`（キャッシュ・コンパイル済みビュー）と `storage/logs` は引き続き永続化しない（`storage_public` の共有範囲は `storage/app/public` のみ）。コンテナ再生成で消えて健全。
- `php artisan storage:link --force` は app コンテナで entrypoint が起動時に張る（§2-10）。web コンテナはビルド時にシンボリックリンクを作成済みのため、追加の起動時処理は不要。

**この変更の効果**: アバター画像が Nginx 経由で正しく配信されるようになる。`storage_public` volume はコンテナ間共有専用でバックアップ対象には含めない。バックアップ・永続化対象は引き続き `mysql_data_prod` と `redis_data_prod` の 2 つ。

**この経験からの学び**: 「Nginx が静的直接配信する場合のみ共有が必要」という条件を認識していながら、実際の `default.prod.conf` の `location` ブロック設定（画像拡張子は静的配信）を確認せずに「Phase 1 では PHP 経由配信で問題ない」と判断してしまった。設計判断の前提条件（この場合は Nginx の実際のルーティング設定）は、思い込みではなく該当する設定ファイルを直接確認してから判定すべきだった。

### 7-C. キュー / スケジューラ：Phase 1 は sync、将来構成は確定済み

**確定（今）**: `QUEUE_CONNECTION=sync`。worker / scheduler コンテナは作らない。理由は Phase 1 に非同期・定期処理が存在せず、常駐させてもラズパイのリソースを無駄に消費するだけだから。

**将来構成（購入周期推定機能などで必要になった時に追加する設計）**:

```yaml
# docker-compose.prod.yml に追加する worker（キュー実行）
worker:
  container_name: uchistock-worker-prod
  build: { context: ., dockerfile: ./docker/Dockerfile.prod, target: php-fpm }
  command: php artisan queue:work --sleep=3 --tries=3 --max-time=3600
  environment: [DB_HOST=db, REDIS_HOST=redis, REDIS_PORT=6379]
  depends_on: [db, redis]
  networks: [uchistock_prod_network]
  restart: unless-stopped

# scheduler（cron 相当。「そろそろ無いかも」判定バッチ等）
scheduler:
  container_name: uchistock-scheduler-prod
  build: { context: ., dockerfile: ./docker/Dockerfile.prod, target: php-fpm }
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

## 実装順序（Claude Code 向け推奨）

1. §2-2 `php.prod.ini` → §2-4 `nginx.prod.conf` → §2-3 `default.prod.conf`（設定ファイル 3 点を先に）
2. §2-10 `entrypoint.prod.sh`（Dockerfile が参照するので先に用意）
3. §2-1 `docker/Dockerfile.prod`（**統合**。旧 `docker/php/Dockerfile.prod`・`docker/nginx/Dockerfile.prod` は削除）
4. §2-6 `docker-compose.prod.yml`（`target:` 指定・`env_file:` 追加）
5. §2-7 `.env.production.example`
6. §2-8 `deploy.sh` ＋ §2-11 `scripts/backup-db.sh`（**compose 呼び出しに `--env-file ./htdocs/.env` を入れる**・`chmod +x` を両方に付与）
7. §5-5 TrustProxies の修正（`$proxies = '*'`）
8. cloudflared 設定 → **`07_cloudflare_tunnel.md`（リポジトリ外で個別管理・非コミット）を参照**（既存 `pi-tunnel` の `config.yml` に ingress 追記する方式で実施済み。§2-9 のトークン方式は不採用）
9. §5 の残項目（CSP）を実機で潰す

> すべて新規ファイル。既存の `docker-compose.yml`・`docker/**/Dockerfile`・`php.ini`・`nginx.conf`・`default.conf` は**編集しないこと**。
>
> 実行権限が必要なファイル: `deploy.sh`、`scripts/backup-db.sh`、`docker/php/entrypoint.prod.sh`（Dockerfile 内で `chmod +x` 済みだがリポジトリ上でも付与推奨）。
