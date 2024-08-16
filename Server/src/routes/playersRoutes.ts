import express from 'express';
import { getPlayersController } from '../controllers/playersController';

const router = express.Router();

router.get('/players', getPlayersController);

export default router;
