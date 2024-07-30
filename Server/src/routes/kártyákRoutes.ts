import express from 'express';
import { keverKártyák } from '../controllers/keverKártyákController';

const router = express.Router();

router.post('/kever', keverKártyák);

export default router;
