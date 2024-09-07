import express from 'express';
import { getManeuverableTerritoriesController, getTerritoriesController, getTerritoryController } from '../controllers/territoriesController';

const router = express.Router();

router.get('/territories', getTerritoriesController);
router.get('/territories/maneuverable', getManeuverableTerritoriesController);
router.get('/territories/:territoryId', getTerritoryController);

export default router;