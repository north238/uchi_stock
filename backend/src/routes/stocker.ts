import { Router } from "express";
import { createStocker, deleteStocker, getStocker, renderStocker, updateStocker } from '../controllers/stocker';
import { catchAsync } from "../utils/catchAsync";


const router = Router();

router.get('/', catchAsync(getStocker));

router.post('/addProducts', catchAsync(createStocker));

router.put('/update/:id', updateStocker);

router.delete('/delete/:id', deleteStocker);

export default router;