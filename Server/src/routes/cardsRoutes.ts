import express from 'express';
import { getPlayerCards, shuffleCards, tradeCards } from '../controllers/cardsController';

const router = express.Router();

router.get('/cards/:playerId', getPlayerCards);
router.post('/cards/shuffle', shuffleCards);
router.post('/cards/trade', tradeCards);

export default router;