import express, { Request, Response, NextFunction } from 'express';
// import stockerRoutes from './routes/stocker';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { json } from 'body-parser';
import mysql from 'mysql2/promise'; // MySQL2をインポート

const app = express();
dotenv.config();

// MySQL接続の設定
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'your_username',
  password: process.env.DB_PASS || 'your_password',
  database: process.env.DB_NAME || 'your_database',
};

const pool = mysql.createPool(dbConfig); // プールを作成

// MySQL接続のテスト
pool
  .getConnection()
  .then((connection) => {
    console.log('MySQL connection OK!!!');
    connection.release(); // 接続を解放
  })
  .catch((err) => {
    console.log('MySQL connection error!!!');
    console.log(err);
  });

const allowedOrigins = ['http://localhost:3030'];
const options: cors.CorsOptions = {
  origin: allowedOrigins,
};
app.use(cors(options));
app.use(express.urlencoded({ extended: true }));
app.use(json());
app.use(express.static('public'));

// app.use('/stocker', stockerRoutes);

// エラーハンドリング
app.use('*', (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (!err.message) {
    err.message = '問題が起きました';
  }
  res.status(500).render('error', { err });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`${port} Server is running ...`));
