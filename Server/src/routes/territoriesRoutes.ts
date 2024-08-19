import express from 'express';
import { getTerritoriesController } from '../controllers/territoriesController';

const router = express.Router();

router.get('/territories', getTerritoriesController);

export default router;