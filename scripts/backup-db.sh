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
