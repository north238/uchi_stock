import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

interface Stocker extends Document {
  name: string;
  date: Date;
  quantity: number;
}

const stockerSchema = new Schema<Stocker>({
  name: { type: String, required: true },
  date: { type: Date, default: Date.now },
  quantity: { type: Number, required: true },
});

export const StockerModel = mongoose.model<Stocker>('Stocker', stockerSchema);