import express from 'express';
import { getOngoingBattleController } from '../controllers/battlesController';

const router = express.Router();

router.get('/battles/ongoing', getOngoingBattleController);

export default router;