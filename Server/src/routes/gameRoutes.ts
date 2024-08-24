import express from 'express';
import { startGame } from '../controllers/startGameController';
import { getCurrentRoundController } from '../controllers/gamesController';

const router = express.Router();

router.post('/start-game', startGame);
router.get('/current-round', getCurrentRoundController);

export default router;