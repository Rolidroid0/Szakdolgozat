import express from 'express';
import { startGame } from '../controllers/startGameController';
import { endPhaseController, getCurrentRoundController, getOngoingGameController, letAIDecideAttackController } from '../controllers/gamesController';

const router = express.Router();

router.get('/games/ongoing', getOngoingGameController);
router.post('/start-game', startGame);
router.get('/current-round', getCurrentRoundController);
router.post('/end-phase', endPhaseController);
router.post('/let-ai-decide', letAIDecideAttackController);

export default router;