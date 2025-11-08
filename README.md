# UchiStock - 家庭在庫管理アプリ

## 概要

UchiStockは、家庭の在庫管理を効率化するためのWebアプリケーションです。音声入力機能を活用し、手軽に在庫の登録・管理ができます。

## 主要機能

- 📦 アイテム管理（登録/編集/削除）
- 🎤 音声入力によるアイテム登録
- 👥 グループ機能（家族間での在庫共有）
- 🏷️ ジャンル・場所による分類
- 🔍 在庫検索
- 📱 レスポンシブデザイン

## 技術スタック

### バックエンド
- Laravel 10.x
- PHP 8.2+
- MySQL 8.0+

### フロントエンド
- TypeScript
- React
- Inertia.js
- TailwindCSS

### その他
- Whisper API（音声認識）
  - 別リポジトリで管理しています。
  - https://github.com/north238/voice-analyzer-api.git
- Docker（開発環境）

## 環境構築

### 必要要件
- Docker Desktop
- Docker Compose v2.x
- Node.js 18+
- Composer 2+

### セットアップ手順

#### Dockerを使用する場合

1. Docker環境の構築
```bash
# Dockerイメージのビルドと起動
docker-compose up -d

# コンテナ内でComposerパッケージをインストール
docker-compose exec app composer install

# コンテナ内でマイグレーションとシーダーを実行
docker-compose exec app php artisan migrate --seed
```

#### ローカル環境を使用する場合

1. リポジトリのクローン
```bash
git clone git@github.com:north238/uchi_stock.git
cd uchi_stock
```

2. 環境設定（Dockerを使用する場合はappコンテナ内で実行）
```bash
# 環境設定ファイルのコピー
cp .env.example .env

# 依存パッケージのインストール
composer install
npm install

# LINE認証の設定
# 1. LINE Developers(https://developers.line.biz/ja/)でチャネルを作成
# 2. .envファイルに以下の値を設定
# LINE_CHANNEL_ID=xxxxx
# LINE_CHANNEL_SECRET=xxxxx
```

3. アプリケーションキーの生成
```bash
php artisan key:generate
```

4. データベースのセットアップ
```bash
# マイグレーションの実行
php artisan migrate

# 初期データの投入
php artisan db:seed
```

5. 開発サーバーの起動
```bash
# Vite（別ターミナルで）
npm run dev

# アプリケーションにアクセス
open http://localhost:8080
```

## 開発ガイドライン

### コーディング規約
- PSR-12に準拠
- TypeScriptの型定義を厳密に
- コンポーネント単位での開発
- テストカバレッジの維持

### アーキテクチャ
- Controller-Service-Modelパターン
- Repositoryパターン（一部）
- Inertiaによるモノリシック構成

## テスト

```bash
# PHPUnit
php artisan test

```

## JSファイル（記述チェック・フォーマット）
```bash
npm run lint
npm run format
```

## ライセンス

MIT License

## 作者
north238
