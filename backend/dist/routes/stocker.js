"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stocker_1 = require("../controllers/stocker");
const catchAsync_1 = require("../utils/catchAsync");
const router = (0, express_1.Router)();
router.get('/', (0, catchAsync_1.catchAsync)(stocker_1.getStocker));
router.post('/addProducts', (0, catchAsync_1.catchAsync)(stocker_1.createStocker));
router.patch('/update/:id', stocker_1.updateStocker);
router.delete('/delete/:id', stocker_1.deleteStocker);
exports.default = router;
//# sourceMappingURL=stocker.js.map