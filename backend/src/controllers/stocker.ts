import { RequestHandler } from 'express';
import { StockerModel } from '../models/stocker';

export const getStocker: RequestHandler = async (req, res, next) => {
  const stocker = await StockerModel.find({});
  res.send(stocker);
};

export const createStocker: RequestHandler = async (req, res, next) => {
  const { name, place, quantity, date } = req.body;
  const stocker = new StockerModel({ name, place, quantity, date });
  await stocker.save();
  res.status(201).send(stocker);
};

export const renderStocker: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  const stocker = await StockerModel.findById(id);
  if (!stocker) {
    return res.send('Stocker not found!');
  }
  res.send(stocker);
};

export const updateStocker: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  const { name, place, quantity, date } = req.body;
  const stocker = await StockerModel.findByIdAndUpdate(id, {
    name,
    place,
    quantity,
    date,
  });
  await stocker?.save();
  res.send('Updated successfully!');
};

export const deleteStocker: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  await StockerModel.findByIdAndDelete(id);
  res.send('Delete successfully!');
};
