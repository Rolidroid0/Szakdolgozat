import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectToDb } from './config/db';
import { initializeWebSocket } from './config/websocket';
import cardsRoutes from './routes/cardsRoutes';
import playersRoutes from './routes/playersRoutes';
import territoriesRoutes from './routes/territoriesRoutes';
import gameRoutes from './routes/gameRoutes';
import battlesRoutes from './routes/battlesRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

connectToDb();

app.use(express.json());

app.use('/api/', cardsRoutes);
app.use('/api/', playersRoutes);
app.use('/api/', territoriesRoutes);
app.use('/api/', gameRoutes);
app.use('/api/', battlesRoutes);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

initializeWebSocket(server);