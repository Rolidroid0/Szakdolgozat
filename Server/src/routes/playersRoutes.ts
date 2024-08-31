import express from 'express';
import { getPlayerController, getPlayersController, loginPlayerController, logoutPlayerController } from '../controllers/playersController';

const router = express.Router();

router.get('/players', getPlayersController);
router.get('/players/:playerId', getPlayerController);
router.post('/players/login', loginPlayerController);
router.post('/players/logout', logoutPlayerController);

export default router;
