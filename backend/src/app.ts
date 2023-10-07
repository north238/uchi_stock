import express, { Request, Response, NextFunction } from 'express';
import stockerRoutes from './routes/stocker';
import mongodb from 'mongodb';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { json } from 'body-parser';

const app = express();
dotenv.config();

const mongoUri = process.env.DB_URI;

mongoose
  .connect(mongoUri!)
  .then(() => {
    console.log('MongoDB connection OK!!!');
  })
  .catch((err) => {
    console.log('MongoDB connection error!!!');
    console.log(err);
  });

const allowedOrigins = ['https://stocker-h3dq.onrender.com', 'https://stocker-sage.vercel.app'];
const options: cors.CorsOptions = {
  origin: allowedOrigins,
};
app.use(cors(options));
app.use(express.urlencoded({ extended: true }));
app.use(json());
app.use(express.static('public'));

app.use('/stocker', stockerRoutes);

app.use('*', (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (!err.message) {
    err.message = '問題が起きました';
  }
  res.status(500).render('error', { err });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`${port} Server is running ...`));
