import express from 'express';
import { getPlayersController, loginPlayerController, logoutPlayerController } from '../controllers/playersController';

const router = express.Router();

router.get('/players', getPlayersController);
router.post('/players/login', loginPlayerController);
router.post('/players/logout', logoutPlayerController);

export default router;
