import express from 'express';
import { startGame } from '../controllers/startGameController';

const router = express.Router();

router.post('/start-game', startGame);

export default router;