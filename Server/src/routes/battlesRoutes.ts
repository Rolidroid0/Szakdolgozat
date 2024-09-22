import express from 'express';
import { getOngoingBattleController, rollDiceController } from '../controllers/battlesController';

const router = express.Router();

router.get('/battles/ongoing', getOngoingBattleController);
router.post('/battles/roll-dice', rollDiceController);

export default router;