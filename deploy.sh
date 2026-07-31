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
docker compose --env-file ./htdocs/.env -f docker-compose.prod.yml build

echo "==> コンテナ起動（storage:link・キャッシュ最適化は entrypoint が実行）"
# 判断 A: アセットはイメージ内に焼き込み済みのため volume 削除の小細工は不要。
# opcache.validate_timestamps=0 のため、再ビルド＋recreate で確実に新コードへ差し替わる。
docker compose --env-file ./htdocs/.env -f docker-compose.prod.yml up -d --build

echo "==> マイグレーション"
docker compose --env-file ./htdocs/.env -f docker-compose.prod.yml exec -T app php artisan migrate --force

echo "==> 完了"
