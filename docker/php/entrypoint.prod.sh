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
