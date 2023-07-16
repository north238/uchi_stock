import { Router } from "express";
import { createStocker, deleteStocker, getStocker, renderStocker, updateStocker } from '../controllers/stocker';
import { catchAsync } from "../utils/catchAsync";


const router = Router();

router.get('/get', catchAsync(getStocker));

router.post('/save', catchAsync(createStocker));

router.get('/render', renderStocker);

router.patch('/update/:id', updateStocker);

router.delete('/delete/:id', deleteStocker);

export default router;