// import { RequestHandler } from 'express';
// import { StockerModel } from '../models/stocker';

// export const getStocker: RequestHandler = async (req, res, next) => {
//   const stocker = await StockerModel.find({});
//   res.send(stocker);
// };

// export const createStocker: RequestHandler = async (req, res, next) => {
//   const { name, place, categories, quantity, date } = req.body;
//   const stocker = new StockerModel({ name, place, categories, quantity, date });
//   await stocker.save();
//   res.status(201).send(stocker);
// };

// export const updateStocker: RequestHandler = async (req, res, next) => {
//   const { id } = req.params;
//   const { name, place, categories, quantity, date } = req.body;
//   const stocker = await StockerModel.findByIdAndUpdate(id, {
//     name,
//     place,
//     categories,
//     quantity,
//     date,
//   });
//   await stocker?.save();
//   res.send('Updated successfully!');
// };

// export const patchStocker: RequestHandler = async (req, res, next) => {
//   const { id } = req.params;
//   const { isAddToList } = req.body;
//   const stocker = await StockerModel.findByIdAndUpdate(
//     id,
//     { isAddToList },
//     { new: true }
//   );
//   await stocker?.save();
//   res.send('Patch successfully!');
// };

// export const deleteStocker: RequestHandler = async (req, res, next) => {
//   const { id } = req.params;
//   await StockerModel.findByIdAndDelete(id);
//   res.send('Delete successfully!');
// };
