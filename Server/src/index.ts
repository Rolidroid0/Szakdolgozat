/*import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import { WebSocketServer, WebSocket } from 'ws';

// MongoDB szerver csatlakoztatása
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

mongoose.connect(process.env.MONGODB_URI || '')
    .then(() => {
        console.log('Connected to MongoDB');
    }).catch((error) => {
        console.error('MongoDB connection error:', error);
    });

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// WebSocket szerver inicializálása
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log(`Client disconnected`);
    });
});*/

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectToDb } from './config/db';
import { initializeWebSocket } from './config/websocket';
import kártyákRoutes from './routes/kártyákRoutes';

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

app.use('/api/kártyák', kártyákRoutes);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

initializeWebSocket(server);
