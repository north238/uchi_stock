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
