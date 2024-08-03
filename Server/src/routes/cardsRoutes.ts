import express from 'express';
import { shuffleCards } from '../controllers/shuffleCardsController';

const router = express.Router();

router.post('/shuffle', shuffleCards);

export default router;