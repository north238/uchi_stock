import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

interface Stocker extends Document {
  name: string;
  quantity: number;
  date: Date;
}

const stockerSchema = new Schema<Stocker>({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

export const StockerModel = mongoose.model<Stocker>('Stocker', stockerSchema);