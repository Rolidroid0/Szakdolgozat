import express from 'express';
import { startGame } from '../controllers/startGameController';
import { endPhaseController, getCurrentRoundController, getOngoingGameController } from '../controllers/gamesController';

const router = express.Router();

router.get('/games/ongoing', getOngoingGameController);
router.post('/start-game', startGame);
router.get('/current-round', getCurrentRoundController);
router.post('/end-phase', endPhaseController);

export default router;