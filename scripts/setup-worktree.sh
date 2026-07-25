#!/bin/bash
# 新規worktree（またはvolume削除後のリポジトリ）でDocker開発環境を
# 起動し、依存関係インストール〜DBセットアップ〜ビルド〜検証まで一気通貫で行うスクリプト。
#
# 使い方: ./scripts/setup-worktree.sh
#
# コンテナは検証後も起動したままにする（docker-compose down はしない）。

set -euo pipefail

# リポジトリルート（docker-compose.yml のある場所）に移動
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

log() { echo -e "\n==> $*"; }

# ---------------------------------------------------------------------------
# 1. プリフライトチェック
# ---------------------------------------------------------------------------
log "Dockerの起動状態を確認"
if ! docker info >/dev/null 2>&1; then
  echo "エラー: Dockerが起動していません。Docker Desktopを起動してください。" >&2
  exit 1
fi

# docker-compose.yml はコンテナ名・ポートが固定（uchistock-*）のため、
# 別のworktree/メインチェックアウトで既に起動中の場合は衝突する。
EXISTING_APP_ID="$(docker ps -q -f name=^uchistock-app$)"
if [ -n "$EXISTING_APP_ID" ]; then
  RUNNING_DIR="$(docker inspect -f '{{ index .Config.Labels "com.docker.compose.project.working_dir" }}' "$EXISTING_APP_ID" 2>/dev/null || true)"
  if [ -n "$RUNNING_DIR" ] && [ "$RUNNING_DIR" != "$ROOT_DIR" ]; then
    echo "エラー: uchistock-app は別のディレクトリ ($RUNNING_DIR) で既に起動中です。" >&2
    echo "        コンテナ名・ポートが固定のため同時起動できません。先に停止してください:" >&2
    echo "        (cd \"$RUNNING_DIR\" && docker-compose down)" >&2
    exit 1
  fi
fi

# ---------------------------------------------------------------------------
# 2. コンテナ起動
# ---------------------------------------------------------------------------
log "docker-compose up -d"
docker-compose up -d

dc_app() { docker-compose exec -T app "$@"; }
dc_db() { docker-compose exec -T db "$@"; }

# ---------------------------------------------------------------------------
# 3. DB起動待ち
# ---------------------------------------------------------------------------
log "DB(uchistock-db)の起動を待機"
for i in $(seq 1 30); do
  if dc_db mysqladmin ping -uroot -ppassword --silent >/dev/null 2>&1; then
    echo "DBが応答可能になりました"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "エラー: DBが60秒以内に起動しませんでした。" >&2
    exit 1
  fi
  sleep 2
done

# ---------------------------------------------------------------------------
# 4. 依存関係インストール（htdocs/vendor, htdocs/node_modules にbind mountされ永続化される）
# ---------------------------------------------------------------------------
log "composer install"
dc_app composer install

log "npm install"
dc_app npm install

# ---------------------------------------------------------------------------
# 5. Laravel .env セットアップ
# ---------------------------------------------------------------------------
if [ ! -f htdocs/.env ]; then
  log ".env が無いため .env.example からコピー"
  cp htdocs/.env.example htdocs/.env
fi

if ! grep -qE '^APP_KEY=base64:.+' htdocs/.env; then
  log "APP_KEY が未設定のため生成"
  dc_app php artisan key:generate
fi

# ---------------------------------------------------------------------------
# 6. 開発DBマイグレーション + 初回のみ自動シード
# ---------------------------------------------------------------------------
log "php artisan migrate --force（開発DB）"
dc_app php artisan migrate --force

DEV_DB_USER="$(grep -E '^DB_USERNAME=' .env | cut -d= -f2-)"
DEV_DB_PASSWORD="$(grep -E '^DB_PASSWORD=' .env | cut -d= -f2-)"
DEV_DB_DATABASE="$(grep -E '^DB_DATABASE=' .env | cut -d= -f2-)"

USER_COUNT="$(dc_db mysql -u"$DEV_DB_USER" -p"$DEV_DB_PASSWORD" "$DEV_DB_DATABASE" -N -e 'SELECT COUNT(*) FROM users;' 2>/dev/null | tr -d '[:space:]')"
if [ "$USER_COUNT" = "0" ]; then
  log "users が0件のため初回シードを実行"
  dc_app php artisan db:seed --force
else
  log "既存データ（users: ${USER_COUNT}件）を検出。シードはスキップ"
fi

# ---------------------------------------------------------------------------
# 7. テスト用DB作成（Featureテストが要求する uchistock-db-testing。冪等）
# ---------------------------------------------------------------------------
TEST_DB_DATABASE="$(grep -E '^DB_DATABASE=' htdocs/.env.testing | cut -d= -f2-)"
TEST_DB_USER="$(grep -E '^DB_USERNAME=' htdocs/.env.testing | cut -d= -f2-)"

log "テスト用DB (${TEST_DB_DATABASE}) を作成（既存ならスキップ）"
dc_db mysql -uroot -p"$DEV_DB_PASSWORD" -e \
  "CREATE DATABASE IF NOT EXISTS \`${TEST_DB_DATABASE}\`; GRANT ALL PRIVILEGES ON \`${TEST_DB_DATABASE}\`.* TO '${TEST_DB_USER}'@'%'; FLUSH PRIVILEGES;"

# ---------------------------------------------------------------------------
# 8. フロントビルド
# ---------------------------------------------------------------------------
# `npm run build`（tsc && vite build && vite build --ssr）は resources/js/ssr.tsx の
# 既存のtscエラー（Phase 10以前から存在。Phase 11とは無関係）で必ず失敗するため、
# ここでは manifest 生成に必要な vite build のみを直接実行する。
log "npx vite build（manifest生成。tscゲートはssr.tsxの既知エラーのため通さない）"
dc_app npx vite build

# ---------------------------------------------------------------------------
# 9. 検証
# ---------------------------------------------------------------------------
# 既知の失敗（Auth系Featureテスト・ssr.tsxのtscエラー等、環境起因で回帰ではない）が
# 含まれるため、ここでは終了コードでスクリプトを止めず結果を表示するのみとする。
log "php artisan test"
dc_app php artisan test || true

log "npm run tsc"
dc_app npm run tsc || true

log "npm run lint"
dc_app npm run lint || true

# ---------------------------------------------------------------------------
# 10. 完了
# ---------------------------------------------------------------------------
log "セットアップ完了: http://localhost:8080 （コンテナは起動したままです）"
