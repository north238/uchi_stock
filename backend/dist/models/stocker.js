"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockerModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const stockerSchema = new Schema({
    name: { type: String, required: true },
    place: { type: String, default: '納戸' },
    quantity: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});
exports.StockerModel = mongoose_1.default.model('Stocker', stockerSchema);
//# sourceMappingURL=stocker.js.map