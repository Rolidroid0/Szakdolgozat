import express from 'express';
import { getTerritoriesController, getTerritoryController } from '../controllers/territoriesController';

const router = express.Router();

router.get('/territories', getTerritoriesController);
router.get('/territories/:territoryId', getTerritoryController);

export default router;