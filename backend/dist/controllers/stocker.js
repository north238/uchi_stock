"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStocker = exports.patchStocker = exports.updateStocker = exports.createStocker = exports.getStocker = void 0;
const stocker_1 = require("../models/stocker");
const getStocker = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const stocker = yield stocker_1.StockerModel.find({});
    res.send(stocker);
});
exports.getStocker = getStocker;
const createStocker = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, place, quantity, date } = req.body;
    const stocker = new stocker_1.StockerModel({ name, place, quantity, date });
    yield stocker.save();
    res.status(201).send(stocker);
});
exports.createStocker = createStocker;
const updateStocker = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, place, quantity, date } = req.body;
    const stocker = yield stocker_1.StockerModel.findByIdAndUpdate(id, {
        name,
        place,
        quantity,
        date,
    });
    yield (stocker === null || stocker === void 0 ? void 0 : stocker.save());
    res.send('Updated successfully!');
});
exports.updateStocker = updateStocker;
const patchStocker = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { isAddToList } = req.body;
    const stocker = yield stocker_1.StockerModel.findByIdAndUpdate(id, { isAddToList }, { new: true });
    yield (stocker === null || stocker === void 0 ? void 0 : stocker.save());
    res.send('Patch successfully!');
});
exports.patchStocker = patchStocker;
const deleteStocker = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield stocker_1.StockerModel.findByIdAndDelete(id);
    res.send('Delete successfully!');
});
exports.deleteStocker = deleteStocker;
//# sourceMappingURL=stocker.js.map