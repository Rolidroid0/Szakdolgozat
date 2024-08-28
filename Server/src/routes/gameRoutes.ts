import express from 'express';
import { startGame } from '../controllers/startGameController';
import { endPhaseController, getCurrentRoundController } from '../controllers/gamesController';

const router = express.Router();

router.post('/start-game', startGame);
router.get('/current-round', getCurrentRoundController);
router.post('/end-phase', endPhaseController);

export default router;