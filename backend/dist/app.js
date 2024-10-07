"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import stockerRoutes from './routes/stocker';
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
const body_parser_1 = require("body-parser");
const promise_1 = __importDefault(require("mysql2/promise")); // MySQL2をインポート
const app = (0, express_1.default)();
dotenv.config();
// MySQL接続の設定
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'your_username',
    password: process.env.DB_PASS || 'your_password',
    database: process.env.DB_NAME || 'your_database',
};
const pool = promise_1.default.createPool(dbConfig); // プールを作成
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
const allowedOrigins = ['http://localhost:3000'];
const options = {
    origin: allowedOrigins,
};
app.use((0, cors_1.default)(options));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, body_parser_1.json)());
app.use(express_1.default.static('public'));
// app.use('/stocker', stockerRoutes);
// エラーハンドリング
app.use('*', (err, req, res, next) => {
    if (!err.message) {
        err.message = '問題が起きました';
    }
    res.status(500).render('error', { err });
});
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`${port} Server is running ...`));
//# sourceMappingURL=app.js.map