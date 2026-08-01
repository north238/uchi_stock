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
docker compose --env-file ./htdocs/.env -f docker-compose.prod.yml exec -T db sh -c \
  'mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" --single-transaction --quick --lock-tables=false "$MYSQL_DATABASE"' \
  | gzip > "$OUTFILE"

echo "==> 古い世代を削除（${KEEP_GENERATIONS} 世代保持）"
ls -1t "$BACKUP_DIR"/uchistock_*.sql.gz 2>/dev/null \
  | tail -n +$((KEEP_GENERATIONS + 1)) \
  | xargs -r rm -v

echo "==> 完了: $(ls -1 "$BACKUP_DIR"/uchistock_*.sql.gz | wc -l) 世代保持中"
